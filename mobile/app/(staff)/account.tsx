import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Colors,
  Typography,
  Spacing,
  Shadows,
} from "../../src/constants/theme";
import { useAuthStore } from "../../src/store/useAuthStore";

function getInitials(name?: string) {
  if (!name) return "S";
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
  onPress: () => void;
  iconBg?: string;
}

function MenuItem({
  icon,
  label,
  onPress,
  iconBg = Colors.surfaceElevated,
}: MenuItemProps) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={Colors.brandDark} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons
        name="chevron-forward"
        size={16}
        color={Colors.textTertiary}
      />
    </TouchableOpacity>
  );
}

export default function StaffAccountScreen() {
  const router = useRouter();
  const { user, logout, selectedFacilityId, setSelectedFacilityId } =
    useAuthStore();

  // Derive facility name from already-populated assignedFacilities
  const facilityName = (() => {
    if (!selectedFacilityId || !user?.assignedFacilities) return "Chưa chọn";
    const f = (user.assignedFacilities as any[]).find(
      (af: any) =>
        (typeof af === "string" ? af : af._id) === selectedFacilityId,
    );
    return f?.name || selectedFacilityId;
  })();

  const handleLogout = () => {
    Alert.alert("Xác nhận đăng xuất", "Bạn có chắc chắn muốn đăng xuất khỏi phiên làm việc?", [
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
        <SafeAreaView edges={["top"]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Cá nhân</Text>
            <Text style={styles.versionText}>Ver 1.0.4</Text>
          </View>

          {/* Profile Info */}
          <View style={styles.profileSection}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarText}>
                  {getInitials(user?.name)}
                </Text>
              </View>
            </View>

            <Text style={styles.profileName}>{user?.name || "Staff"}</Text>

            {/* Role Badge */}
            <View style={styles.roleBadge}>
              <Ionicons
                name="briefcase"
                size={14}
                color={Colors.primary}
              />
              <Text style={styles.roleText}>
                {user?.role?.toUpperCase() || "NHÂN VIÊN"}
              </Text>
            </View>

            <Text style={styles.empId}>
              {user?.email}
            </Text>
          </View>

          {/* Work Info Card */}
          <View style={styles.workCard}>
            <View style={styles.workCardContent}>
              <View style={styles.workCardLeft}>
                <View style={styles.workIconCircle}>
                  <Ionicons name="business" size={20} color={Colors.brandDark} />
                </View>
                <View style={styles.workInfo}>
                  <Text style={styles.workLabel}>TOÀ NHÀ ĐANG TRỰC</Text>
                  <Text style={styles.workName} numberOfLines={1}>
                    {facilityName}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.changeButton}
                onPress={() => setSelectedFacilityId(null)}
              >
                <Text style={styles.changeButtonText}>Thay đổi</Text>
              </TouchableOpacity>
            </View>
            {/* Decorative blur circle */}
            <View style={styles.blurDecor} />
          </View>

          {/* Security Section */}
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>BẢO MẬT</Text>
            <View style={styles.sectionCard}>
              <MenuItem
                icon="lock-closed-outline"
                label="Đổi mật khẩu"
                onPress={() => router.push("/profile/change-password" as any)}
              />
            </View>
          </View>

          {/* Support Section */}
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>HỖ TRỢ & Ý KIẾN</Text>
            <View style={styles.sectionCard}>
              <MenuItem
                icon="chatbubble-ellipses-outline"
                label="Gửi phản hồi đóng góp"
                onPress={() => router.push("/feedback/create" as any)}
              />
              <View style={styles.divider} />
              <MenuItem
                icon="list-outline"
                label="Lịch sử phản hồi của tôi"
                onPress={() => router.push("/feedback" as any)}
              />
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.logoutText}>Đăng xuất tài khoản</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  scrollContent: { paddingBottom: 40 },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.brandDark,
  },
  versionText: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
  },

  // Profile
  profileSection: {
    alignItems: "center",
    paddingVertical: 16,
  },
  avatarWrap: {
    marginBottom: 14,
  },
  avatarLarge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.brandDark,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "rgba(164, 255, 7, 0.25)",
    ...Shadows.md,
  },
  avatarText: {
    fontSize: 32,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
  },
  profileName: {
    fontSize: 22,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.brandDark,
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.brandDark,
    borderRadius: 9999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 6,
  },
  roleText: {
    fontSize: 12,
    color: Colors.white,
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: 1,
  },
  empId: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: 0.5,
  },

  // Work Info Card
  workCard: {
    backgroundColor: Colors.brandDark,
    borderRadius: 22,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 24,
    marginTop: 8,
    overflow: "hidden",
    ...Shadows.md,
  },
  workCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  workCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  workIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  workInfo: {
    flex: 1,
  },
  workLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  workName: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.white,
  },
  changeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  changeButtonText: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
  },
  blurDecor: {
    position: "absolute",
    right: -24,
    top: -24,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(164, 255, 7, 0.08)",
  },

  // Menu Sections
  menuSection: {
    marginHorizontal: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
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
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.brandDark,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 66,
  },

  // Logout
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 24,
    marginTop: 4,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 9999,
    paddingVertical: 15,
  },
  logoutText: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textSecondary,
  },
});

