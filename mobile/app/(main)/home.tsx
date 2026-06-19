import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/useAuthStore';
import { sessionApi, reservationApi } from '../../src/services/api';

function getInitials(name?: string) {
  if (!name) return 'U';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function ElapsedTimer({ checkInTime }: { checkInTime: string }) {
  const [elapsed, setElapsed] = useState('');
  useEffect(() => {
    const update = () => {
      const diff = Date.now() - new Date(checkInTime).getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setElapsed(`${h}h ${m}m`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [checkInTime]);
  return <Text style={styles.timerValue}>{elapsed}</Text>;
}

export default function HomeScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ active: 0, completed: 0, reserved: 0 });
  const [activeSession, setActiveSession] = useState<any>(null);
  const [upcomingRes, setUpcomingRes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [sessRes, resRes] = await Promise.all([
        sessionApi.getMySessions('active') as any,
        reservationApi.getReservations() as any,
      ]);
      
      const sessions = sessRes?.success ? sessRes.data : [];
      const reservations = resRes?.success ? resRes.data : [];
      
      const active = sessions.filter((s: any) => s.status === 'active');
      const completed = sessions.filter((s: any) => s.status === 'completed');
      const reserved = reservations.filter((r: any) => ['pending','confirmed'].includes(r.status));

      // Sort upcoming by startTime asc, take nearest 3
      const upcoming = [...reserved]
        .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        .slice(0, 3);

      setStats({ active: active.length, completed: completed.length, reserved: reserved.length });
      setActiveSession(active[0] || null);
      setUpcomingRes(upcoming);
    } catch (e) {
      console.log('Home fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  const onRefresh = () => { setRefreshing(true); fetchData(); };



  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.white} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Hero Gradient ── */}
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <SafeAreaView edges={['top']}>
            {/* Header row */}
            <View style={styles.heroHeader}>
              <View>
                <Text style={styles.greeting}>Xin chào 👋</Text>
                <Text style={styles.heroName}>{user?.name || 'Tài xế'}</Text>
              </View>
              <TouchableOpacity
                style={styles.avatarCircle}
                onPress={() => router.push('/(main)/account' as any)}
              >
                <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
              </TouchableOpacity>
            </View>



            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNum}>{loading ? '—' : stats.active}</Text>
                <Text style={styles.statLbl}>Đang đỗ</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNum}>{loading ? '—' : stats.reserved}</Text>
                <Text style={styles.statLbl}>Đã đặt</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNum}>{loading ? '—' : stats.completed}</Text>
                <Text style={styles.statLbl}>Hoàn thành</Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* ── Body ── */}
        <View style={styles.body}>



          {/* Active Session */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lượt gửi hiện tại</Text>
            {loading ? (
              <ActivityIndicator color={Colors.primary} style={{ marginTop: 16 }} />
            ) : activeSession ? (
              <TouchableOpacity
                style={styles.activeSessionCard}
                onPress={() => router.push('/(main)/sessions' as any)}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.activeSessionGradient}
                >
                  <View style={styles.activeSessionHeader}>
                    <View>
                      <Text style={styles.asBadge}>🔵 Đang đỗ xe</Text>
                      <Text style={styles.asPlate}>{activeSession.licensePlate}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
                  </View>
                  <View style={styles.asRow}>
                    <View style={styles.asInfo}>
                      <Text style={styles.asLabel}>Bãi xe</Text>
                      <Text style={styles.asValue} numberOfLines={1}>{activeSession.facilityId?.name || '—'}</Text>
                    </View>
                    <View style={styles.asInfo}>
                      <Text style={styles.asLabel}>Vào lúc</Text>
                      <Text style={styles.asValue}>{new Date(activeSession.checkInTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                    <View style={styles.asInfo}>
                      <Text style={styles.asLabel}>Thời gian</Text>
                      <ElapsedTimer checkInTime={activeSession.checkInTime} />
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconWrap}>
                  <Ionicons name="car-outline" size={28} color={Colors.textTertiary} />
                </View>
                <Text style={styles.emptyTitle}>Không có xe đang đỗ</Text>
                <Text style={styles.emptySubtitle}>Tìm bãi xe để bắt đầu gửi xe</Text>
                <TouchableOpacity
                  style={styles.emptyBtn}
                  onPress={() => router.push('/(main)/facilities' as any)}
                >
                  <Text style={styles.emptyBtnText}>Tìm bãi xe</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* ── Upcoming Reservations ── */}
          {upcomingRes.length > 0 && <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Đặt chỗ sắp tới</Text>
              {upcomingRes.length > 0 && (
                <TouchableOpacity onPress={() => router.push('/(main)/sessions?tab=reserved' as any)}>
                  <Text style={styles.sectionLink}>Xem tất cả</Text>
                </TouchableOpacity>
              )}
            </View>
            {loading ? (
              <ActivityIndicator color={Colors.primary} style={{ marginTop: 16 }} />
            ) : upcomingRes.length === 0 ? (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconWrap}>
                  <Ionicons name="calendar-outline" size={28} color={Colors.textTertiary} />
                </View>
                <Text style={styles.emptyTitle}>Chưa có lịch đặt chỗ</Text>
                <Text style={styles.emptySubtitle}>Đặt chỗ trước để đảm bảo vị trí</Text>
                <TouchableOpacity
                  style={styles.emptyBtn}
                  onPress={() => router.push('/(main)/facilities' as any)}
                >
                  <Text style={styles.emptyBtnText}>Tìm bãi xe</Text>
                </TouchableOpacity>
              </View>
            ) : (
              upcomingRes.map((res: any) => {
                const start = new Date(res.startTime);
                const now = new Date();
                const diffMs = start.getTime() - now.getTime();
                const diffH = Math.floor(diffMs / 3600000);
                const diffM = Math.floor((diffMs % 3600000) / 60000);
                const countdown = diffMs <= 0
                  ? 'Đã đến giờ'
                  : diffH > 0 ? `${diffH}h ${diffM}m nữa` : `${diffM} phút nữa`;
                const isUrgent = diffMs > 0 && diffMs < 60 * 60 * 1000; // < 1 hour
                return (
                  <TouchableOpacity
                    key={res._id}
                    style={styles.resCard}
                    onPress={() => router.push('/(main)/sessions?tab=reserved' as any)}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.resAccent, { backgroundColor: isUrgent ? Colors.warning : Colors.secondary }]} />
                    <View style={styles.resBody}>
                      <View style={styles.resHeader}>
                        <View style={styles.resIconWrap}>
                          <Ionicons name="business-outline" size={18} color={Colors.secondary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.resFacility} numberOfLines={1}>
                            {res.facilityId?.name || 'Bãi xe'}
                          </Text>
                          <Text style={styles.resPlate}>{res.licensePlate}</Text>
                        </View>
                        <View style={[styles.countdownBadge, { backgroundColor: isUrgent ? Colors.warning + '18' : Colors.secondaryLight + '18' }]}>
                          <Ionicons name="time-outline" size={12} color={isUrgent ? Colors.warning : Colors.secondary} />
                          <Text style={[styles.countdownText, { color: isUrgent ? Colors.warning : Colors.secondary }]}>
                            {countdown}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.resDetails}>
                        <View style={styles.resDetailItem}>
                          <Ionicons name="calendar-outline" size={13} color={Colors.textTertiary} />
                          <Text style={styles.resDetailText}>
                            {start.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                          </Text>
                        </View>
                        <View style={styles.resDetailItem}>
                          <Ionicons name="time-outline" size={13} color={Colors.textTertiary} />
                          <Text style={styles.resDetailText}>
                            {start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                        <View style={[styles.statusChip, { backgroundColor: res.status === 'confirmed' ? Colors.successLight : Colors.warningLight }]}>
                          <Text style={[styles.statusChipText, { color: res.status === 'confirmed' ? Colors.success : Colors.warning }]}>
                            {res.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 32 },

  // ── Hero ──
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: Colors.textOnDarkMuted,
    fontFamily: Typography.fontFamily.medium,
  },
  heroName: {
    fontSize: 26,
    color: Colors.textOnDark,
    fontFamily: Typography.fontFamily.bold,
    marginTop: 2,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Typography.fontFamily.bold,
  },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: {
    fontSize: 24,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.white,
  },
  statLbl: {
    fontSize: 11,
    color: Colors.textOnDarkMuted,
    fontFamily: Typography.fontFamily.medium,
    marginTop: 3,
  },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)' },

  // ── Body ──
  body: { padding: 20 },
  section: { marginBottom: 24 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  sectionLink: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
  },

  // Reservation cards
  resCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16, overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 1, borderColor: Colors.borderLight,
    flexDirection: 'row',
    ...Shadows.sm,
  },
  resAccent: { width: 4 },
  resBody: { flex: 1, padding: 14 },
  resHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  resIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.secondaryLight + '18',
    alignItems: 'center', justifyContent: 'center',
  },
  resFacility: { fontSize: 14, fontFamily: Typography.fontFamily.semiBold, color: Colors.textPrimary },
  resPlate: { fontSize: 12, color: Colors.textSecondary, fontFamily: Typography.fontFamily.medium, marginTop: 1 },
  countdownBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4,
  },
  countdownText: { fontSize: 11, fontFamily: Typography.fontFamily.semiBold },
  resDetails: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  resDetailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  resDetailText: { fontSize: 12, color: Colors.textSecondary, fontFamily: Typography.fontFamily.medium },
  statusChip: {
    marginLeft: 'auto' as any, borderRadius: 12,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  statusChipText: { fontSize: 11, fontFamily: Typography.fontFamily.semiBold },

  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  qaCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  qaIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  qaLabel: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Active Session Card
  activeSessionCard: { borderRadius: 18, overflow: 'hidden', ...Shadows.md },
  activeSessionGradient: { padding: 18 },
  activeSessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  asBadge: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    fontFamily: Typography.fontFamily.medium,
    marginBottom: 4,
  },
  asPlate: {
    fontSize: 22,
    color: Colors.white,
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: 2,
  },
  asRow: { flexDirection: 'row', gap: 16 },
  asInfo: { flex: 1 },
  asLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: Typography.fontFamily.medium,
    marginBottom: 3,
  },
  asValue: {
    fontSize: 13,
    color: Colors.white,
    fontFamily: Typography.fontFamily.semiBold,
  },
  timerValue: {
    fontSize: 13,
    color: Colors.gradientAccent,
    fontFamily: Typography.fontFamily.bold,
  },

  // Empty State
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderStyle: 'dashed',
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
  },
  emptyBtn: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  emptyBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: Typography.fontFamily.semiBold,
  },
});
