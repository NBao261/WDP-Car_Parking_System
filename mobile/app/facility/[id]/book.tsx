import React, { useState, useEffect } from "react";
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
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from "../../../src/constants/theme";
import { Loading } from "../../../src/components";
import { reservationApi, vehicleTypeApi, vehicleApi, api, sessionApi } from "../../../src/services/api";
import { AvailableSlot } from "../../../src/types/facility.types";

const getVehicleIcon = (name: string): any => {
  const n = (name || "").toLowerCase();
  if (n.includes("ô tô") || n.includes("car")) return "car-sport-outline";
  if (n.includes("xe tải") || n.includes("truck")) return "car-outline";
  return "bicycle-outline";
};

interface UserVehicle {
  _id: string;
  licensePlate: string;
  nickname?: string;
  image?: string;
  isDefault: boolean;
  vehicleTypeId: {
    _id: string;
    name: string;
    code: string;
  } | string | null;
}

export default function BookingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const facilityId = typeof id === "string" ? id : id?.[0] || "";

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [facilityName, setFacilityName] = useState("");
  const [facilityOpenTime, setFacilityOpenTime] = useState<string>("06:00");
  const [facilityCloseTime, setFacilityCloseTime] = useState<string>("22:00");

  // Vehicle selection
  const [userVehicles, setUserVehicles] = useState<UserVehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>("");
  const [licensePlate, setLicensePlate] = useState("");
  const [activeSessions, setActiveSessions] = useState<any[]>([]);

  const [startTime, setStartTime] = useState(
    new Date(Date.now() + 35 * 60 * 1000),
  );
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");

  useEffect(() => {
    fetchInitialData();
  }, [facilityId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [vtRes, slotRes, facilities, vehiclesRes, sessionsRes] = await Promise.all<any>([
        vehicleTypeApi.getVehicleTypes(),
        api.getAvailableSlots(facilityId),
        api.getPublicFacilities(1, 100),
        vehicleApi.getMyVehicles(),
        sessionApi.getMySessions('active'),
      ]);

      const slots: AvailableSlot[] = slotRes || [];
      setAvailableSlots(slots);

      if (vtRes.success) {
        const supportedIds = new Set(slots.map((s) => s.vehicleTypeId));
        const supported = (vtRes.data as any[]).filter((vt) => supportedIds.has(vt._id));
        setVehicleTypes(supported);
        if (supported.length > 0) setSelectedVehicleType(supported[0]._id);
      }

      const fac = facilities?.find((f: any) => f._id === facilityId);
      if (fac) {
        setFacilityName(fac.name);
        setFacilityOpenTime(fac.openTime || "06:00");
        setFacilityCloseTime(fac.closeTime || "22:00");
      }

      // Load active sessions
      if (sessionsRes.success && sessionsRes.data) {
        setActiveSessions(sessionsRes.data);
      }

      // Load user's vehicles
      if (vehiclesRes.success && vehiclesRes.data) {
        const vehicles: UserVehicle[] = vehiclesRes.data;
        setUserVehicles(vehicles);

        // Auto-select default vehicle
        const defaultV = vehicles.find((v) => v.isDefault);
        if (defaultV) {
          selectVehicle(defaultV, slots);
        } else if (vehicles.length > 0) {
          selectVehicle(vehicles[0], slots);
        }
      }
    } catch {
      Alert.alert("Lỗi", "Không thể tải dữ liệu, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const selectVehicle = (vehicle: UserVehicle, slots?: AvailableSlot[]) => {
    setSelectedVehicleId(vehicle._id);
    setLicensePlate(vehicle.licensePlate);
    const typeId = !vehicle.vehicleTypeId
      ? ''
      : typeof vehicle.vehicleTypeId === 'string'
        ? vehicle.vehicleTypeId
        : vehicle.vehicleTypeId._id;
    setSelectedVehicleType(typeId);
  };

  const getVehicleTypeId = (vehicle: UserVehicle): string => {
    if (!vehicle.vehicleTypeId) return '';
    return typeof vehicle.vehicleTypeId === 'string'
      ? vehicle.vehicleTypeId
      : vehicle.vehicleTypeId._id;
  };

  const getVehicleTypeName = (vehicle: UserVehicle): string => {
    if (!vehicle.vehicleTypeId || typeof vehicle.vehicleTypeId === 'string') return '';
    return vehicle.vehicleTypeId.name;
  };

  // Filter vehicles by selected vehicle type
  const filteredVehicles = userVehicles.filter((v) => {
    return getVehicleTypeId(v) === selectedVehicleType;
  });

  const handleBook = async () => {
    if (!selectedVehicleId) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn xe để đặt chỗ.");
      return;
    }
    if (startTime.getTime() - Date.now() < 30 * 60 * 1000) {
      Alert.alert("Thời gian không hợp lệ", "Phải đặt trước ít nhất 30 phút.");
      return;
    }

    const startH = startTime.getHours();
    const startM = startTime.getMinutes();
    const startMins = startH * 60 + startM;

    const [openH, openM] = facilityOpenTime.split(':').map(Number);
    const [closeH, closeM] = facilityCloseTime.split(':').map(Number);
    const openMins = openH * 60 + openM;
    const closeMins = closeH * 60 + closeM;

    let isWithinOpenHours = false;
    if (closeMins <= openMins) {
      isWithinOpenHours = startMins >= openMins || startMins < closeMins;
    } else {
      isWithinOpenHours = startMins >= openMins && startMins < closeMins;
    }

    if (!isWithinOpenHours) {
      Alert.alert(
        "Ngoài giờ hoạt động",
        `Bãi xe chỉ mở cửa từ ${facilityOpenTime} đến ${facilityCloseTime}. Vui lòng chọn thời gian khác.`
      );
      return;
    }

    const isCurrentlyParked = activeSessions.some(
      (s) =>
        s.licensePlate === licensePlate &&
        (s.facilityId?._id === facilityId || s.facilityId === facilityId)
    );

    if (isCurrentlyParked) {
      Alert.alert(
        "Lưu ý",
        `Biển số ${licensePlate} hiện đang được gửi tại bãi này. Bạn có chắc chắn muốn đặt trước cho khung giờ sắp tới không?`,
        [
          { text: "Hủy", style: "cancel" },
          { text: "Tiếp tục", onPress: () => performBooking() },
        ]
      );
    } else {
      performBooking();
    }
  };

  const performBooking = async () => {
    try {
      setSubmitting(true);
      const res = (await reservationApi.createReservation({
        facilityId,
        vehicleTypeId: selectedVehicleType,
        licensePlate,
        startTime: startTime.toISOString(),
      })) as any;
      if (res.success) {
        Alert.alert(
          "Đặt chỗ thành công!",
          "Chúng tôi đã giữ chỗ cho bạn. Bạn có thể xem và quản lý đặt chỗ trong mục Hoạt động.",
          [
            {
              text: "Xem đặt chỗ của tôi",
              onPress: () => {
                router.dismissAll();
                router.replace("/(main)/sessions?tab=reserved" as any);
              },
            },
          ],
        );
      }
    } catch (err: any) {
      Alert.alert(
        "Lỗi đặt chỗ",
        err?.message || "Có lỗi xảy ra, vui lòng thử lại.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const currentAvailCount =
    availableSlots.find((s) => s.vehicleTypeId === selectedVehicleType)
      ?.availableCount || 0;
  const selectedVehicleTypeName =
    vehicleTypes.find((v) => v._id === selectedVehicleType)?.name || "";

  const openPicker = (mode: "date" | "time") => {
    setPickerMode(mode);
    setShowPicker(true);
  };

  if (loading) return <Loading />;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.root}>
        <View style={styles.heroWrapper}>
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientMid]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <SafeAreaView edges={["top"]}>
              <View style={styles.heroNav}>
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={styles.backBtn}
                >
                  <Ionicons name="arrow-back" size={22} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.heroNavTitle}>Đặt chỗ trước</Text>
                <View style={{ width: 38 }} />
              </View>
              {facilityName ? (
                <View style={styles.heroFacility}>
                  <Ionicons
                    name="business-outline"
                    size={14}
                    color={Colors.textOnDarkMuted}
                  />
                  <Text style={styles.heroFacilityName} numberOfLines={1}>
                    {facilityName}
                  </Text>
                </View>
              ) : null}
            </SafeAreaView>
          </LinearGradient>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Step 1: Loại xe ── */}
          <View style={styles.stepHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepNum}>1</Text>
            </View>
            <Text style={styles.stepTitle}>Loại xe</Text>
          </View>
          <View style={styles.card}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.vtRow}
            >
              {vehicleTypes.map((vt) => {
                const active = selectedVehicleType === vt._id;
                const slotInfo = availableSlots.find(s => s.vehicleTypeId === vt._id);
                const count = slotInfo?.availableCount ?? 0;
                const noSlot = count === 0;
                return (
                  <TouchableOpacity
                    key={vt._id}
                    style={[styles.vtChip, active && styles.vtChipActive, noSlot && styles.vtChipFull]}
                    onPress={() => {
                      setSelectedVehicleType(vt._id);
                      // Auto-select first vehicle of this type
                      const matchingVehicles = userVehicles.filter(
                        (v) => getVehicleTypeId(v) === vt._id
                      );
                      if (matchingVehicles.length > 0) {
                        const defV = matchingVehicles.find((v) => v.isDefault) || matchingVehicles[0];
                        setSelectedVehicleId(defV._id);
                        setLicensePlate(defV.licensePlate);
                      } else {
                        setSelectedVehicleId("");
                        setLicensePlate("");
                      }
                    }}
                  >
                    <Ionicons
                      name={getVehicleIcon(vt.name)}
                      size={18}
                      color={active ? Colors.primary : noSlot ? Colors.textTertiary : Colors.textSecondary}
                    />
                    <Text style={[styles.vtChipText, active && styles.vtChipTextActive, noSlot && styles.vtChipTextFull]}>
                      {vt.name}
                    </Text>
                    <View style={[styles.slotCountBadge, { backgroundColor: noSlot ? Colors.dangerLight : count <= 5 ? Colors.warningLight : Colors.successLight }]}>
                      <Text style={[styles.slotCountText, { color: noSlot ? Colors.danger : count <= 5 ? Colors.warning : Colors.success }]}>
                        {count}
                      </Text>
                    </View>
                    {active && !noSlot && (
                      <View style={styles.vtCheck}>
                        <Ionicons name="checkmark" size={10} color={Colors.white} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* ── Step 2: Chọn xe ── */}
          <View style={styles.stepHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepNum}>2</Text>
            </View>
            <Text style={styles.stepTitle}>Chọn xe của bạn</Text>
          </View>

          {filteredVehicles.length === 0 ? (
            <View style={styles.noVehicleCard}>
              <View style={styles.noVehicleIconWrap}>
                <Ionicons name="car-outline" size={32} color={Colors.textTertiary} />
              </View>
              <Text style={styles.noVehicleTitle}>Chưa có xe {selectedVehicleTypeName}</Text>
              <Text style={styles.noVehicleSub}>
                Bạn chưa đăng ký xe loại này. Hãy thêm xe để đặt chỗ nhanh hơn.
              </Text>
              <TouchableOpacity
                style={styles.addVehicleBtn}
                onPress={() => router.push('/profile/add-vehicle' as any)}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle-outline" size={18} color={Colors.white} />
                <Text style={styles.addVehicleBtnText}>Thêm xe mới</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.vehicleList}>
              {filteredVehicles.map((vehicle) => {
                const isSelected = selectedVehicleId === vehicle._id;
                const typeName = getVehicleTypeName(vehicle);
                return (
                  <TouchableOpacity
                    key={vehicle._id}
                    style={[styles.vehicleCard, isSelected && styles.vehicleCardActive]}
                    onPress={() => selectVehicle(vehicle)}
                    activeOpacity={0.8}
                  >
                    {/* Radio indicator */}
                    <View style={[styles.radioOuter, isSelected && styles.radioOuterActive]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>

                    {/* Vehicle image or icon */}
                    {vehicle.image ? (
                      <Image source={{ uri: vehicle.image }} style={styles.vehicleImg} />
                    ) : (
                      <View style={[styles.vehicleIconFallback, isSelected && { backgroundColor: Colors.primaryBg }]}>
                        <Ionicons
                          name={getVehicleIcon(typeName)}
                          size={22}
                          color={isSelected ? Colors.primary : Colors.textTertiary}
                        />
                      </View>
                    )}

                    {/* Vehicle info */}
                    <View style={styles.vehicleInfo}>
                      <Text style={[styles.vehiclePlate, isSelected && { color: Colors.primary }]}>
                        {vehicle.licensePlate}
                      </Text>
                      <View style={styles.vehicleMeta}>
                        {vehicle.nickname ? (
                          <Text style={styles.vehicleNickname}>{vehicle.nickname}</Text>
                        ) : (
                          <Text style={styles.vehicleTypeName}>{typeName}</Text>
                        )}
                        {vehicle.isDefault && (
                          <View style={styles.defaultPill}>
                            <Ionicons name="star" size={8} color={Colors.warning} />
                            <Text style={styles.defaultPillText}>Mặc định</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* Add vehicle shortcut */}
              <TouchableOpacity
                style={styles.addVehicleLink}
                onPress={() => router.push('/profile/add-vehicle' as any)}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle-outline" size={16} color={Colors.primary} />
                <Text style={styles.addVehicleLinkText}>Thêm xe mới</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Step 3: Thời gian ── */}
          <View style={styles.stepHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepNum}>3</Text>
            </View>
            <Text style={styles.stepTitle}>Thời gian vào bãi</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.fieldLabel}>Ngày & giờ bắt đầu dự kiến</Text>
            <View style={styles.dateRow}>
              <TouchableOpacity
                style={styles.dateBtn}
                onPress={() => openPicker("date")}
              >
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={Colors.primary}
                />
                <Text style={styles.dateBtnText}>
                  {startTime.toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dateBtn}
                onPress={() => openPicker("time")}
              >
                <Ionicons
                  name="time-outline"
                  size={18}
                  color={Colors.primary}
                />
                <Text style={styles.dateBtnText}>
                  {startTime.toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </TouchableOpacity>
            </View>

            {showPicker && (
              <DateTimePicker
                value={startTime}
                mode={pickerMode}
                is24Hour={true}
                display="default"
                onChange={(event, date) => {
                  if (Platform.OS === "android") setShowPicker(false);
                  if (event.type === "set" && date) {
                    const newDate = new Date(startTime);
                    if (pickerMode === "date") {
                      newDate.setFullYear(
                        date.getFullYear(),
                        date.getMonth(),
                        date.getDate(),
                      );
                    } else {
                      newDate.setHours(date.getHours(), date.getMinutes());
                    }
                    setStartTime(newDate);
                  }
                  if (Platform.OS === "ios" && event.type === "set")
                    setShowPicker(false);
                }}
              />
            )}

            <View style={styles.reminderBox}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={Colors.info}
              />
              <Text style={styles.reminderText}>
                Hoạt động:{" "}
                <Text style={{ fontFamily: Typography.fontFamily.semiBold }}>
                  {facilityOpenTime} – {facilityCloseTime}
                </Text>{" "}
                (Đặt trước tối thiểu 30p)
              </Text>
            </View>
          </View>

          {/* ── Availability banner ── */}
          <View
            style={[
              styles.availBanner,
              {
                backgroundColor:
                  currentAvailCount > 0
                    ? Colors.successLight
                    : Colors.dangerLight,
              },
            ]}
          >
            <Ionicons
              name={
                currentAvailCount > 0
                  ? "checkmark-circle-outline"
                  : "close-circle-outline"
              }
              size={20}
              color={currentAvailCount > 0 ? Colors.success : Colors.danger}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.availTitle,
                  {
                    color:
                      currentAvailCount > 0 ? Colors.success : Colors.danger,
                  },
                ]}
              >
                {currentAvailCount > 0 ? "Còn chỗ trống" : "Hết chỗ trống"}
              </Text>
              <Text style={styles.availSub}>
                {selectedVehicleTypeName}: còn{" "}
                <Text
                  style={{
                    fontFamily: Typography.fontFamily.bold,
                    color:
                      currentAvailCount > 0 ? Colors.success : Colors.danger,
                  }}
                >
                  {currentAvailCount} chỗ
                </Text>{" "}
                hiện tại
              </Text>
            </View>
          </View>

          {/* ── Confirm button ── */}
          <TouchableOpacity
            style={[
              styles.confirmBtn,
              (submitting || !selectedVehicleId) && styles.confirmBtnLoading,
            ]}
            onPress={handleBook}
            disabled={submitting || !selectedVehicleId}
            activeOpacity={0.85}
          >
            <Ionicons
              name={submitting ? "hourglass-outline" : "calendar-outline"}
              size={20}
              color={Colors.white}
            />
            <Text style={styles.confirmBtnText}>
              {submitting ? "Đang xử lý..." : "Xác nhận đặt chỗ"}
            </Text>
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
  heroWrapper: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  hero: { paddingHorizontal: 16, paddingBottom: 24 },
  heroNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    marginBottom: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 19,
  },
  heroNavTitle: {
    fontSize: 17,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.white,
  },
  heroFacility: { flexDirection: "row", alignItems: "center", gap: 6 },
  heroFacilityName: {
    fontSize: 13,
    color: Colors.textOnDarkMuted,
    fontFamily: Typography.fontFamily.medium,
  },

  // Content
  content: { padding: 16, paddingBottom: 16 },

  // Step header
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
    marginTop: 4,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNum: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.white,
  },
  stepTitle: {
    fontSize: 15,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },

  // Card
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },

  // Vehicle type chips
  vtRow: { flexDirection: "row", gap: 10, paddingBottom: 4 },
  vtChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surfaceElevated,
  },
  vtChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryBg,
  },
  vtChipText: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  vtChipTextActive: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.semiBold,
  },
  vtCheck: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  vtChipFull: {
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surfaceElevated,
    opacity: 0.6,
  },
  vtChipTextFull: {
    color: Colors.textTertiary,
  },
  slotCountBadge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 22,
    alignItems: "center",
  },
  slotCountText: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.bold,
  },

  // ── Vehicle selector ──
  vehicleList: { marginBottom: 20 },
  vehicleCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  vehicleCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryBg + "30",
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterActive: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  vehicleImg: {
    width: 48,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.borderLight,
  },
  vehicleIconFallback: {
    width: 48,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  vehicleInfo: { flex: 1 },
  vehiclePlate: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  vehicleMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  vehicleNickname: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    fontStyle: "italic",
  },
  vehicleTypeName: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textTertiary,
  },
  defaultPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: Colors.warningLight || "#FFF8E1",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  defaultPillText: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.warning,
  },
  addVehicleLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
  },
  addVehicleLinkText: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.primary,
  },

  // No vehicle card
  noVehicleCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  noVehicleIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  noVehicleTitle: {
    fontSize: 15,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  noVehicleSub: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textTertiary,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 18,
  },
  addVehicleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  addVehicleBtnText: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.white,
  },

  // Date row
  dateRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  dateBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.primary + "50",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: Colors.primaryBg,
  },
  dateBtnText: {
    flex: 1,
    fontSize: 14,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.primaryDark,
  },

  // Reminder
  reminderBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  reminderText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.regular,
  },

  // Availability banner
  availBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  availTitle: { fontSize: 14, fontFamily: Typography.fontFamily.semiBold },
  availSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.regular,
    marginTop: 2,
  },

  // Confirm button
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 8,
    ...Shadows.md,
  },
  confirmBtnLoading: { backgroundColor: Colors.primaryLight },
  confirmBtnText: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.white,
  },
});
