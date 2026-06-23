import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
  ActivityIndicator, ScrollView, TouchableOpacity, TextInput, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/constants/theme';
import { api, vehicleTypeApi } from '../../src/services/api';
import { Facility } from '../../src/types/facility.types';

function OccupancyBar({ total = 100, available = 60 }: { total?: number; available?: number }) {
  const pct = total > 0 ? Math.round((available / total) * 100) : 0;
  const color = pct > 50 ? Colors.success : pct > 20 ? Colors.warning : Colors.danger;
  return (
    <View>
      <View style={styles.occupancyTrack}>
        <View style={[styles.occupancyFill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={[styles.occupancyLabel, { color }]}>{pct}% còn trống</Text>
    </View>
  );
}

/** So sánh giờ hiện tại với giờ mở/đóng cửa của bãi xe */
function isFacilityOpenNow(facility: Facility): boolean {
  // Nếu status không phải active → luôn đóng cửa
  if (facility.status !== 'active') return false;

  const open = (facility as any).openTime as string | undefined;
  const close = (facility as any).closeTime as string | undefined;
  if (!open || !close) return true; // Không có giờ → mặc định mở

  const now = new Date();
  const [openH, openM] = open.split(':').map(Number);
  const [closeH, closeM] = close.split(':').map(Number);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const openMins = openH * 60 + openM;
  const closeMins = closeH * 60 + closeM;

  // Xử lý trường hợp qua nửa đêm (ví dụ: 22:00 – 06:00)
  if (closeMins <= openMins) {
    return nowMins >= openMins || nowMins < closeMins;
  }
  return nowMins >= openMins && nowMins < closeMins;
}

function FacilityCard({ facility, onPress }: { facility: Facility; onPress: () => void }) {
  const isOpen = isFacilityOpenNow(facility);
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Colored top bar */}
      <View style={[styles.cardAccent, { backgroundColor: isOpen ? Colors.success : Colors.danger }]} />

      <View style={styles.cardBody}>
        {/* Header row */}
        <View style={styles.cardHeader}>
          <View style={styles.cardIconWrap}>
            <Ionicons name="business" size={20} color={Colors.primary} />
          </View>
          <View style={styles.cardTitleWrap}>
            <Text style={styles.cardName} numberOfLines={1}>{facility.name}</Text>
            <View style={styles.addressRow}>
              <Ionicons name="location-outline" size={12} color={Colors.textTertiary} />
              <Text style={styles.cardAddress} numberOfLines={1}>{facility.address}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: isOpen ? Colors.successLight : Colors.dangerLight }]}>
            <View style={[styles.statusDot, { backgroundColor: isOpen ? Colors.success : Colors.danger }]} />
            <Text style={[styles.statusText, { color: isOpen ? Colors.success : Colors.danger }]}>
              {isOpen ? 'Mở cửa' : 'Đóng cửa'}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Details row */}
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={14} color={Colors.textTertiary} />
            <Text style={styles.detailText}>
              {(facility as any).openTime || '06:00'} – {(facility as any).closeTime || '22:00'}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="layers-outline" size={14} color={Colors.textTertiary} />
            <Text style={styles.detailText}>
              {(facility as any).totalFloors ?? 0} tầng
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="car-outline" size={14} color={Colors.textTertiary} />
            <Text style={styles.detailText}>
              {(facility as any).availableSlots ?? '—'} chỗ trống
            </Text>
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.cta} onPress={onPress}>
          <Text style={styles.ctaText}>Xem chi tiết & Đặt chỗ</Text>
          <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function FacilitiesScreen() {
  const router = useRouter();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [vehicleTypeIdFilter, setVehicleTypeIdFilter] = useState<string>('all');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchFacilities = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      // Gọi API với status='all' để lấy tất cả, sau đó lọc local theo thời gian thực
      const data = await api.getPublicFacilities(1, 50, debouncedSearch, 'all', vehicleTypeIdFilter);
      
      // Tính số chỗ trống cho từng bãi xe
      const withSlots = await Promise.all(
        data.map(async (f: any) => {
          try {
            const slots = await api.getAvailableSlots(f._id);
            const total = slots.reduce((sum: number, s: any) => sum + s.availableCount, 0);
            return { ...f, availableSlots: total };
          } catch {
            return { ...f, availableSlots: null };
          }
        })
      );

      let processed = withSlots;

      // 1. Lọc theo trạng thái đóng/mở thực tế
      if (statusFilter === 'active') {
        processed = processed.filter(f => isFacilityOpenNow(f));
      } else if (statusFilter === 'inactive') {
        processed = processed.filter(f => !isFacilityOpenNow(f));
      }

      // 2. Sắp xếp: Ưu tiên bãi đang mở cửa lên trước, sau đó sắp xếp theo số chỗ trống giảm dần
      processed.sort((a, b) => {
        const aOpen = isFacilityOpenNow(a) ? 1 : 0;
        const bOpen = isFacilityOpenNow(b) ? 1 : 0;
        if (aOpen !== bOpen) {
          return bOpen - aOpen; // 1 (mở) lên trước 0 (đóng)
        }
        const aSlots = a.availableSlots || 0;
        const bSlots = b.availableSlots || 0;
        return bSlots - aSlots; // Nhiều chỗ trống hơn lên trước
      });

      setFacilities(processed);
    } catch (error) {
      console.log('Failed to fetch facilities', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchFacilities(); }, [debouncedSearch, statusFilter, vehicleTypeIdFilter]);

  useEffect(() => {
    vehicleTypeApi.getVehicleTypes()
      .then((r: any) => { if (r.success) setVehicleTypes(r.data); })
      .catch(() => {});
  }, []);

  const onRefresh = () => { setRefreshing(true); fetchFacilities(true); };

  const statusChips = [
    { key: 'all' as const,      label: 'Tất cả'   },
    { key: 'active' as const,   label: 'Mở cửa'   },
    { key: 'inactive' as const, label: 'Đóng cửa' },
  ];

  return (
    <View style={styles.root}>
      {/* ── Gradient Header ── */}
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientMid]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <SafeAreaView edges={['top']}>
            <Image source={require('../../assets/images/logo.png')} style={{ width: 100, height: 28, resizeMode: 'contain', marginTop: 12 }} />
            <Text style={styles.headerTitle}>Bãi đỗ xe</Text>
            <Text style={styles.headerSub}>Tìm và chọn bãi xe phù hợp</Text>

            {/* Search bar */}
            <View style={styles.searchWrap}>
              <Ionicons name="search-outline" size={18} color={Colors.textSecondary} style={{ marginLeft: 12 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm bãi xe, địa chỉ..."
                placeholderTextColor={Colors.placeholder}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={{ paddingRight: 12 }}>
                  <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
                </TouchableOpacity>
              )}
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>

      {/* ── Filter chips ── */}
      <View style={styles.filtersWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          {/* Status filters */}
          {statusChips.map(chip => (
            <TouchableOpacity
              key={chip.key}
              style={[styles.chip, statusFilter === chip.key && styles.chipActive]}
              onPress={() => setStatusFilter(chip.key)}
            >
              <Text style={[styles.chipText, statusFilter === chip.key && styles.chipTextActive]}>
                {chip.label}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Separator */}
          <View style={styles.chipSep} />

          {/* Vehicle type filters */}
          <TouchableOpacity
            style={[styles.chip, vehicleTypeIdFilter === 'all' && styles.chipActive]}
            onPress={() => setVehicleTypeIdFilter('all')}
          >
            <Ionicons name="car-outline" size={13} color={vehicleTypeIdFilter === 'all' ? Colors.primary : Colors.textSecondary} />
            <Text style={[styles.chipText, vehicleTypeIdFilter === 'all' && styles.chipTextActive]}>Tất cả xe</Text>
          </TouchableOpacity>
          {vehicleTypes.map(type => (
            <TouchableOpacity
              key={type._id}
              style={[styles.chip, vehicleTypeIdFilter === type._id && styles.chipActive]}
              onPress={() => setVehicleTypeIdFilter(type._id)}
            >
              <Text style={[styles.chipText, vehicleTypeIdFilter === type._id && styles.chipTextActive]}>
                {type.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Content ── */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải danh sách...</Text>
        </View>
      ) : (
        <FlatList
          data={facilities}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          renderItem={({ item }) => (
            <FacilityCard
              facility={item}
              onPress={() => router.push(`/facility/${item._id}`)}
            />
          )}
          ListHeaderComponent={
            facilities.length > 0 ? (
              <Text style={styles.resultCount}>{facilities.length} bãi xe tìm thấy</Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIcon}>
                <Ionicons name="business-outline" size={32} color={Colors.textTertiary} />
              </View>
              <Text style={styles.emptyTitle}>Không tìm thấy bãi xe</Text>
              <Text style={styles.emptySub}>Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  // Header
  headerWrapper: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 22,
  },
  headerTitle: { fontSize: 26, fontFamily: Typography.fontFamily.bold, color: Colors.textOnDark, marginTop: 8 },
  headerSub: { fontSize: 13, color: Colors.textOnDarkMuted, fontFamily: Typography.fontFamily.regular, marginTop: 3, marginBottom: 16 },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16, overflow: 'hidden',
    shadowColor: '#5E8F25',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  searchInput: {
    flex: 1, height: 46,
    paddingHorizontal: 10,
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
  },

  // Filters
  filtersWrap: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  filtersScroll: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primaryBg,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13, fontFamily: Typography.fontFamily.medium, color: Colors.textSecondary,
  },
  chipTextActive: { color: Colors.primary },
  chipSep: {
    width: 1, height: 20, backgroundColor: Colors.borderLight, alignSelf: 'center', marginHorizontal: 4,
  },

  // List
  listContent: { padding: 16, paddingBottom: 32 },
  resultCount: {
    fontSize: 12, color: Colors.textTertiary, fontFamily: Typography.fontFamily.medium,
    marginBottom: 10,
  },

  // Facility Card
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#5E8F25',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  cardAccent: { height: 4 },
  cardBody: { padding: 16 },

  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  cardIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitleWrap: { flex: 1 },
  cardName: { fontSize: 15, fontFamily: Typography.fontFamily.semiBold, color: Colors.textPrimary },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  cardAddress: { fontSize: 12, color: Colors.textTertiary, fontFamily: Typography.fontFamily.regular, flex: 1 },

  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontFamily: Typography.fontFamily.semiBold },

  divider: { height: 1, backgroundColor: Colors.borderLight, marginBottom: 12 },

  detailsRow: { flexDirection: 'row', gap: 16, marginBottom: 14 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { fontSize: 12, color: Colors.textSecondary, fontFamily: Typography.fontFamily.medium },

  // Occupancy
  occupancyTrack: {
    height: 4, backgroundColor: Colors.surfaceElevated,
    borderRadius: 2, overflow: 'hidden', marginBottom: 3,
  },
  occupancyFill: { height: '100%', borderRadius: 2 },
  occupancyLabel: { fontSize: 11, fontFamily: Typography.fontFamily.medium },

  // CTA
  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: Colors.primaryBg,
    borderRadius: 10, paddingVertical: 10,
  },
  ctaText: { fontSize: 13, fontFamily: Typography.fontFamily.semiBold, color: Colors.primary },

  // States
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  loadingText: { fontSize: 13, color: Colors.textSecondary, fontFamily: Typography.fontFamily.medium },

  emptyWrap: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  emptyTitle: { fontSize: 16, fontFamily: Typography.fontFamily.semiBold, color: Colors.textPrimary, marginBottom: 6 },
  emptySub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },
});
