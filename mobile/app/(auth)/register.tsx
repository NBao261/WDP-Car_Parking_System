import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, ScrollView, Alert, TouchableOpacity, TextInput as RNTextInput } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Shadows } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const register = useAuthStore(state => state.register);

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    setLoading(true);
    try {
      await register({ name, email, phone, password });
      router.replace('/(driver)/home');
    } catch (error: any) {
      const errMsg = error?.message || (typeof error === 'string' ? error : 'Có lỗi xảy ra');
      Alert.alert('Đăng ký thất bại', errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={process.env.EXPO_OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <SafeAreaView edges={['top']} style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={20} color={Colors.brandDark} />
              </TouchableOpacity>
            </View>

            {/* Title */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>Tạo tài khoản</Text>
              <Text style={styles.subtitle}>Bắt đầu hành trình đỗ xe thông minh</Text>
            </View>

            {/* Form */}
            <View style={styles.formSection}>
              {/* Full Name */}
              <View style={styles.inputWrap}>
                <Ionicons name="person-outline" size={18} color={Colors.brandGrayText} style={styles.inputIcon} />
                <RNTextInput
                  style={styles.input}
                  placeholder="Họ và tên"
                  placeholderTextColor={Colors.brandGrayText}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* Email */}
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color={Colors.brandGrayText} style={styles.inputIcon} />
                <RNTextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor={Colors.brandGrayText}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Phone */}
              <View style={styles.inputWrap}>
                <Ionicons name="call-outline" size={18} color={Colors.brandGrayText} style={styles.inputIcon} />
                <RNTextInput
                  style={styles.input}
                  placeholder="Số điện thoại"
                  placeholderTextColor={Colors.brandGrayText}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>

              {/* Password */}
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.brandGrayText} style={styles.inputIcon} />
                <RNTextInput
                  style={styles.input}
                  placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                  placeholderTextColor={Colors.brandGrayText}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={Colors.brandGrayText}
                  />
                </TouchableOpacity>
              </View>

              {/* Register Button */}
              <TouchableOpacity
                style={[styles.registerBtn, loading && styles.registerBtnDisabled]}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.85}
              >
                <Text style={styles.registerBtnText}>{loading ? "Đang xử lý..." : "Đăng ký"}</Text>
                <Ionicons name="checkmark" size={18} color={Colors.brandDark} />
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }} />

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.footerLink}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    flexGrow: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.brandGray,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Title
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.brandDark,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.brandGrayText,
  },

  // Form
  formSection: {
    gap: 12,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brandGray,
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.brandDark,
    height: '100%',
  },
  eyeBtn: {
    padding: 8,
  },

  // Register button
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.brandLime,
    borderRadius: 9999,
    height: 56,
    marginTop: 8,
    ...Shadows.sm,
  },
  registerBtnDisabled: {
    backgroundColor: Colors.disabled,
  },
  registerBtnText: {
    fontSize: 15,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.brandDark,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 24,
  },
  footerText: {
    fontSize: 13,
    color: Colors.brandGrayText,
    fontFamily: Typography.fontFamily.regular,
  },
  footerLink: {
    fontSize: 13,
    color: Colors.brandDark,
    fontFamily: Typography.fontFamily.bold,
  },
});
