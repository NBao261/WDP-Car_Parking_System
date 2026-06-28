import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Alert, ActivityIndicator, Image,
} from "react-native";
import { useRouter, Stack, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Typography, Shadows } from "../../src/constants/theme";
import { vehicleApi } from "../../src/services/api";

interface VehicleItem {
  _id: string;
  licensePlate: string;
  nickname: string;
  image: string;
  isDefault: boolean;
  isInUse: boolean;
  inUseReason: string;
  vehicleTypeId: { _id: string; name: string; code: string; icon: string } | null;
}

export default function MyVehiclesScreen() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const res: any = await vehicleApi.getMyVehicles();
      if (res.success) {
        setVehicles(res.data);
      }
    } catch (err) {
      console.error("Failed to load vehicles:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload mỗi khi focus (VD: quay lại từ add-vehicle)
  useFocusEffect(
    useCallback(() => {
      loadVehicles();
    }, [loadVehicles])
  );

  const handleDelete = (vehicle: VehicleItem) => {
    if (vehicle.isInUse) {
      Alert.alert(
        "Không thể xoá",
        `${vehicle.inUseReason}. Vui lòng hoàn tất trước khi xoá xe.`
      );
      return;
    }
    Alert.alert(
      "Xoá xe",
      `Bạn có chắc muốn xoá xe biển số "${vehicle.licensePlate}"?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xoá",
          style: "destructive",
          onPress: async () => {
            try {
              await vehicleApi.deleteVehicle(vehicle._id);
              setVehicles((prev) => prev.filter((v) => v._id !== vehicle._id));
            } catch (err: any) {
              Alert.alert("Lỗi", err.message || "Không thể xoá xe");
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (vehicle: VehicleItem) => {
    if (vehicle.isDefault) return;
    try {
      await vehicleApi.updateVehicle(vehicle._id, { isDefault: true });
      setVehicles((prev) =>
        prev.map((v) => ({ ...v, isDefault: v._id === vehicle._id }))
      );
    } catch (err: any) {
      Alert.alert("Lỗi", err.message || "Không thể cập nhật");
    }
  };

  const handleEdit = (vehicle: VehicleItem) => {
    if (vehicle.isInUse) {
      Alert.alert(
        "Không thể chỉnh sửa",
        `${vehicle.inUseReason}. Vui lòng hoàn tất trước khi chỉnh sửa xe.`
      );
      return;
    }
    router.push(`/profile/edit-vehicle?id=${vehicle._id}` as any);
  };

  const getVehicleIcon = (code?: string): any => {
    if (!code) return "car-outline";
    const lower = code.toLowerCase();
    if (lower.includes("moto") || lower.includes("bike") || lower.includes("xm")) return "bicycle-outline";
    if (lower.includes("truck")) return "bus-outline";
    return "car-sport-outline";
  };

  const renderVehicle = ({ item }: { item: VehicleItem }) => {
    const vtName = item.vehicleTypeId?.name || "Không rõ";
    const vtCode = item.vehicleTypeId?.code || "";

    return (
      <TouchableOpacity
        style={[styles.card, item.isDefault && styles.cardDefault, item.isInUse && styles.cardInUse]}
        activeOpacity={0.85}
        onLongPress={() => handleDelete(item)}
        onPress={() => handleEdit(item)}
      >
        {/* Ảnh xe hoặc icon fallback */}
        <View style={styles.cardImageWrap}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.cardImage} />
          ) : (
            <View style={styles.cardIconFallback}>
              <Ionicons
                name={getVehicleIcon(vtCode)}
                size={32}
                color={Colors.primary}
              />
            </View>
          )}
        </View>

        <View style={styles.cardBody}>
          {/* Biển số */}
          <Text style={styles.plateText}>{item.licensePlate}</Text>

          {/* Loại xe */}
          <View style={styles.typeRow}>
            <Ionicons name={getVehicleIcon(vtCode)} size={14} color={Colors.textTertiary} />
            <Text style={styles.typeText}>{vtName}</Text>
          </View>

          {/* Nickname */}
          {!!item.nickname && (
            <Text style={styles.nicknameText}>{item.nickname}</Text>
          )}
        </View>

        {/* Badge & Actions */}
        <View style={styles.cardActions}>
          {item.isInUse && (
            <View style={styles.inUseBadge}>
              <Ionicons name="lock-closed" size={10} color={Colors.white} />
              <Text style={styles.inUseBadgeText}>{item.inUseReason || 'Đang sử dụng'}</Text>
            </View>
          )}
          {item.isDefault && (
            <View style={styles.defaultBadge}>
              <Ionicons name="star" size={10} color={Colors.white} />
              <Text style={styles.defaultBadgeText}>Mặc định</Text>
            </View>
          )}
          <View style={styles.cardActionsRow}>
            <TouchableOpacity
              onPress={() => handleEdit(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              disabled={item.isInUse}
            >
              <Ionicons name="create-outline" size={18} color={item.isInUse ? Colors.disabled : Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              disabled={item.isInUse}
            >
              <Ionicons name="trash-outline" size={18} color={item.isInUse ? Colors.disabled : Colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name="car-outline" size={56} color={Colors.disabled} />
      </View>
      <Text style={styles.emptyTitle}>Chưa có xe nào</Text>
      <Text style={styles.emptySubtitle}>
        Thêm xe của bạn để quản lý và đặt chỗ dễ dàng hơn
      </Text>
      <TouchableOpacity
        style={styles.emptyBtn}
        onPress={() => router.push("/profile/add-vehicle" as any)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={18} color={Colors.white} />
        <Text style={styles.emptyBtnText}>Thêm xe đầu tiên</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.root}>
        {/* ── Gradient Header ── */}
        <View style={styles.heroWrapper}>
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
                <Text style={styles.heroTitle}>Xe của tôi</Text>
                <View style={{ width: 38 }} />
              </View>
              <View style={styles.heroBody}>
                <View style={styles.heroIconWrap}>
                  <Ionicons name="car-sport" size={22} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.heroSub}>
                    Quản lý các xe đã đăng ký của bạn
                  </Text>
                  <Text style={styles.heroCount}>
                    {vehicles.length} xe đã đăng ký
                  </Text>
                </View>
              </View>
            </SafeAreaView>
          </LinearGradient>
        </View>

        {/* ── Vehicle List ── */}
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            data={vehicles}
            keyExtractor={(item) => item._id}
            renderItem={renderVehicle}
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* ── FAB ── */}
        {!loading && vehicles.length > 0 && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => router.push("/profile/add-vehicle" as any)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientMid]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fabGradient}
            >
              <Ionicons name="add" size={28} color={Colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  // Hero
  heroWrapper: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
  },
  hero: { paddingHorizontal: 16, paddingBottom: 24 },
  heroNav: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingTop: 8, marginBottom: 16,
  },
  backBtn: {
    width: 38, height: 38, alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 19,
  },
  heroTitle: { fontSize: 17, fontFamily: Typography.fontFamily.bold, color: Colors.white },
  heroBody: { flexDirection: "row", alignItems: "center", gap: 12 },
  heroIconWrap: {
    width: 46, height: 46, borderRadius: 12, backgroundColor: Colors.white,
    alignItems: "center", justifyContent: "center", ...Shadows.sm,
  },
  heroSub: { fontSize: 13, color: Colors.textOnDarkMuted, fontFamily: Typography.fontFamily.regular },
  heroCount: { fontSize: 14, color: Colors.gradientAccent, fontFamily: Typography.fontFamily.semiBold, marginTop: 2 },

  // List
  listContent: { padding: 16, paddingBottom: 100 },
  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Card
  card: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface, borderRadius: 18,
    padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  cardDefault: {
    borderColor: Colors.primary + "40",
    backgroundColor: Colors.primaryBg,
  },
  cardImageWrap: {
    width: 64, height: 64, borderRadius: 14, overflow: "hidden",
    marginRight: 14,
  },
  cardImage: { width: 64, height: 64, borderRadius: 14 },
  cardIconFallback: {
    width: 64, height: 64, borderRadius: 14,
    backgroundColor: Colors.surfaceElevated,
    alignItems: "center", justifyContent: "center",
  },
  cardBody: { flex: 1 },
  plateText: {
    fontSize: 18, fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary, letterSpacing: 1,
  },
  typeRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  typeText: {
    fontSize: 12, fontFamily: Typography.fontFamily.medium,
    color: Colors.textTertiary,
  },
  nicknameText: {
    fontSize: 12, fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary, marginTop: 2, fontStyle: "italic",
  },
  cardActions: { alignItems: "flex-end", gap: 8 },
  cardActionsRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  defaultBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: Colors.primary, borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  defaultBadgeText: {
    fontSize: 10, fontFamily: Typography.fontFamily.semiBold,
    color: Colors.white,
  },
  inUseBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "#E65100", borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  inUseBadgeText: {
    fontSize: 10, fontFamily: Typography.fontFamily.semiBold,
    color: Colors.white,
  },
  cardInUse: {
    opacity: 0.65,
    borderColor: "#E65100" + "40",
  },

  // Empty
  emptyWrap: {
    flex: 1, justifyContent: "center", alignItems: "center",
    paddingHorizontal: 40, paddingTop: 60,
  },
  emptyIconWrap: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.surfaceElevated,
    alignItems: "center", justifyContent: "center", marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18, fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary, marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14, fontFamily: Typography.fontFamily.regular,
    color: Colors.textTertiary, textAlign: "center", lineHeight: 20, marginBottom: 24,
  },
  emptyBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: Colors.primary, borderRadius: 14,
    paddingHorizontal: 24, paddingVertical: 14,
    ...Shadows.md,
  },
  emptyBtnText: {
    fontSize: 15, fontFamily: Typography.fontFamily.bold,
    color: Colors.white,
  },

  // FAB
  fab: {
    position: "absolute", bottom: 24, right: 20,
    ...Shadows.lg,
  },
  fabGradient: {
    width: 58, height: 58, borderRadius: 29,
    alignItems: "center", justifyContent: "center",
  },
});
