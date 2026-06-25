import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { Reservation, ReservationStatus } from '../types/reservation.types';
import Button from './Button';
import Badge from './Badge';

interface Props {
  reservation: Reservation;
  onCancel?: (id: string) => void;
  cancellingId?: string | null;
}

const getStatusBadge = (status: ReservationStatus) => {
  switch (status) {
    case 'pending':
    case 'confirmed':
      return <Badge label="Đã xác nhận" variant="success" />;
    case 'used':
      return <Badge label="Đã sử dụng" variant="info" />;
    case 'cancelled':
      return <Badge label="Đã hủy" variant="danger" />;
    case 'expired':
      return <Badge label="Quá hạn" variant="warning" />;
    default:
      return <Badge label={status} variant="neutral" />;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/[\u202F\u00A0]/g, ' ');
};

export default function ReservationCard({ reservation, onCancel, cancellingId }: Props) {
  const canCancel = ['pending', 'confirmed'].includes(reservation.status);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.code}>{reservation.code}</Text>
        {getStatusBadge(reservation.status)}
      </View>

      <View style={styles.divider} />

      <View style={styles.content}>
        <View style={styles.row}>
          <Ionicons name="business-outline" size={20} color={Colors.primary} />
          <View style={styles.info}>
            <Text style={styles.label}>Bãi đỗ xe</Text>
            <Text style={styles.value}>{reservation.facilityId?.name || '---'}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Ionicons name="car-outline" size={20} color={Colors.primary} />
          <View style={styles.info}>
            <Text style={styles.label}>Xe & Biển số</Text>
            <Text style={styles.value}>
              {reservation.vehicleTypeId?.name || '---'} • <Text style={styles.plateText}>{reservation.licensePlate}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <Ionicons name="time-outline" size={20} color={Colors.primary} />
          <View style={styles.info}>
            <Text style={styles.label}>Thời gian đặt</Text>
            <Text style={styles.value}>
              Vào bãi (dự kiến): {formatDate(reservation.startTime)}
            </Text>
          </View>
        </View>

        {reservation.slotId && (
          <View style={styles.row}>
            <Ionicons name="location-outline" size={20} color={Colors.primary} />
            <View style={styles.info}>
              <Text style={styles.label}>Vị trí đỗ</Text>
              <Text style={styles.value}>{reservation.slotId.code}</Text>
            </View>
          </View>
        )}
      </View>

      {canCancel && onCancel && (
        <View style={styles.footer}>
          <Button
            title="Hủy đặt chỗ"
            variant="outline"
            size="sm"
            fullWidth
            onPress={() => onCancel(reservation._id)}
            loading={cancellingId === reservation._id}
          />
          <Text style={styles.noteText}>
            Lưu ý: Bạn có thể hủy thoải mái. Hệ thống sẽ tự hủy nếu quá 30 phút sau thời gian bắt đầu mà xe chưa vào bãi.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.base,
    ...Shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  code: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.base,
  },
  content: {
    gap: Spacing.base,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
    marginBottom: 2,
  },
  value: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeight.medium,
  },
  plateText: {
    fontWeight: Typography.fontWeight.bold,
  },
  footer: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  noteText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  }
});
