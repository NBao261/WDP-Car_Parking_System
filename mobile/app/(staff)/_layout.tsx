import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  StyleSheet,
  Platform,
  Modal,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  Colors,
  Typography,
  BorderRadius,
  Shadows,
  Spacing,
} from "../../src/constants/theme";
import { useAuthStore } from "../../src/store/useAuthStore";

function TabIcon({
  name,
  color,
  focused,
}: {
  name: any;
  color: string;
  focused: boolean;
}) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Ionicons name={name} size={22} color={color} />
    </View>
  );
}

export default function StaffLayout() {
  const { user, selectedFacilityId, setSelectedFacilityId } = useAuthStore();

  // /users/me already populates assignedFacilities with full objects
  // e.g. [{_id: "abc", name: "Building A", address: "..."}]
  const facilities = (user?.assignedFacilities || []) as any[];

  return (
    <>
      <Modal
        visible={!selectedFacilityId}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientMid]}
            style={styles.modalHeaderGradient}
          >
            <SafeAreaView edges={["top"]} style={styles.modalHeaderSafe}>
              <View style={styles.iconCircle}>
                <Ionicons name="business" size={32} color={Colors.primary} />
              </View>
              <Text style={styles.modalTitle}>Vị Trí Làm Việc</Text>
              <Text style={styles.modalSubtitle}>
                Chọn toà nhà bạn sẽ trực trong ca này
              </Text>
            </SafeAreaView>
          </LinearGradient>

          <View style={styles.modalContent}>
            {facilities.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="alert-circle-outline"
                  size={48}
                  color={Colors.danger}
                />
                <Text style={styles.emptyText}>
                  Bạn chưa được phân công tại toà nhà nào. Vui lòng liên hệ
                  Admin.
                </Text>
              </View>
            ) : (
              <View style={styles.facilityList}>
                {facilities.map((f) => (
                  <TouchableOpacity
                    key={f._id}
                    style={styles.facilityCard}
                    onPress={() => setSelectedFacilityId(f._id)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.facilityIconWrap,
                        { backgroundColor: Colors.primaryBg },
                      ]}
                    >
                      <Ionicons
                        name="business"
                        size={24}
                        color={Colors.primary}
                      />
                    </View>
                    <View style={styles.facilityInfo}>
                      <Text style={styles.facilityName}>{f.name}</Text>
                      <Text style={styles.facilityAddress} numberOfLines={1}>
                        {f.address}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={Colors.textTertiary}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </Modal>

      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: "#9EA894",
          tabBarLabelStyle: {
            fontSize: 11,
            fontFamily: Typography.fontFamily.semiBold,
            marginTop: 0,
          },
          tabBarStyle: {
            backgroundColor: Colors.white,
            borderTopWidth: 0,
            height: Platform.OS === "ios" ? 84 : 64,
            paddingBottom: Platform.OS === "ios" ? 24 : 8,
            paddingTop: 6,
            shadowColor: "#3A5A1A",
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.08,
            shadowRadius: 16,
            elevation: 12,
          },
          headerStyle: {
            backgroundColor: Colors.white,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: Colors.textPrimary,
          headerTitleStyle: {
            fontFamily: Typography.fontFamily.bold,
            fontSize: Typography.fontSize.md,
          },
        }}
      >
        <Tabs.Screen
          name="scan-plate"
          options={{
            href: "/(staff)/scan-plate",
            title: "Quét biển số",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                name={focused ? "camera" : "camera-outline"}
                color={color}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="staff-history"
          options={{
            href: "/(staff)/staff-history",
            title: "Lịch sử",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                name={focused ? "time" : "time-outline"}
                color={color}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="exceptions"
          options={{
            href: "/(staff)/exceptions",
            title: "Sự cố",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                name={focused ? "alert-circle" : "alert-circle-outline"}
                color={color}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            href: "/(staff)/account",
            title: "Tài khoản",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                name={focused ? "person" : "person-outline"}
                color={color}
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 36,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
  iconWrapActive: {
    backgroundColor: Colors.primaryBg,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalContent: {
    flex: 1,
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  modalHeaderGradient: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 30,
  },
  modalHeaderSafe: {
    alignItems: "center",
    marginTop: Platform.OS === "ios" ? 0 : 40,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    ...Shadows.sm,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.white,
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.white,
    opacity: 0.9,
    textAlign: "center",
  },
  facilityList: {
    gap: 16,
  },
  facilityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#5E8F25",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  facilityIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  facilityInfo: {
    flex: 1,
    marginLeft: 16,
  },
  facilityName: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  facilityAddress: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 60,
    padding: 20,
  },
  emptyText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.danger,
    textAlign: "center",
    marginTop: 16,
    lineHeight: 24,
  },
});
