import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../src/components';
import { Colors, Typography, Spacing, BorderRadius } from '../src/constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <View style={styles.iconCircle}>
          <Ionicons name="car-sport" size={64} color={Colors.primary} />
        </View>
        <Text style={styles.title}>Smart Parking</Text>
        <Text style={styles.tagline}>Tìm & đặt chỗ đỗ xe thông minh</Text>
      </View>

      {/* Features */}
      <View style={styles.features}>
        {[
          { icon: 'search-outline' as const, text: 'Tìm bãi xe gần bạn' },
          { icon: 'calendar-outline' as const, text: 'Đặt chỗ trước, tiết kiệm thời gian' },
          { icon: 'card-outline' as const, text: 'Thanh toán online tiện lợi' },
        ].map((item) => (
          <View key={item.text} style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Ionicons name={item.icon} size={20} color={Colors.primary} />
            </View>
            <Text style={styles.featureText}>{item.text}</Text>
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Đăng nhập"
          onPress={() => router.push('/(auth)/login')}
          fullWidth
          size="lg"
        />
        <Button
          title="Tạo tài khoản mới"
          variant="outline"
          onPress={() => router.push('/(auth)/register')}
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  hero: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  tagline: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  features: {
    marginBottom: Spacing['3xl'],
    gap: Spacing.base,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  featureText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    flex: 1,
  },
  actions: {
    gap: Spacing.md,
  },
});
