import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../src/components';
import { Colors, Typography, Spacing, BorderRadius } from '../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Glow Effects */}
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.title}>
            Smart{'\n'}Parking
            <Text style={styles.titleAccent}>.</Text>
          </Text>
          <Text style={styles.tagline}>Intelligent parking orchestration.</Text>
        </View>

        {/* Asymmetrical Bento Grid */}
        <View style={styles.bentoGrid}>
          {/* Large Primary Card */}
          <View style={[styles.bentoCard, styles.bentoLarge]}>
            <View style={styles.bentoIconWrapper}>
              <Ionicons name="location" size={24} color={Colors.textPrimary} />
            </View>
            <Text style={styles.bentoTitle}>Proximity Mapping</Text>
            <Text style={styles.bentoText}>Find available slots instantly around your location.</Text>
          </View>

          <View style={styles.bentoRow}>
            {/* Small Card 1 */}
            <View style={[styles.bentoCard, styles.bentoSmall]}>
              <Ionicons name="time" size={28} color={Colors.primary} />
              <Text style={styles.bentoTitleSmall}>Zero{'\n'}Waiting</Text>
            </View>

            {/* Small Card 2 */}
            <View style={[styles.bentoCard, styles.bentoSmall]}>
              <Ionicons name="card" size={28} color={Colors.success} />
              <Text style={styles.bentoTitleSmall}>Seamless{'\n'}Payment</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Authenticate"
            onPress={() => router.push('/(auth)/login')}
            fullWidth
            size="lg"
            style={styles.actionButton}
          />
          <Button
            title="Create Identity"
            variant="ghost"
            onPress={() => router.push('/(auth)/register')}
            fullWidth
            size="md"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flexGrow: 1,
    padding: Spacing.base,
    justifyContent: 'space-between',
  },
  glowTop: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    zIndex: -1,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    zIndex: -1,
  },
  hero: {
    marginTop: Spacing['2xl'],
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    lineHeight: Typography.lineHeight['3xl'],
    letterSpacing: -1,
  },
  titleAccent: {
    color: Colors.primary,
  },
  tagline: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    letterSpacing: 0.5,
  },
  bentoGrid: {
    flex: 1,
    gap: Spacing.md,
    marginBottom: Spacing['2xl'],
  },
  bentoRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  bentoCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  bentoLarge: {
    minHeight: 180,
    justifyContent: 'space-between',
  },
  bentoSmall: {
    flex: 1,
    minHeight: 160,
    justifyContent: 'space-between',
  },
  bentoIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  bentoTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  bentoText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.sm,
  },
  bentoTitleSmall: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  actions: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  actionButton: {
    marginBottom: Spacing.xs,
  },
});
