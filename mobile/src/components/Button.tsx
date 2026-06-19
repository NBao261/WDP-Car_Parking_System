import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  View,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  disabled,
  style,
  ...rest
}) => {
  const isDisabled = disabled || loading;

  return (
    <View style={[fullWidth && styles.fullWidthContainer, style as ViewStyle]}>
      <TouchableOpacity
        style={[
          styles.base,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabled,
        ]}
        disabled={isDisabled}
        activeOpacity={0.6}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'outline' || variant === 'ghost' ? Colors.primary : Colors.white}
          />
        ) : (
          <>
            {icon && icon}
            <Text
              style={[
                styles.text,
                variantTextStyles[variant],
                sizeTextStyles[size],
                icon ? { marginLeft: Spacing.sm } : undefined,
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  fullWidthContainer: {
    width: '100%',
  },
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.xl,
    borderCurve: 'continuous',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.4,
  },
  text: {
    fontFamily: Typography.fontFamily.semiBold,
    letterSpacing: 0.5,
  },
});

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: { 
    backgroundColor: Colors.primary,
    ...Shadows.sm,
    shadowColor: Colors.primary, // glowing primary button
  },
  secondary: { 
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  outline: { 
    backgroundColor: 'transparent', 
    borderWidth: 1, 
    borderColor: Colors.border,
  },
  ghost: { 
    backgroundColor: 'transparent',
  },
  danger: { 
    backgroundColor: Colors.dangerDark,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
};

const variantTextStyles: Record<ButtonVariant, TextStyle> = {
  primary: { color: Colors.textPrimary }, // Dark text on neon background
  secondary: { color: Colors.textPrimary },
  outline: { color: Colors.textPrimary },
  ghost: { color: Colors.textPrimary },
  danger: { color: Colors.white },
};

const sizeStyles: Record<ButtonSize, ViewStyle> = {
  sm: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
  md: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl },
  lg: { paddingVertical: Spacing.base, paddingHorizontal: Spacing['2xl'] },
};

const sizeTextStyles: Record<ButtonSize, TextStyle> = {
  sm: { fontSize: Typography.fontSize.sm },
  md: { fontSize: Typography.fontSize.base },
  lg: { fontSize: Typography.fontSize.md },
};

export default Button;
