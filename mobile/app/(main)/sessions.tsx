import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator, RefreshControl, Platform, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/constants/theme';
import { SessionDetailCard, FeeEstimate } from '../../src/components';
import { ParkingSession } from '../../src/types/session.types';
import { Reservation } from '../../src/types/reservation.types';
import { sessionApi, reservationApi } from '../../src/services/api';

type Tab = 'active' | 'reserved' | 'history';

const TABS: { key: Tab; label: string; icon: any }[] = [
  { key: 'active',   label: 'Đang đỗ',  icon: 'car-sport'     },
  { key: 'reserved', label: 'Đặt chỗ',  icon: 'calendar'      },
  { key: 'history',  label: 'Lịch sử',  icon: 'time'          },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    active:     { label: 'Đang đỗ',     color: Colors.success,  bg: Colors.successLight },
    completed:  { label: 'Hoàn thành',  color: Colors.textSecondary, bg: Colors.surfaceElevated },
    pending:    { label: 'Chờ duyệt',   color: Colors.warning,  bg: Colors.warningLight },
    confirmed:  { label: 'Xác nhận',    color: Colors.primary,  bg: Colors.primaryBg },
    used:       { label: 'Đã dùng',     color: Colors.success,  bg: Colors.successLight },
    cancelled:  { label: 'Đã huỷ',      color: Colors.danger,   bg: Colors.dangerLight },
    expired:    { label: 'Hết hạn',     color: Colors.textTertiary, bg: Colors.surfaceElevated },
  };
  const s = map[status] || { label: status, color: Colors.textSecondary, bg: Colors.surfaceElevated };
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
    </View>
  );
}

