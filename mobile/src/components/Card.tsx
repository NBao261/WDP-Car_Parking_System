import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'filled';
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  onPress,
  style,
  variant = 'elevated',
}) => {
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <View style={[styles.outerBezel, variantStyles[variant], style]}>
      <Wrapper
        style={[styles.innerBezel]}
        {...(onPress ? { onPress, activeOpacity: 0.7 } : {})}
      >
        {(title || subtitle) && (
          <View style={styles.header}>
            {title && <Text style={styles.title}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        )}
        {children}
      </Wrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  outerBezel: {
    borderRadius: BorderRadius['2xl'],
    padding: 1, // Creates the outer border effect
    backgroundColor: Colors.borderLight, // The outer hairline
    marginBottom: Spacing.base,
    ...Shadows.lg, // High-end diffused shadow
  },
  innerBezel: {
    backgroundColor: Colors.surface, // Vantablack/deep card background
    borderRadius: BorderRadius['2xl'] - 1, // Matches outer curve
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.borderLight, // Inner highlight / border
  },
  header: {
    marginBottom: Spacing.base,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
});

const variantStyles: Record<string, ViewStyle> = {
  elevated: {
    backgroundColor: Colors.borderLight,
  },
  outlined: {
    backgroundColor: Colors.border,
    ...Shadows.sm,
  },
  filled: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
};

export default Card;
