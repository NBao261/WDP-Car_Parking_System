import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge } from '../../src/components';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.greetingContainer}>
        <Text style={styles.greetingText}>Xin chào, {user?.name || 'Driver'} 👋</Text>
        <Text style={styles.subGreeting}>Chúc bạn một ngày tốt lành!</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: Colors.primaryBg }]}>
          <Ionicons name="car-sport" size={28} color={Colors.primary} />
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Đang gửi</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: Colors.successLight }]}>
          <Ionicons name="checkmark-circle" size={28} color={Colors.success} />
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Hoàn thành</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: Colors.warningLight }]}>
          <Ionicons name="calendar" size={28} color={Colors.warning} />
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Đặt chỗ</Text>
        </View>
      </View>

      {/* Current Session */}
      <Card title="Lượt gửi hiện tại" variant="outlined">
        <View style={styles.emptyState}>
          <Ionicons name="car-outline" size={48} color={Colors.disabled} />
          <Text style={styles.emptyText}>Không có xe đang gửi</Text>
        </View>
      </Card>

      {/* Nearby Facilities */}
      <Text style={styles.sectionTitle}>Bãi xe gần đây</Text>
      <Card
        title="Central Hub Parking"
        subtitle="123 Main Street, District 1, HCMC"
        variant="elevated"
      >
        <View style={styles.facilityInfo}>
          <View style={styles.facilityDetail}>
            <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.facilityDetailText}>00:00 - 23:59</Text>
          </View>
          <Badge label="Mở cửa" variant="success" size="sm" />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.base,
  },
  greetingContainer: {
    marginBottom: Spacing.lg,
  },
  greetingText: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  subGreeting: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  statNumber: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
  },
  facilityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  facilityDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  facilityDetailText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
});
