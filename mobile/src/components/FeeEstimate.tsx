import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { Colors, Typography, Spacing } from '../constants/theme';

interface FeeEstimateProps {
  checkInTime: string;
  baseFee: number;
}

export const FeeEstimate: React.FC<FeeEstimateProps> = ({ checkInTime, baseFee }) => {
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  useEffect(() => {
    const calculateElapsed = () => {
      const start = new Date(checkInTime).getTime();
      const now = new Date().getTime();
      const diffMs = Math.max(0, now - start);
      setElapsedMinutes(Math.floor(diffMs / 60000));
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 60000);
    return () => clearInterval(interval);
  }, [checkInTime]);

  const hours = Math.floor(elapsedMinutes / 60);
  const minutes = elapsedMinutes % 60;
  
  // Dummy logic: baseFee for first block, then maybe some logic. For UI, we just show a static or estimated total.
  // We will just show the baseFee for now as an "Estimated Fee".
  const estimatedFee = baseFee; 

  return (
    <Card variant="outlined" style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="cash-outline" size={20} color={Colors.primary} />
        <Text style={styles.title}>Phí tạm tính</Text>
      </View>
      
      <View style={styles.contentRow}>
        <View style={styles.col}>
          <Text style={styles.label}>Thời gian đỗ</Text>
          <Text style={styles.value}>
            {hours > 0 ? `${hours} giờ ` : ''}{minutes} phút
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.colRight}>
          <Text style={styles.label}>Tạm tính</Text>
          <Text style={styles.feeValue}>{estimatedFee.toLocaleString()} đ</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primaryBg,
    borderColor: Colors.primaryLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.primaryDark,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  col: {
    flex: 1,
  },
  colRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.primaryLight,
    opacity: 0.5,
    marginHorizontal: Spacing.md,
  },
  label: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textPrimary,
  },
  feeValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
});
