import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl, ActivityIndicator, Alert, TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  Colors, Typography, Spacing, BorderRadius, Shadows,
} from "../../src/constants/theme";
import { api } from "../../src/services/api";
import { Facility, PricingPlan, AvailableSlot } from "../../src/types/facility.types";

const getVehicleIcon = (code?: string): keyof typeof Ionicons.glyphMap => {
  if (!code) return "bicycle";
  const u = code.toUpperCase();
  if (u.includes("CAR")) return "car-sport";
  if (u.includes("BUS")) return "bus";
  if (u.includes("TRUCK")) return "car";
  if (u.includes("MOTO")) return "bicycle";
  return "bicycle";
};

function InfoRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrap}>
        <Ionicons name={icon} size={16} color={Colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

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
      const found = facilitiesList.find((f: Facility) => f._id === id);
      if (found) setFacility(found);
      const [pricingData, slotsData] = await Promise.all([
        api.getPublicPricing(id),
        api.getAvailableSlots(id),
      ]);
      setPricing(pricingData);
      setSlots(slotsData);
    } catch {
      Alert.alert("Lỗi", "Không thể tải thông tin bãi xe.");
    }
  };

  useEffect(() => {
    if (id) { setLoading(true); loadData().finally(() => setLoading(false)); }
  }, [id]);

  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  const isOpen = facility?.status === "active";

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  if (!facility) {
    return (
      <View style={styles.center}>
        <Ionicons name="business-outline" size={48} color={Colors.textTertiary} />
        <Text style={styles.errorText}>Không tìm thấy bãi xe</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.root}>
        {/* ── Gradient Hero Header ── */}
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientMid]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <SafeAreaView edges={["top"]}>
            {/* Back button row */}
            <View style={styles.heroNav}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={22} color={Colors.white} />
              </TouchableOpacity>
              <Text style={styles.heroNavTitle}>Chi tiết bãi xe</Text>
              <View style={{ width: 38 }} />
            </View>

            {/* Facility name + status */}
            <View style={styles.heroBody}>
              <View style={styles.heroIconWrap}>
                <Ionicons name="business" size={26} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroName}>{facility.name}</Text>
                <View style={[styles.statusPill, { backgroundColor: isOpen ? Colors.success + "25" : Colors.danger + "25" }]}>
                  <View style={[styles.statusDot, { backgroundColor: isOpen ? Colors.success : Colors.danger }]} />
                  <Text style={[styles.statusText, { color: isOpen ? Colors.success : Colors.danger }]}>
                    {isOpen ? "Đang mở cửa" : "Đóng cửa"}
                  </Text>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* ── Scrollable Content ── */}
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        >
          {/* Basic Info card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Thông tin bãi xe</Text>
            <InfoRow icon="location-outline" label="Địa chỉ" value={facility.address} />
            <View style={styles.divider} />
            <InfoRow
              icon="time-outline"
              label="Giờ hoạt động"
              value={`${facility.operationHours?.open || "06:00"} – ${facility.operationHours?.close || "22:00"}`}
            />
          </View>

          {/* Available Slots */}
          <Text style={styles.sectionTitle}>Chỗ trống hiện tại</Text>
          {slots.length === 0 ? (
            <View style={styles.emptySlots}>
              <Text style={styles.emptyText}>Chưa có thông tin chỗ trống</Text>
            </View>
          ) : (
            <View style={styles.slotsGrid}>
              {slots.map((slot) => {
                const avail = slot.availableCount;
                const dotColor = avail > 10 ? Colors.success : avail > 0 ? Colors.warning : Colors.danger;
                return (
                  <View key={slot.vehicleTypeId} style={styles.slotCard}>
                    <View style={[styles.slotIconWrap, { backgroundColor: Colors.primaryBg }]}>
                      <Ionicons name={getVehicleIcon(slot.vehicleTypeCode)} size={24} color={Colors.primary} />
                    </View>
                    <Text style={[styles.slotCount, { color: dotColor }]}>{avail}</Text>
                    <Text style={styles.slotType}>{slot.vehicleTypeName}</Text>
                    <View style={[styles.slotDot, { backgroundColor: dotColor }]} />
                  </View>
                );
              })}
            </View>
          )}

          {/* Pricing */}
          <Text style={styles.sectionTitle}>Bảng giá</Text>
          {pricing.length === 0 ? (
            <View style={styles.emptySlots}>
              <Text style={styles.emptyText}>Chưa có bảng giá</Text>
            </View>
          ) : (
            pricing.map((plan) => (
              <View key={plan._id} style={styles.pricingCard}>
                <View style={styles.pricingHeader}>
                  <View style={[styles.slotIconWrap, { backgroundColor: Colors.secondaryLight + "18" }]}>
                    <Ionicons name={getVehicleIcon(plan.vehicleTypeId?.code)} size={18} color={Colors.secondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pricingName}>{plan.name}</Text>
                    {plan.vehicleTypeId?.name && (
                      <Text style={styles.pricingType}>{plan.vehicleTypeId.name}</Text>
                    )}
                  </View>
                </View>
                {plan.rates?.map((rate, i) => (
                  <View key={i} style={styles.priceRow}>
                    <Text style={styles.priceLabel}>{rate.label}</Text>
                    <Text style={styles.priceValue}>{rate.amount.toLocaleString("vi-VN")}đ / {rate.unit}</Text>
                  </View>
                ))}
                {plan.overnightFee > 0 && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.priceRow}>
                      <Text style={styles.priceLabel}>Gửi qua đêm</Text>
                      <Text style={[styles.priceValue, { color: Colors.warning }]}>{plan.overnightFee.toLocaleString("vi-VN")}đ</Text>
                    </View>
                  </>
                )}
              </View>
            ))
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* ── Sticky Bottom CTA ── */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomInfo}>
            <Ionicons name="car-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.bottomInfoText}>
              {slots.reduce((s, sl) => s + sl.availableCount, 0)} chỗ trống
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.bookBtn, !isOpen && styles.bookBtnDisabled]}
            onPress={() => isOpen ? router.push(`/facility/${id}/book`) : null}
            activeOpacity={0.85}
          >
            <Ionicons name="calendar-outline" size={18} color={Colors.white} />
            <Text style={styles.bookBtnText}>
              {isOpen ? "Đặt chỗ ngay" : "Bãi xe đóng cửa"}
            </Text>
          </TouchableOpacity>
        </View>
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
  heroNavTitle: { fontSize: 16, fontFamily: Typography.fontFamily.semiBold, color: Colors.white },
  heroBody: { flexDirection: "row", alignItems: "center", gap: 14 },
  heroIconWrap: { width: 52, height: 52, borderRadius: 14, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center", ...Shadows.sm },
  heroName: { fontSize: 20, fontFamily: Typography.fontFamily.bold, color: Colors.white, marginBottom: 6 },
  statusPill: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 12, fontFamily: Typography.fontFamily.semiBold },

  // Content
  content: { padding: 16 },

  // Info card
  card: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: Colors.borderLight, ...Shadows.sm },
  cardTitle: { fontSize: 13, fontFamily: Typography.fontFamily.semiBold, color: Colors.textTertiary, textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 12 },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 4 },
  infoIconWrap: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.primaryBg, alignItems: "center", justifyContent: "center", marginTop: 2 },
  infoLabel: { fontSize: 11, color: Colors.textTertiary, fontFamily: Typography.fontFamily.medium, marginBottom: 2 },
  infoValue: { fontSize: 14, color: Colors.textPrimary, fontFamily: Typography.fontFamily.semiBold },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: 10 },

  // Sections
  sectionTitle: { fontSize: 16, fontFamily: Typography.fontFamily.semiBold, color: Colors.textPrimary, marginBottom: 12 },

  // Slots grid
  slotsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 20 },
  slotCard: {
    flex: 1, minWidth: "44%", backgroundColor: Colors.surface,
    borderRadius: 14, padding: 14, alignItems: "center",
    borderWidth: 1, borderColor: Colors.borderLight, ...Shadows.sm,
  },
  slotIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  slotCount: { fontSize: 28, fontFamily: Typography.fontFamily.bold, marginBottom: 2 },
  slotType: { fontSize: 12, color: Colors.textSecondary, fontFamily: Typography.fontFamily.medium, textAlign: "center" },
  slotDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  emptySlots: { backgroundColor: Colors.surface, borderRadius: 12, padding: 20, alignItems: "center", marginBottom: 20, borderWidth: 1, borderColor: Colors.borderLight },
  emptyText: { color: Colors.textTertiary, fontSize: 13, fontFamily: Typography.fontFamily.medium },

  // Pricing cards
  pricingCard: { backgroundColor: Colors.surface, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: Colors.borderLight, ...Shadows.sm },
  pricingHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  pricingName: { fontSize: 14, fontFamily: Typography.fontFamily.semiBold, color: Colors.textPrimary },
  pricingType: { fontSize: 12, color: Colors.textTertiary, fontFamily: Typography.fontFamily.medium, marginTop: 1 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 3 },
  priceLabel: { fontSize: 13, color: Colors.textSecondary, fontFamily: Typography.fontFamily.regular },
  priceValue: { fontSize: 14, fontFamily: Typography.fontFamily.semiBold, color: Colors.primary },

  // Bottom bar
  bottomBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: 16, paddingBottom: 28,
    backgroundColor: Colors.surface,
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
    ...Shadows.lg,
  },
  bottomInfo: { flexDirection: "row", alignItems: "center", gap: 6 },
  bottomInfoText: { fontSize: 13, color: Colors.textSecondary, fontFamily: Typography.fontFamily.medium },
  bookBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.primary, borderRadius: 14,
    paddingHorizontal: 22, paddingVertical: 13,
  },
  bookBtnDisabled: { backgroundColor: Colors.disabled },
  bookBtnText: { fontSize: 15, fontFamily: Typography.fontFamily.semiBold, color: Colors.white },

  // States
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8, backgroundColor: Colors.background },
  loadingText: { fontSize: 13, color: Colors.textSecondary, fontFamily: Typography.fontFamily.medium },
  errorText: { fontSize: 15, color: Colors.textSecondary, fontFamily: Typography.fontFamily.medium },
});
