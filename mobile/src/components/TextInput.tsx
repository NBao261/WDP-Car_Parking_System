import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  TextInputProps as RNTextInputProps,
  ViewStyle,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? Colors.danger
    : isFocused
      ? Colors.primary
      : Colors.borderLight;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={[styles.inputWrapper, { borderColor }]}>
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

        <RNTextInput
          style={[
            styles.input,
            leftIcon ? { paddingLeft: 0 } : undefined,
            rightIcon ? { paddingRight: 0 } : undefined,
            style,
          ]}
          placeholderTextColor={Colors.placeholder}
          onFocus={(e) => {
            setIsFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            rest.onBlur?.(e);
          }}
          {...rest}
        />

        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    borderCurve: 'continuous',
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: Spacing.md,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    paddingVertical: Spacing.md,
  },
  iconLeft: {
    marginRight: Spacing.sm,
  },
  iconRight: {
    marginLeft: Spacing.sm,
  },
  error: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.danger,
    marginTop: Spacing.xs,
  },
  hint: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
});

export default TextInput;
