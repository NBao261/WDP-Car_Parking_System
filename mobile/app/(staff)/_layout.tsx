import React, { useState } from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  StyleSheet,
  Platform,
  Modal,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
  const [pendingFacilityId, setPendingFacilityId] = useState<string | null>(null);

  // /users/me already populates assignedFacilities with full objects
  // e.g. [{_id: "abc", name: "Building A", address: "..."}]
  const facilities = (user?.assignedFacilities || []) as any[];

  const handleConfirm = () => {
    if (pendingFacilityId) {
      setSelectedFacilityId(pendingFacilityId);
      setPendingFacilityId(null);
    }
  };

  return (
    <>
      <Modal
        visible={!selectedFacilityId}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Header Section — centered icon + titles */}
              <View style={styles.modalHeaderSection}>
                <View style={styles.iconBlock}>
                  <Ionicons name="business" size={36} color={Colors.primary} />
                </View>
                <Text style={styles.modalTitle}>Vị Trí Làm Việc</Text>
                <Text style={styles.modalSubtitle}>
                  Chọn toà nhà bạn sẽ trực trong ca này
                </Text>
              </View>

              {/* Facility List */}
              {facilities.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconWrap}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={40}
                      color={Colors.danger}
                    />
                  </View>
                  <Text style={styles.emptyText}>
                    Bạn chưa được phân công tại toà nhà nào. Vui lòng liên hệ
                    Admin.
                  </Text>
                </View>
              ) : (
                <View style={styles.facilityList}>
                  {facilities.map((f) => {
                    const isSelected = pendingFacilityId === f._id;
                    return (
                      <TouchableOpacity
                        key={f._id}
                        style={[
                          styles.facilityCard,
                          isSelected && styles.facilityCardSelected,
                        ]}
                        onPress={() => setPendingFacilityId(f._id)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.facilityIconCircle}>
                          <Ionicons
                            name="business"
                            size={22}
                            color={Colors.brandDark}
                          />
                        </View>
                        <View style={styles.facilityInfo}>
                          <Text style={styles.facilityName}>{f.name}</Text>
                          <Text
                            style={styles.facilityAddress}
                            numberOfLines={1}
                          >
                            {f.address}
                          </Text>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color={Colors.textTertiary}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </ScrollView>

            {/* Continue Button — fixed at bottom */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  !pendingFacilityId && styles.continueButtonDisabled,
                ]}
                onPress={handleConfirm}
                disabled={!pendingFacilityId}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.continueButtonText,
                    !pendingFacilityId && styles.continueButtonTextDisabled,
                  ]}
                >
                  Tiếp Tục
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
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

  // ── Location Select Modal ──
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  modalScrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    flexGrow: 1,
  },
  modalHeaderSection: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 32,
  },
  iconBlock: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: Colors.brandDark,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    ...Shadows.md,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.brandDark,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 15,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textTertiary,
    textAlign: "center",
  },

  // ── Facility Cards ──
  facilityList: {
    gap: 14,
    flex: 1,
  },
  facilityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceElevated,
    padding: 16,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "transparent",
  },
  facilityCardSelected: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.primary,
    ...Shadows.sm,
  },
  facilityIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.sm,
  },
  facilityInfo: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  facilityName: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.brandDark,
    marginBottom: 2,
  },
  facilityAddress: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textTertiary,
  },

  // ── Continue Button ──
  modalFooter: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 12 : 20,
    paddingTop: 12,
  },
  continueButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.sm,
  },
  continueButtonDisabled: {
    backgroundColor: Colors.disabled,
  },
  continueButtonText: {
    fontSize: 17,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.brandDark,
  },
  continueButtonTextDisabled: {
    color: Colors.textTertiary,
  },

  // ── Empty state ──
  emptyState: {
    alignItems: "center",
    marginTop: 60,
    padding: 20,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.dangerLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.danger,
    textAlign: "center",
    lineHeight: 24,
  },
});
