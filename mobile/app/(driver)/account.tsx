import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Colors,
  Typography,
  Shadows,
} from "../../src/constants/theme";
import { useAuthStore } from "../../src/store/useAuthStore";
import { vehicleApi } from "../../src/services/api";

function getInitials(name?: string) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* ── Reusable menu item matching reference ProfileTab ── */
function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: any;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuIconCircle}>
        <Ionicons name={icon} size={16} color={Colors.brandDark} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={Colors.brandGrayText} />
    </TouchableOpacity>
  );
}

/* ── Section wrapper ── */
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
  const [vehicleCount, setVehicleCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const loadCount = async () => {
        try {
          const res: any = await vehicleApi.getMyVehicles();
          if (res.success) setVehicleCount(res.data?.length || 0);
        } catch {}
      };
      loadCount();
    }, []),
  );

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
      {/* ── White header: ← Profile ⚙ ── */}
      <SafeAreaView edges={["top"]} style={{ backgroundColor: Colors.white }}>
        <View style={styles.headerBar}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={18} color={Colors.brandDark} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile</Text>
          </View>
          <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7}>
            <Ionicons name="settings-outline" size={18} color={Colors.brandDark} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── User identity row ── */}
        <View style={styles.userRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || "Driver"}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>

        {/* ── Quick Stats: Dark card "Xe đã đăng ký" ── */}
        <TouchableOpacity
          style={styles.statsCard}
          onPress={() => router.push("/profile/my-vehicles" as any)}
          activeOpacity={0.85}
        >
          <View style={styles.statsLeft}>
            <View style={styles.statsIconCircle}>
              <Ionicons name="car" size={18} color={Colors.brandDark} />
            </View>
            <View>
              <Text style={styles.statsLabel}>Xe đã đăng ký</Text>
              <Text style={styles.statsCount}>
                {String(vehicleCount).padStart(2, "0")} Xe
              </Text>
            </View>
          </View>
          <View style={styles.statsChevron}>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.5)" />
          </View>
        </TouchableOpacity>

        {/* ── HOẠT ĐỘNG section ── */}
        <MenuSection title="Hoạt động">
          <MenuItem
            icon="car-sport-outline"
            label="Xe của tôi"
            onPress={() => router.push("/profile/my-vehicles" as any)}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="time-outline"
            label="Lịch sử gửi xe"
            onPress={() => router.push("/(driver)/sessions?tab=history" as any)}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="bookmark-outline"
            label="Đặt chỗ của tôi"
            onPress={() =>
              router.push("/(driver)/sessions?tab=reserved" as any)
            }
          />
        </MenuSection>

        {/* ── BẢO MẬT section ── */}
        <MenuSection title="Bảo mật">
          <MenuItem
            icon="lock-closed-outline"
            label="Đổi mật khẩu"
            onPress={() => router.push("/profile/change-password" as any)}
          />
        </MenuSection>

        {/* ── HỖ TRỢ section ── */}
        <MenuSection title="Hỗ trợ">
          <MenuItem
            icon="chatbubble-outline"
            label="Gửi phản hồi"
            onPress={() => router.push("/feedback/create" as any)}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="chatbubbles-outline"
            label="Phản hồi của tôi"
            onPress={() => router.push("/feedback" as any)}
          />
        </MenuSection>

        {/* ── Đăng xuất — gray pill ── */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={16} color={Colors.brandDark} />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  scrollContent: { paddingBottom: 24 },

  /* ── Header bar ── */
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: Colors.brandGray,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.brandGray,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.brandDark,
  },

  /* ── User identity row ── */
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.brandGray,
    borderWidth: 2,
    borderColor: Colors.brandGray,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.brandDark,
  },
  userInfo: { flex: 1 },
  userName: {
    fontSize: 17,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.brandDark,
    lineHeight: 20,
  },
  userEmail: {
    fontSize: 12,
    color: Colors.brandGrayText,
    fontFamily: Typography.fontFamily.semiBold,
    marginTop: 3,
  },

  /* ── Dark stats card ── */
  statsCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.brandDark,
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  statsIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.brandLime,
    alignItems: "center",
    justifyContent: "center",
  },
  statsLabel: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.bold,
    color: "rgba(255,255,255,0.7)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  statsCount: {
    fontSize: 17,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.white,
    marginTop: 2,
  },
  statsChevron: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  /* ── Menu section ── */
  section: { marginHorizontal: 20, marginBottom: 16 },
  sectionTitle: {
    fontSize: 10,
    color: Colors.brandGrayText,
    fontFamily: Typography.fontFamily.bold,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.brandGray,
    overflow: "hidden",
    ...Shadows.sm,
  },

  /* ── Menu item ── */
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  menuIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.brandGray,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    flex: 1,
    fontSize: 12,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.brandDark,
  },

  /* ── Divider between menu items ── */
  divider: {
    height: 1,
    backgroundColor: Colors.brandGray,
    marginLeft: 60,
  },

  /* ── Logout button ── */
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: Colors.brandGray,
    borderRadius: 9999,
    paddingVertical: 14,
  },
  logoutText: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.brandDark,
  },
});
