import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';

type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'neutral';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'md',
  style,
}) => {
  return (
    <View style={[styles.base, variantStyles[variant], sizeStyles[size], style]}>
      <Text style={[styles.text, variantTextStyles[variant], sizeTextStyles[size]]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.full,
  },
  text: {
    fontWeight: Typography.fontWeight.medium,
  },
});

const variantStyles: Record<BadgeVariant, ViewStyle> = {
  success: { backgroundColor: Colors.successLight },
  danger: { backgroundColor: Colors.dangerLight },
  warning: { backgroundColor: Colors.warningLight },
  info: { backgroundColor: Colors.infoLight },
  neutral: { backgroundColor: Colors.divider },
};

const variantTextStyles: Record<BadgeVariant, { color: string }> = {
  success: { color: Colors.successDark },
  danger: { color: Colors.dangerDark },
  warning: { color: Colors.warningDark },
  info: { color: Colors.infoDark },
  neutral: { color: Colors.textSecondary },
};

const sizeStyles: Record<BadgeSize, ViewStyle> = {
  sm: { paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  md: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
};

const sizeTextStyles: Record<BadgeSize, { fontSize: number }> = {
  sm: { fontSize: Typography.fontSize.xs },
  md: { fontSize: Typography.fontSize.sm },
};

export default Badge;
