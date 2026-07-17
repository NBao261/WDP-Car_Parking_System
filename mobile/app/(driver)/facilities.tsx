import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from "../../src/constants/theme";
import { api, vehicleTypeApi } from "../../src/services/api";
import { Facility } from "../../src/types/facility.types";

function OccupancyBar({
  total = 100,
  available = 60,
}: {
  total?: number;
  available?: number;
}) {
  const pct = total > 0 ? Math.round((available / total) * 100) : 0;
  const color =
    pct > 50 ? Colors.success : pct > 20 ? Colors.warning : Colors.danger;
  return (
    <View>
      <View style={styles.occupancyTrack}>
        <View
          style={[
            styles.occupancyFill,
            { width: `${pct}%` as any, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={[styles.occupancyLabel, { color }]}>{pct}% còn trống</Text>
    </View>
  );
}

/** So sánh giờ hiện tại với giờ mở/đóng cửa của bãi xe */
function isFacilityOpenNow(facility: Facility): boolean {
  // Nếu status không phải active → luôn đóng cửa
  if (facility.status !== "active") return false;

  const open = (facility as any).openTime as string | undefined;
  const close = (facility as any).closeTime as string | undefined;
  if (!open || !close) return true; // Không có giờ → mặc định mở

  const now = new Date();
  const [openH, openM] = open.split(":").map(Number);
  const [closeH, closeM] = close.split(":").map(Number);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const openMins = openH * 60 + openM;
  const closeMins = closeH * 60 + closeM;

  // Xử lý trường hợp qua nửa đêm (ví dụ: 22:00 – 06:00)
  if (closeMins <= openMins) {
    return nowMins >= openMins || nowMins < closeMins;
  }
  return nowMins >= openMins && nowMins < closeMins;
}

function FacilityCard({
  facility,
  onPress,
}: {
  facility: Facility;
  onPress: () => void;
}) {
  const isOpen = isFacilityOpenNow(facility);
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Lime/gray top accent bar */}
      <View
        style={[
          styles.cardAccent,
          { backgroundColor: isOpen ? Colors.brandLime : Colors.brandGrayText },
        ]}
      />

      <View style={styles.cardBody}>
        {/* Header row */}
        <View style={styles.cardHeader}>
          <View style={styles.cardIconWrap}>
            <Ionicons name="business" size={20} color={Colors.brandDark} />
          </View>
          <View style={styles.cardTitleWrap}>
            <Text style={styles.cardName} numberOfLines={1}>
              {facility.name}
            </Text>
            <View style={styles.addressRow}>
              <Ionicons
                name="location-outline"
                size={12}
                color={Colors.textTertiary}
              />
              <Text style={styles.cardAddress} numberOfLines={1}>
                {facility.address}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: isOpen
                  ? 'rgba(164, 255, 7, 0.15)'
                  : Colors.brandGray,
              },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isOpen ? Colors.brandLime : Colors.brandGrayText },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: isOpen ? '#304f00' : Colors.brandGrayText },
              ]}
            >
              {isOpen ? "Mở cửa" : "Đóng cửa"}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Details row */}
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Ionicons
              name="time-outline"
              size={14}
              color={Colors.textTertiary}
            />
            <Text style={styles.detailText}>
              {(facility as any).openTime || "06:00"} –{" "}
              {(facility as any).closeTime || "22:00"}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons
              name="layers-outline"
              size={14}
              color={Colors.textTertiary}
            />
            <Text style={styles.detailText}>
              {(facility as any).totalFloors ?? 0} tầng
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons
              name="car-outline"
              size={14}
              color={Colors.textTertiary}
            />
            <Text style={styles.detailText}>
              {(facility as any).availableSlots ?? "—"} chỗ trống
            </Text>
          </View>
        </View>

        {/* CTA — dark pill like reference */}
        <TouchableOpacity style={[styles.cta, !isOpen && styles.ctaDisabled]} onPress={onPress} disabled={!isOpen}>
          <Text style={[styles.ctaText, !isOpen && styles.ctaTextDisabled]}>Xem chi tiết & Đặt chỗ</Text>
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
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [vehicleTypeIdFilter, setVehicleTypeIdFilter] = useState<string>("all");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchFacilities = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      // Gọi API với status='all' để lấy tất cả, sau đó lọc local theo thời gian thực
      const data = await api.getPublicFacilities(
        1,
        50,
        debouncedSearch,
        "all",
        vehicleTypeIdFilter,
      );

      // Tính số chỗ trống cho từng bãi xe
      const withSlots = await Promise.all(
        data.map(async (f: any) => {
          try {
            const slots = await api.getAvailableSlots(f._id);
            const total = slots.reduce(
              (sum: number, s: any) => sum + s.availableCount,
              0,
            );
            return { ...f, availableSlots: total };
          } catch {
            return { ...f, availableSlots: null };
          }
        }),
      );

      let processed = withSlots;

      // 1. Lọc theo trạng thái đóng/mở thực tế
      if (statusFilter === "active") {
        processed = processed.filter((f) => isFacilityOpenNow(f));
      } else if (statusFilter === "inactive") {
        processed = processed.filter((f) => !isFacilityOpenNow(f));
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
      console.log("Failed to fetch facilities", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, [debouncedSearch, statusFilter, vehicleTypeIdFilter]);

  useEffect(() => {
    vehicleTypeApi
      .getVehicleTypes()
      .then((r: any) => {
        if (r.success) setVehicleTypes(r.data);
      })
      .catch(() => {});
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFacilities(true);
  };

  const statusChips = [
    { key: "all" as const, label: "Tất cả" },
    { key: "active" as const, label: "Mở cửa" },
    { key: "inactive" as const, label: "Đóng cửa" },
  ];

  return (
    <View style={styles.root}>
      {/* ── White Header ── */}
      <SafeAreaView edges={["top"]} style={{ backgroundColor: Colors.white }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bãi đỗ xe</Text>
        </View>
      </SafeAreaView>

      {/* ── Search bar — gray pill ── */}
      <View style={styles.searchOuter}>
        <View style={styles.searchWrap}>
          <Ionicons
            name="search-outline"
            size={18}
            color={Colors.brandGrayText}
            style={{ marginLeft: 14 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm bãi đỗ xe..."
            placeholderTextColor={Colors.brandGrayText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={{ paddingRight: 14 }}
            >
              <Ionicons
                name="close-circle"
                size={18}
                color={Colors.brandGrayText}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Filter chips ── */}
      <View style={styles.filtersWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {/* Status filters */}
          {statusChips.map((chip) => (
            <TouchableOpacity
              key={chip.key}
              style={[
                styles.chip,
                statusFilter === chip.key && styles.chipActive,
              ]}
              onPress={() => setStatusFilter(chip.key)}
            >
              <Text
                style={[
                  styles.chipText,
                  statusFilter === chip.key && styles.chipTextActive,
                ]}
              >
                {chip.label}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Separator */}
          <View style={styles.chipSep} />

          {/* Vehicle type filters */}
          <TouchableOpacity
            style={[
              styles.chip,
              vehicleTypeIdFilter === "all" && styles.chipActive,
            ]}
            onPress={() => setVehicleTypeIdFilter("all")}
          >
            <Text
              style={[
                styles.chipText,
                vehicleTypeIdFilter === "all" && styles.chipTextActive,
              ]}
            >
              Tất cả xe
            </Text>
          </TouchableOpacity>
          {vehicleTypes.map((type) => (
            <TouchableOpacity
              key={type._id}
              style={[
                styles.chip,
                vehicleTypeIdFilter === type._id && styles.chipActive,
              ]}
              onPress={() => setVehicleTypeIdFilter(type._id)}
            >
              <Text
                style={[
                  styles.chipText,
                  vehicleTypeIdFilter === type._id && styles.chipTextActive,
                ]}
              >
                {type.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Content ── */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.brandDark} />
          <Text style={styles.loadingText}>Đang tải danh sách...</Text>
        </View>
      ) : (
        <FlatList
          data={facilities}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.brandDark}
            />
          }
          renderItem={({ item }) => (
            <FacilityCard
              facility={item}
              onPress={() => router.push(`/facility/${item._id}`)}
            />
          )}
          ListHeaderComponent={
            facilities.length > 0 ? (
              <Text style={styles.resultCount}>
                {facilities.length} bãi xe tìm thấy
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="business-outline"
                  size={32}
                  color={Colors.brandGrayText}
                />
              </View>
              <Text style={styles.emptyTitle}>Không tìm thấy bãi xe</Text>
              <Text style={styles.emptySub}>
                Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },

  // Header — white flat
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: Colors.brandGray,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.brandDark,
  },

  // Search — gray pill
  searchOuter: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brandGray,
    borderRadius: 9999,
    height: 46,
  },
  searchInput: {
    flex: 1,
    height: 46,
    paddingHorizontal: 10,
    fontSize: 13,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.brandDark,
  },

  // Filters — lime active chips
  filtersWrap: {
    paddingBottom: 4,
  },
  filtersScroll: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9999,
    backgroundColor: Colors.brandGray,
  },
  chipActive: {
    backgroundColor: Colors.brandLime,
  },
  chipText: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.brandGrayText,
  },
  chipTextActive: { color: Colors.brandDark },
  chipSep: {
    width: 1,
    height: 20,
    backgroundColor: Colors.brandGray,
    alignSelf: 'center',
    marginHorizontal: 4,
  },

  // List
  listContent: { padding: 16, paddingBottom: 32 },
  resultCount: {
    fontSize: 12,
    color: Colors.brandGrayText,
    fontFamily: Typography.fontFamily.bold,
    marginBottom: 10,
  },

  // Facility Card — white rounded-24 with border
  card: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.brandGray,
    ...Shadows.sm,
  },
  cardAccent: { height: 5 },
  cardBody: { padding: 16, paddingTop: 18 },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  cardIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: Colors.brandGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleWrap: { flex: 1 },
  cardName: {
    fontSize: 15,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.brandDark,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
  },
  cardAddress: {
    fontSize: 11,
    color: Colors.brandGrayText,
    fontFamily: Typography.fontFamily.bold,
    flex: 1,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 10, fontFamily: Typography.fontFamily.bold, textTransform: 'uppercase', letterSpacing: 0.5 },

  divider: { height: 0 }, // removed visual divider

  // Details specs grid — like reference 3-col
  detailsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: Colors.brandGray + '99',
    borderRadius: 14,
    gap: 4,
  },
  detailText: {
    fontSize: 10,
    color: Colors.brandGrayText,
    fontFamily: Typography.fontFamily.bold,
    textAlign: 'center',
  },

  // Occupancy
  occupancyTrack: {
    height: 4,
    backgroundColor: Colors.brandGray,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 3,
  },
  occupancyFill: { height: '100%', borderRadius: 2 },
  occupancyLabel: { fontSize: 11, fontFamily: Typography.fontFamily.medium },

  // CTA — dark pill like reference
  cta: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.brandDark,
    borderRadius: 9999,
    paddingVertical: 14,
  },
  ctaText: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.white,
  },
  ctaDisabled: {
    backgroundColor: Colors.brandGray,
  },
  ctaTextDisabled: {
    color: Colors.brandGrayText,
  },

  // States
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  loadingText: {
    fontSize: 13,
    color: Colors.brandGrayText,
    fontFamily: Typography.fontFamily.medium,
  },

  emptyWrap: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.brandGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.brandDark,
    marginBottom: 6,
  },
  emptySub: { fontSize: 12, color: Colors.brandGrayText, textAlign: 'center' },
});
