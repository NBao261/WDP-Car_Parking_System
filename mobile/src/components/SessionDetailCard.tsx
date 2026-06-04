import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { Badge } from './Badge';
import { Colors, Typography, Spacing } from '../constants/theme';
import { ParkingSession } from '../types/session.types';

interface SessionDetailCardProps {
  session: ParkingSession;
  onPress?: () => void;
}

export const SessionDetailCard: React.FC<SessionDetailCardProps> = ({ session, onPress }) => {
  const getStatusInfo = (status: ParkingSession['status']) => {
    switch (status) {
      case 'active': return { label: 'Đang đỗ', variant: 'success' as const };
      case 'pending_payment': return { label: 'Chờ thanh toán', variant: 'warning' as const };
      case 'completed': return { label: 'Đã hoàn thành', variant: 'neutral' as const };
      case 'exception': return { label: 'Sự cố', variant: 'danger' as const };
      default: return { label: 'Không xác định', variant: 'neutral' as const };
    }
  };

  const statusInfo = getStatusInfo(session.status);

  // Format Date (e.g. 08:30 15/05/2026)
  const formatDateTime = (dateString: string) => {
    if (!dateString) return '--';
    const d = new Date(dateString);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} ${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <Card variant="elevated" onPress={onPress} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.plateContainer}>
          <Text style={styles.plateText}>{session.licensePlate}</Text>
        </View>
        <Badge label={statusInfo.label} variant={statusInfo.variant} size="sm" />
      </View>
      
      <View style={styles.content}>
        <View style={styles.row}>
          <Ionicons name="business-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.rowText} numberOfLines={1}>{session.facilityName}</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.rowText}>Tầng {session.floorName} - Ô {session.slotCode}</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="car-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.rowText}>{session.vehicleTypeName}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.timeRow}>
          <View>
            <Text style={styles.timeLabel}>Giờ vào</Text>
            <Text style={styles.timeValue}>{formatDateTime(session.checkInTime)}</Text>
          </View>
          {session.checkOutTime && (
            <View>
              <Text style={styles.timeLabel}>Giờ ra</Text>
              <Text style={styles.timeValue}>{formatDateTime(session.checkOutTime)}</Text>
            </View>
          )}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  plateContainer: {
    backgroundColor: Colors.divider,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.textSecondary,
  },
  plateText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  content: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rowText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.xs,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
    marginBottom: 2,
  },
  timeValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textPrimary,
  },
});
