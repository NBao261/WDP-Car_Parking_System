import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Card, Badge, Button } from "../../src/components";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
} from "../../src/constants/theme";
import { api } from "../../src/services/api";
import {
  Facility,
  PricingPlan,
  AvailableSlot,
} from "../../src/types/facility.types";

const getVehicleIcon = (code?: string): keyof typeof Ionicons.glyphMap => {
  if (!code) return "bicycle";
  const upper = code.toUpperCase();
  if (upper.includes("CAR")) return "car-sport";
  if (upper.includes("BUS")) return "bus";
  if (upper.includes("TRUCK")) return "car"; 
  if (upper.includes("MOTO")) return "bicycle";
  return "bicycle";
};

export default function FacilityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [pricing, setPricing] = useState<PricingPlan[]>([]);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const facilitiesList = await api.getPublicFacilities(1, 100);
      const foundFacility = facilitiesList.find((f: Facility) => f._id === id);
      if (foundFacility) {
        setFacility(foundFacility);
      }

      const [pricingData, slotsData] = await Promise.all([
        api.getPublicPricing(id),
        api.getAvailableSlots(id),
      ]);

      setPricing(pricingData);
      setSlots(slotsData);
    } catch (error) {
      console.log("Error fetching facility details", error);
      Alert.alert("Lỗi", "Không thể tải thông tin bãi xe.");
    }
  };

  const initialLoad = async () => {
    setLoading(true);
    await loadData();
    setLoading(false);
  };

  useEffect(() => {
    if (id) {
      initialLoad();
    }
  }, [id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!facility) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Không tìm thấy thông tin bãi xe</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        {/* Custom Header */}
        <View style={styles.customHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Chi tiết bãi xe</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Facility Basic Info */}
        <Card variant="elevated">
          <View style={styles.headerRow}>
            <Text style={styles.facilityName}>{facility.name}</Text>
            <Badge
              label={facility.status === "active" ? "Mở cửa" : "Đóng cửa"}
              variant={facility.status === "active" ? "success" : "danger"}
              size="sm"
            />
          </View>

          <View style={styles.infoRow}>
            <Ionicons
              name="location-outline"
              size={18}
              color={Colors.textSecondary}
            />
            <Text style={styles.infoText}>{facility.address}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons
              name="time-outline"
              size={18}
              color={Colors.textSecondary}
            />
            <Text style={styles.infoText}>
              {facility.operationHours?.open || "00:00"} -{" "}
              {facility.operationHours?.close || "23:59"}
            </Text>
          </View>
        </Card>

        {/* Available Slots Section */}
        <Text style={styles.sectionTitle}>Slot Trống</Text>
        <View style={styles.slotsGrid}>
          {slots.length === 0 ? (
            <Text style={styles.emptyText}>Chưa có thông tin slot.</Text>
          ) : (
            slots.map((slot) => (
              <View key={slot.vehicleTypeId} style={styles.slotCard}>
                <Ionicons
                  name={getVehicleIcon(slot.vehicleTypeCode)}
                  size={32}
                  color={Colors.primary}
                />
                <Text style={styles.slotCount}>{slot.availableCount}</Text>
                <Text style={styles.slotType}>{slot.vehicleTypeName}</Text>
              </View>
            ))
          )}
        </View>

        {/* Pricing Section */}
        <Text style={styles.sectionTitle}>Bảng Giá</Text>
        {pricing.length === 0 ? (
          <Text style={styles.emptyText}>Chưa có thông tin bảng giá.</Text>
        ) : (
          pricing.map((plan) => (
            <Card key={plan._id} variant="outlined" style={styles.pricingCard}>
              <View style={styles.pricingHeader}>
                <Ionicons
                  name={getVehicleIcon(plan.vehicleTypeId?.code)}
                  size={20}
                  color={Colors.textPrimary}
                />
                <Text style={styles.pricingTitle}>
                  {plan.name} {plan.vehicleTypeId?.name ? `(${plan.vehicleTypeId.name})` : ''}
                </Text>
              </View>

              {plan.rates && plan.rates.map((rate, index) => (
                <View key={index} style={styles.priceRow}>
                  <Text style={styles.priceLabel}>{rate.label}:</Text>
                  <Text style={styles.priceValue}>
                    {rate.amount.toLocaleString()} đ / {rate.unit}
                  </Text>
                </View>
              ))}

              {plan.overnightFee > 0 && (
                <View style={styles.extraBlocksContainer}>
                  <Text style={styles.extraBlocksTitle}>Phụ phí:</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Gửi qua đêm:</Text>
                    <Text style={styles.priceValue}>
                      {plan.overnightFee.toLocaleString()} đ
                    </Text>
                  </View>
                </View>
              )}
            </Card>
          ))
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button 
          title="Đặt chỗ ngay" 
          onPress={() => router.push(`/facility/${id}/book`)}
          fullWidth 
          size="lg"
        />
      </View>
    </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  content: {
    padding: Spacing.base,
    paddingBottom: Spacing["2xl"],
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  errorText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  facilityName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  infoText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    flex: 1,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  slotCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderCurve: "continuous",
    padding: Spacing.md,
    alignItems: "center",
    // ...Shadows.sm if we had it exported, but we can't easily spread CSS boxShadow in React Native stylesheet unless RN supports it.
    // Expo SDK 52 / RN 0.76 supports boxShadow string
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
  },
  slotCount: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  slotType: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  emptyText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textTertiary,
    fontStyle: "italic",
  },
  pricingCard: {
    marginBottom: Spacing.sm,
  },
  pricingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pricingTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textPrimary,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  priceLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  priceValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.primary,
  },
  extraBlocksContainer: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  extraBlocksTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  bottomBar: {
    padding: Spacing.base,
    paddingTop: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  }
});
