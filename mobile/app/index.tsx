import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Shadows } from '../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Hero Section */}
          <View style={styles.hero}>
            <View style={styles.logoBadge}>
              <Ionicons name="car-sport" size={18} color={Colors.brandDark} />
            </View>
            <Text style={styles.title}>
              Smart{'\n'}Parking
              <Text style={styles.titleAccent}>.</Text>
            </Text>
            <Text style={styles.tagline}>Hệ thống đỗ xe thông minh — Tìm, đặt chỗ và thanh toán nhanh chóng.</Text>
          </View>

          {/* Feature Card — Dark */}
          <View style={styles.featureCard}>
            <View style={styles.featureRow}>
              <View style={styles.featureIconBox}>
                <Ionicons name="navigate-outline" size={22} color={Colors.brandDark} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>Tìm bãi xe gần nhất</Text>
                <Text style={styles.featureDesc}>Định vị tự động và hiển thị bãi xe còn chỗ trống xung quanh bạn.</Text>
              </View>
            </View>

            <View style={styles.featureDivider} />

            <View style={styles.featureRow}>
              <View style={styles.featureIconBox}>
                <Ionicons name="time-outline" size={22} color={Colors.brandDark} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>Đặt chỗ trước</Text>
                <Text style={styles.featureDesc}>Không cần chờ đợi, đặt trước chỗ đỗ xe ngay trên điện thoại.</Text>
              </View>
            </View>

            <View style={styles.featureDivider} />

            <View style={styles.featureRow}>
              <View style={styles.featureIconBox}>
                <Ionicons name="card-outline" size={22} color={Colors.brandDark} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>Thanh toán dễ dàng</Text>
                <Text style={styles.featureDesc}>Quét QR, kiểm tra phí, thanh toán nhanh chóng và an toàn.</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.bottomActions}>
          <TouchableOpacity 
            style={styles.primaryBtn}
            onPress={() => router.push('/(auth)/login' as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Đăng nhập</Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.brandDark} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryBtn}
            onPress={() => router.push('/(auth)/register' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryBtnText}>Tạo tài khoản mới</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flexGrow: 1,
  },

  content: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
  },

  // Hero
  hero: {
    marginBottom: 32,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.brandLime,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 40,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.brandDark,
    lineHeight: 44,
    letterSpacing: -1,
  },
  titleAccent: {
    color: Colors.brandLime,
  },
  tagline: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.brandGrayText,
    marginTop: 12,
    lineHeight: 22,
    maxWidth: '85%',
  },

  // Feature Card — Dark themed
  featureCard: {
    backgroundColor: Colors.brandDark,
    borderRadius: 24,
    padding: 20,
    ...Shadows.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingVertical: 4,
  },
  featureDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 14,
  },
  featureIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.brandLime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.white,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.regular,
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 18,
  },

  // Bottom Actions
  bottomActions: {
    padding: 24,
    paddingBottom: 32,
    gap: 12,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.brandLime,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 9999,
    ...Shadows.sm,
  },
  primaryBtnText: {
    fontSize: 15,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.brandDark,
  },
  secondaryBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    backgroundColor: Colors.brandGray,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.brandDark,
  },
});
