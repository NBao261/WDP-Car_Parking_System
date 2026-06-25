import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Abstract Background Elements */}
        <View style={styles.blob1} />
        <View style={styles.blob2} />
        <View style={styles.blob3} />

        <View style={styles.content}>
          {/* Hero Section */}
          <View style={styles.hero}>
            <View style={styles.logoBadge}>
              <Image source={require('../assets/images/logo.png')} style={{ width: 140, height: 48, resizeMode: 'contain' }} />
            </View>
            <Text style={styles.title}>
              Smart{'\n'}Parking
              <Text style={styles.titleAccent}>.</Text>
            </Text>
            <Text style={styles.tagline}>Intelligent parking orchestration for the modern driver.</Text>
          </View>

          {/* Cards Section */}
          <View style={styles.cardsWrap}>
            {/* Main Feature Card */}
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.featureCard}
            >
              <View style={styles.featureIconBox}>
                <Ionicons name="navigate-outline" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.featureTitle}>Proximity Mapping</Text>
              <Text style={styles.featureDesc}>Find available slots instantly around your location in real-time.</Text>
            </LinearGradient>

            <View style={styles.cardsRow}>
              {/* Small Card 1 */}
              <View style={styles.smallCard}>
                <View style={[styles.smallIconBox, { backgroundColor: Colors.warningLight }]}>
                  <Ionicons name="time" size={24} color={Colors.warning} />
                </View>
                <Text style={styles.smallCardTitle}>Zero{'\n'}Waiting</Text>
              </View>

              {/* Small Card 2 */}
              <View style={styles.smallCard}>
                <View style={[styles.smallIconBox, { backgroundColor: Colors.successLight }]}>
                  <Ionicons name="card" size={24} color={Colors.success} />
                </View>
                <Text style={styles.smallCardTitle}>Seamless{'\n'}Payment</Text>
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
            <Ionicons name="arrow-forward" size={20} color={Colors.white} />
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
    backgroundColor: Colors.background,
  },
  container: {
    flexGrow: 1,
  },
  
  // Background blobs for visual interest
  blob1: {
    position: 'absolute', top: -60, right: -60, width: 220, height: 220,
    borderRadius: 110, backgroundColor: '#A8D16428', zIndex: -1,
  },
  blob2: {
    position: 'absolute', top: 270, left: -120, width: 260, height: 260,
    borderRadius: 130, backgroundColor: '#7DB83A18', zIndex: -1,
  },
  blob3: {
    position: 'absolute', bottom: 60, right: -160, width: 320, height: 320,
    borderRadius: 160, backgroundColor: '#D6EDA820', zIndex: -1,
  },

  content: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
  },

  // Hero
  hero: {
    marginBottom: 40,
  },
  logoBadge: {
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20,
    backgroundColor: Colors.white,
    alignSelf: 'flex-start',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 28,
    shadowColor: '#5E8F25',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  title: {
    fontSize: 42,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    lineHeight: 46,
    letterSpacing: -1,
  },
  titleAccent: {
    color: Colors.primary,
  },
  tagline: {
    fontSize: 15,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginTop: 14,
    lineHeight: 24,
    maxWidth: '85%',
  },

  // Cards
  cardsWrap: {
    gap: 16,
  },
  featureCard: {
    borderRadius: 28,
    padding: 26,
    shadowColor: '#5E8F25',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 6,
  },
  featureIconBox: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20, fontFamily: Typography.fontFamily.bold,
    color: Colors.white, marginBottom: 8,
  },
  featureDesc: {
    fontSize: 14, fontFamily: Typography.fontFamily.regular,
    color: 'rgba(255,255,255,0.85)', lineHeight: 20,
  },

  cardsRow: {
    flexDirection: 'row', gap: 16,
  },
  smallCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#5E8F25',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  smallIconBox: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  smallCardTitle: {
    fontSize: 16, fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary, lineHeight: 22,
  },

  // Bottom Actions
  bottomActions: {
    padding: 24,
    paddingBottom: 32,
    gap: 12,
    backgroundColor: Colors.background, // Block blobs overlapping buttons
  },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingVertical: 18, paddingHorizontal: 24,
    borderRadius: 18,
    shadowColor: '#5E8F25',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.30,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryBtnText: {
    fontSize: 16, fontFamily: Typography.fontFamily.bold, color: Colors.white,
  },
  secondaryBtn: {
    paddingVertical: 15, alignItems: 'center', justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryBtnText: {
    fontSize: 15, fontFamily: Typography.fontFamily.semiBold, color: Colors.textSecondary,
  },
});
