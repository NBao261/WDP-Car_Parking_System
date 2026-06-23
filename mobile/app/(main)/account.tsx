import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from "../../src/constants/theme";
import { useAuthStore } from "../../src/store/useAuthStore";

function getInitials(name?: string) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface MenuItemProps {
  icon: any;
  label: string;
  subtitle?: string;
  onPress: () => void;
  color?: string;
  chevron?: boolean;
}

function MenuItem({
  icon,
  label,
  subtitle,
  onPress,
  color = Colors.primary,
  chevron = true,
}: MenuItemProps) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIconWrap, { backgroundColor: color + "15" }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.menuTextWrap}>
        <Text style={styles.menuLabel}>{label}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {chevron && (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={Colors.textTertiary}
        />
      )}
    </TouchableOpacity>
  );
}

function MenuSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

export default function AccountScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/");
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Profile Hero ── */}
        <View style={styles.heroWrapper}>
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientMid]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <SafeAreaView edges={["top"]}>
              <View style={styles.heroContent}>
                <Image source={require('../../assets/images/logo.png')} style={{ width: 120, height: 36, resizeMode: 'contain', marginBottom: 16 }} />
                <View style={styles.avatarLarge}>
                  <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
                </View>
                <Text style={styles.heroName}>{user?.name || "Driver"}</Text>
                <Text style={styles.heroEmail}>{user?.email}</Text>
                <View style={styles.roleBadge}>
                  <Ionicons
                    name="car-sport"
                    size={12}
                    color={Colors.gradientAccent}
                  />
                  <Text style={styles.roleText}>Tài xế</Text>
                </View>
              </View>
            </SafeAreaView>
          </LinearGradient>
        </View>

        {/* ── Info Cards ── */}
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Ionicons name="call-outline" size={16} color={Colors.primary} />
            <Text style={styles.infoLabel}>Điện thoại</Text>
            <Text style={styles.infoValue}>{(user as any)?.phone || "—"}</Text>
          </View>
          <View style={[styles.infoCard, styles.infoCardRight]}>
            <Ionicons name="mail-outline" size={16} color={Colors.secondary} />
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {user?.email || "—"}
            </Text>
          </View>
        </View>

        {/* ── Bảo mật ── */}
        <MenuSection title="Bảo mật">
          <MenuItem
            icon="lock-closed-outline"
            label="Đổi mật khẩu"
            subtitle="Cập nhật mật khẩu tài khoản"
            onPress={() => router.push("/profile/change-password" as any)}
            color={Colors.primary}
          />
        </MenuSection>

        {/* ── Hoạt động ── */}
        <MenuSection title="Hoạt động">
          <MenuItem
            icon="receipt-outline"
            label="Lịch sử gửi xe"
            subtitle="Xem lượt gửi đã hoàn thành"
            onPress={() => router.push("/(main)/sessions?tab=history" as any)}
            color={Colors.success}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="calendar-outline"
            label="Đặt chỗ của tôi"
            subtitle="Quản lý chỗ đã đặt trước"
            onPress={() => router.push("/(main)/sessions?tab=reserved" as any)}
            color={Colors.secondary}
          />
        </MenuSection>

        {/* ── Hỗ trợ ── */}
        <MenuSection title="Hỗ trợ">
          <MenuItem
            icon="chatbubble-ellipses-outline"
            label="Gửi phản hồi"
            subtitle="Báo cáo vấn đề hoặc góp ý"
            onPress={() => router.push("/feedback/create" as any)}
            color={Colors.warning}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="list-outline"
            label="Phản hồi của tôi"
            subtitle="Theo dõi trạng thái xử lý"
            onPress={() => router.push("/feedback" as any)}
            color={Colors.info}
          />
        </MenuSection>

        {/* ── Đăng xuất ── */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 40 },

  // Hero
  heroWrapper: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  hero: {
    paddingBottom: 28,
  },
  heroContent: { alignItems: "center", paddingVertical: 24 },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.4)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.white,
  },
  heroName: {
    fontSize: 22,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textOnDark,
    marginBottom: 4,
  },
  heroEmail: {
    fontSize: 13,
    color: Colors.textOnDarkMuted,
    fontFamily: Typography.fontFamily.regular,
    marginBottom: 10,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  roleText: {
    fontSize: 12,
    color: Colors.gradientAccent,
    fontFamily: Typography.fontFamily.semiBold,
  },

  // Info row
  infoRow: { flexDirection: "row", margin: 16, gap: 12 },
  infoCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#5E8F25',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  infoCardRight: {},
  infoLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: Typography.fontFamily.medium,
    marginTop: 6,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.semiBold,
  },

  // Menu
  section: { marginHorizontal: 16, marginBottom: 12 },
  sectionTitle: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontFamily: Typography.fontFamily.semiBold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    shadowColor: '#5E8F25',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTextWrap: { flex: 1 },
  menuLabel: {
    fontSize: 15,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
  },
  menuSubtitle: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontFamily: Typography.fontFamily.regular,
    marginTop: 1,
  },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginLeft: 66 },

  // Logout
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: Colors.dangerLight,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.danger + "30",
  },
  logoutText: {
    fontSize: 15,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.danger,
  },

  version: {
    textAlign: "center",
    fontSize: 12,
    color: Colors.textTertiary,
    fontFamily: Typography.fontFamily.regular,
    marginTop: 16,
  },
});
