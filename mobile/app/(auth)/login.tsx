import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, TextInput } from '../../src/components';
import { Colors, Typography, Spacing } from '../../src/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    // TODO: Tuần 2 — gọi API login + lưu token vào SecureStore
    setTimeout(() => {
      setLoading(false);
      console.log('Login attempt:', { email, password });
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Logo & Title */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="car-sport" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Smart Parking</Text>
          <Text style={styles.subtitle}>Đăng nhập tài khoản Driver</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            label="Email"
            placeholder="email@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Ionicons name="mail-outline" size={20} color={Colors.textTertiary} />}
          />

          <TextInput
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={Colors.textTertiary} />}
            rightIcon={
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={Colors.textTertiary}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />

          <Button
            title="Đăng nhập"
            onPress={handleLogin}
            loading={loading}
            fullWidth
            size="lg"
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Chưa có tài khoản? </Text>
          <Text
            style={styles.footerLink}
            onPress={() => router.push('/(auth)/register')}
          >
            Đăng ký
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  form: {
    marginBottom: Spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
  },
  footerLink: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semiBold,
  },
});