function SessionCard({ item }: { item: ParkingSession }) {
  const baseFee = (item as any).pricingPlan?.rates?.[0]?.amount || 20000;
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          <View style={[styles.plateWrap, { backgroundColor: Colors.primaryBg }]}>
            <Text style={styles.plateText}>{item.licensePlate}</Text>
          </View>
          <StatusBadge status={item.status} />
        </View>
        <Text style={styles.cardTime}>{new Date(item.checkInTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</Text>
      </View>
      <View style={styles.cardDetails}>
        <View style={styles.cardDetail}>
          <Ionicons name="business-outline" size={13} color={Colors.textTertiary} />
          <Text style={styles.cardDetailText} numberOfLines={1}>{item.facilityName}</Text>
        </View>
        <View style={styles.cardDetail}>
          <Ionicons name="location-outline" size={13} color={Colors.textTertiary} />
          <Text style={styles.cardDetailText}>{item.floorName} · {item.slotCode}</Text>
        </View>
      </View>
      {item.status === 'active' && (
        <View style={styles.feeWrap}>
          <FeeEstimate checkInTime={item.checkInTime} baseFee={baseFee} />
        </View>
      )}
      {item.status === 'completed' && item.totalFee > 0 && (
        <View style={styles.totalFeeRow}>
          <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
          <Text style={styles.totalFeeText}>Tổng: {item.totalFee.toLocaleString('vi-VN')}đ</Text>
        </View>
      )}
    </View>
  );
}

function ReservationCard2({ item, onCancel }: { item: Reservation; onCancel: (id: string) => void }) {
  const checkinAt = new Date((item as any).startTime || (item as any).checkInTime);
  const now = new Date();
  const diffMs = checkinAt.getTime() - now.getTime();
  const diffH = Math.floor(diffMs / 3600000);
  const diffM = Math.floor((diffMs % 3600000) / 60000);
  const isUpcoming = diffMs > 0;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          <View style={[styles.plateWrap, { backgroundColor: Colors.secondaryLight + '18' }]}>
            <Text style={[styles.plateText, { color: Colors.secondary }]}>{item.licensePlate}</Text>
          </View>
          <StatusBadge status={item.status} />
        </View>
        {isUpcoming && (
          <View style={styles.countdownWrap}>
            <Text style={styles.countdownText}>{diffH}h {diffM}m</Text>
            <Text style={styles.countdownLabel}>nữa</Text>
          </View>
        )}
      </View>
      <View style={styles.cardDetails}>
        <View style={styles.cardDetail}>
          <Ionicons name="business-outline" size={13} color={Colors.textTertiary} />
          <Text style={styles.cardDetailText} numberOfLines={1}>{(item as any).facilityId?.name || '—'}</Text>
        </View>
        <View style={styles.cardDetail}>
          <Ionicons name="time-outline" size={13} color={Colors.textTertiary} />
          <Text style={styles.cardDetailText}>
            Vào: {checkinAt.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
      {['pending', 'confirmed'].includes(item.status) && (
        <TouchableOpacity style={styles.cancelBtn} onPress={() => onCancel(item._id)}>
          <Ionicons name="close-circle-outline" size={16} color={Colors.danger} />
          <Text style={styles.cancelBtnText}>Huỷ đặt chỗ</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function EmptyState({ icon, title, subtitle, actionLabel, onAction }: {
  icon: any; title: string; subtitle: string; actionLabel?: string; onAction?: () => void;
}) {
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={32} color={Colors.textTertiary} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.emptyAction} onPress={onAction}>
          <Text style={styles.emptyActionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function ActivityScreen() {
  const router = useRouter();
  const { tab: initialTab } = useLocalSearchParams<{ tab?: Tab }>();
  const [tab, setTab] = useState<Tab>((initialTab as Tab) || 'active');
  const [activeSessions, setActiveSessions] = useState<ParkingSession[]>([]);
  const [histSessions, setHistSessions] = useState<ParkingSession[]>([]);
  const [upcomingRes, setUpcomingRes] = useState<Reservation[]>([]);
  const [histRes, setHistRes] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const mapSession = (s: any): ParkingSession => ({
    _id: s._id, code: s.code, licensePlate: s.licensePlate,
    facilityName: s.facilityId?.name || '—', floorName: s.floorId?.name || '',
    slotCode: s.slotId?.code || '', vehicleTypeName: s.vehicleTypeId?.name || '',
    checkInTime: s.checkInTime, checkOutTime: s.checkOutTime || null,
    status: s.status, totalFee: s.totalFee || 0, pricingPlan: s.pricingPlanId,
  });

  const fetchAll = async () => {
    try {
      const [actRes, histRes2, resRes] = await Promise.all([
        sessionApi.getMySessions('active') as any,
        sessionApi.getMySessions('completed') as any,
        reservationApi.getReservations() as any,
      ]);
      if (actRes?.success)  setActiveSessions(actRes.data.map(mapSession));
      if (histRes2?.success) setHistSessions(histRes2.data.map(mapSession));
      if (resRes?.success) {
        const all: Reservation[] = resRes.data;
        setUpcomingRes(all.filter(r => ['pending','confirmed'].includes(r.status)));
        setHistRes(all.filter(r => ['used','cancelled','expired'].includes(r.status)));
      }
    } catch (e) {
      console.log('Activity fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetchAll(); }, []));
  const onRefresh = () => { setRefreshing(true); fetchAll(); };

  const handleCancelReservation = async (id: string) => {
    try {
      await (reservationApi as any).cancelReservation(id);
      fetchAll();
    } catch (e) { console.log('Cancel error:', e); }
  };

  const renderContent = () => {
    if (loading) return <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />;

    if (tab === 'active') {
      if (!activeSessions.length) return (
        <EmptyState icon="car-outline" title="Không có xe đang đỗ"
          subtitle="Khi bạn gửi xe, thông tin sẽ hiện ở đây"
          actionLabel="Tìm bãi xe" onAction={() => router.push('/(main)/facilities' as any)} />
      );
      return (
        <FlatList
          data={activeSessions}
          keyExtractor={i => i._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <SessionCard item={item} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      );
    }

    if (tab === 'reserved') {
      const data = [...upcomingRes, ...histRes];
      if (!data.length) return (
        <EmptyState icon="calendar-outline" title="Chưa có đặt chỗ nào"
          subtitle="Đặt trước chỗ đỗ để đảm bảo có chỗ khi cần"
          actionLabel="Đặt chỗ ngay" onAction={() => router.push('/(main)/reservations' as any)} />
      );
      return (
        <FlatList
          data={data}
          keyExtractor={i => i._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <ReservationCard2 item={item} onCancel={handleCancelReservation} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      );
    }

    // history tab
    if (!histSessions.length) return (
      <EmptyState icon="time-outline" title="Chưa có lịch sử"
        subtitle="Lượt gửi xe đã hoàn thành sẽ hiện ở đây" />
    );
    return (
      <FlatList
        data={histSessions}
        keyExtractor={i => i._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <SessionCard item={item} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    );
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.headerWrapper}>
        <LinearGradient colors={[Colors.gradientStart, Colors.gradientMid]} style={styles.header}>
          <SafeAreaView edges={['top']}>
            <Image source={require('../../assets/images/logo.png')} style={{ width: 100, height: 28, resizeMode: 'contain', marginTop: 12 }} />
            <Text style={styles.headerTitle}>Hoạt động</Text>
            <Text style={styles.headerSub}>Quản lý lượt gửi &amp; đặt chỗ</Text>
          </SafeAreaView>
        </LinearGradient>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabItem, tab === t.key && styles.tabItemActive]}
            onPress={() => setTab(t.key)}
          >
            <Ionicons name={tab === t.key ? t.icon : `${t.icon}-outline` as any} size={16} color={tab === t.key ? Colors.primary : Colors.textTertiary} />
            <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>{renderContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

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
  headerSub: { fontSize: 13, color: Colors.textOnDarkMuted, fontFamily: Typography.fontFamily.regular, marginTop: 3 },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: { borderBottomColor: Colors.primary },
  tabLabel: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textTertiary,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.semiBold,
  },

  content: { flex: 1 },
  list: { padding: 16, paddingBottom: 32 },

  // Card
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#5E8F25',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  plateWrap: {
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
  },
  plateText: { fontSize: 14, fontFamily: Typography.fontFamily.bold, color: Colors.primary, letterSpacing: 1.5 },
  cardTime: { fontSize: 12, color: Colors.textTertiary, fontFamily: Typography.fontFamily.medium },

  cardDetails: { gap: 4 },
  cardDetail: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  cardDetailText: { fontSize: 13, color: Colors.textSecondary, fontFamily: Typography.fontFamily.regular, flex: 1 },

  feeWrap: { marginTop: 10, borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: 10 },
  totalFeeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  totalFeeText: { fontSize: 13, color: Colors.success, fontFamily: Typography.fontFamily.semiBold },

  // Badge
  badge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontFamily: Typography.fontFamily.semiBold },

  // Countdown
  countdownWrap: { alignItems: 'flex-end' },
  countdownText: { fontSize: 16, fontFamily: Typography.fontFamily.bold, color: Colors.warning },
  countdownLabel: { fontSize: 10, color: Colors.textTertiary, fontFamily: Typography.fontFamily.medium },

  // Cancel
  cancelBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10,
    borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: 10,
  },
  cancelBtnText: { fontSize: 13, color: Colors.danger, fontFamily: Typography.fontFamily.medium },

  // Reservation
  reservedTime: { fontSize: 12, color: Colors.textTertiary, fontFamily: Typography.fontFamily.medium },

  // Empty
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, marginTop: 60 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  emptyTitle: { fontSize: 16, fontFamily: Typography.fontFamily.semiBold, color: Colors.textPrimary, marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  emptyAction: {
    marginTop: 16, backgroundColor: Colors.primary,
    borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10,
  },
  emptyActionText: { color: Colors.white, fontSize: 14, fontFamily: Typography.fontFamily.semiBold },
});
