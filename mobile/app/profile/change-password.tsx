import React, { useState } from "react";
import {
  View, Text, StyleSheet, Alert, TextInput, TouchableOpacity, ScrollView,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Typography, Spacing, Shadows } from "../../src/constants/theme";
import { authApi } from "../../src/services/api";

interface PasswordFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  visible: boolean;
  onToggle: () => void;
}

function PasswordField({ label, placeholder, value, onChangeText, visible, onToggle }: PasswordFieldProps) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldRow}>
        <TextInput
          style={styles.fieldInput}
          secureTextEntry={!visible}
          placeholder={placeholder}
          placeholderTextColor={Colors.placeholder}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={onToggle} style={styles.eyeBtn}>
          <Ionicons name={visible ? "eye-outline" : "eye-off-outline"} size={20} color={Colors.textTertiary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ các trường."); return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Không khớp", "Mật khẩu xác nhận không khớp với mật khẩu mới."); return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Mật khẩu quá ngắn", "Mật khẩu mới phải có ít nhất 6 ký tự."); return;
    }
    try {
      setLoading(true);
      const res: any = await authApi.changePassword({ oldPassword, newPassword });
      if (res.success) {
        Alert.alert("✅ Thành công", "Mật khẩu đã được thay đổi.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error?.response?.data?.message || "Không thể đổi mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  const allFilled = oldPassword && newPassword && confirmPassword;
  const matched = newPassword === confirmPassword;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.root}>
        {/* ── Gradient Header ── */}
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientMid]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <SafeAreaView edges={["top"]}>
            <View style={styles.heroNav}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={22} color={Colors.white} />
              </TouchableOpacity>
              <Text style={styles.heroTitle}>Đổi mật khẩu</Text>
              <View style={{ width: 38 }} />
            </View>
            <View style={styles.heroBody}>
              <View style={styles.heroIconWrap}>
                <Ionicons name="lock-closed" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.heroSub}>Đặt mật khẩu mới an toàn cho tài khoản</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Form card */}
          <View style={styles.card}>
            <PasswordField
              label="Mật khẩu hiện tại"
              placeholder="Nhập mật khẩu hiện tại"
              value={oldPassword}
              onChangeText={setOldPassword}
              visible={showOld}
              onToggle={() => setShowOld(v => !v)}
            />
            <View style={styles.divider} />
            <PasswordField
              label="Mật khẩu mới"
              placeholder="Ít nhất 6 ký tự"
              value={newPassword}
              onChangeText={setNewPassword}
              visible={showNew}
              onToggle={() => setShowNew(v => !v)}
            />
            <View style={styles.divider} />
            <PasswordField
              label="Xác nhận mật khẩu mới"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              visible={showConfirm}
              onToggle={() => setShowConfirm(v => !v)}
            />

            {/* Match indicator */}
            {confirmPassword.length > 0 && (
              <View style={[styles.matchRow, { backgroundColor: matched ? Colors.successLight : Colors.dangerLight }]}>
                <Ionicons
                  name={matched ? "checkmark-circle-outline" : "close-circle-outline"}
                  size={16}
                  color={matched ? Colors.success : Colors.danger}
                />
                <Text style={[styles.matchText, { color: matched ? Colors.success : Colors.danger }]}>
                  {matched ? "Mật khẩu khớp" : "Mật khẩu không khớp"}
                </Text>
              </View>
            )}
          </View>

          {/* Tip */}
          <View style={styles.tipBox}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.info} />
            <Text style={styles.tipText}>Mật khẩu mạnh gồm chữ hoa, chữ thường, số và ký tự đặc biệt.</Text>
          </View>

          {/* Confirm button */}
          <TouchableOpacity
            style={[styles.confirmBtn, (!allFilled || loading) && styles.confirmBtnDisabled]}
            onPress={handleChangePassword}
            disabled={!allFilled || loading}
            activeOpacity={0.85}
          >
            <Ionicons name={loading ? "hourglass-outline" : "checkmark-circle-outline"} size={20} color={Colors.white} />
            <Text style={styles.confirmBtnText}>{loading ? "Đang xử lý..." : "Xác nhận đổi mật khẩu"}</Text>
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  // Hero
  hero: { paddingHorizontal: 16, paddingBottom: 20 },
  heroNav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 8, marginBottom: 16 },
  backBtn: { width: 38, height: 38, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 19 },
  heroTitle: { fontSize: 17, fontFamily: Typography.fontFamily.bold, color: Colors.white },
  heroBody: { flexDirection: "row", alignItems: "center", gap: 12 },
  heroIconWrap: { width: 46, height: 46, borderRadius: 12, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center", ...Shadows.sm },
  heroSub: { flex: 1, fontSize: 13, color: Colors.textOnDarkMuted, fontFamily: Typography.fontFamily.regular },

  // Content
  content: { padding: 16 },

  // Card
  card: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: Colors.borderLight, ...Shadows.sm },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: 14 },

  // Field
  fieldWrap: {},
  fieldLabel: { fontSize: 12, fontFamily: Typography.fontFamily.semiBold, color: Colors.textTertiary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 },
  fieldRow: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 14, backgroundColor: Colors.white },
  fieldInput: { flex: 1, height: 48, fontSize: 15, fontFamily: Typography.fontFamily.regular, color: Colors.textPrimary },
  eyeBtn: { padding: 8 },

  // Match indicator
  matchRow: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 8, padding: 8, marginTop: 12 },
  matchText: { fontSize: 13, fontFamily: Typography.fontFamily.medium },

  // Tip
  tipBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 20, backgroundColor: Colors.infoLight, borderRadius: 10, padding: 12 },
  tipText: { flex: 1, fontSize: 12, color: Colors.textSecondary, fontFamily: Typography.fontFamily.regular, lineHeight: 18 },

  // Confirm
  confirmBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 16,
    ...Shadows.md,
  },
  confirmBtnDisabled: { backgroundColor: Colors.disabled },
  confirmBtnText: { fontSize: 16, fontFamily: Typography.fontFamily.bold, color: Colors.white },
});
