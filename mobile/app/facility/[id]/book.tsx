import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  TextInput,
  Platform,
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
import { reservationApi, vehicleTypeApi, api } from "../../../src/services/api";
import { AvailableSlot } from "../../../src/types/facility.types";

const getVehicleIcon = (name: string): any => {
  const n = (name || "").toLowerCase();
  if (n.includes("ô tô") || n.includes("car")) return "car-sport-outline";
  if (n.includes("xe tải") || n.includes("truck")) return "car-outline";
  return "bicycle-outline";
};

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

  const [selectedVehicleType, setSelectedVehicleType] = useState<string>("");
  const [licensePlate, setLicensePlate] = useState("");
  const [startTime, setStartTime] = useState(
    new Date(Date.now() + 35 * 60 * 1000),
  );
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");
  const [plateError, setPlateError] = useState<string>('');

  // Tự động chuẩn hoá biển số cực thông minh khi người dùng đang gõ
  // Định dạng chuẩn: XX-XX-123.45 (dùng '-' thay khoảng trắng để khớp OCR)
  const autoFormatPlate = (text: string): string => {
    let s = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!s) return '';

    let prefix = '';
    let tail = '';

    const typeName = vehicleTypes.find(v => v._id === selectedVehicleType)?.name?.toLowerCase() || '';
    const isCar = typeName.includes('ô tô') || typeName.includes('car');

    if (isCar) {
      // Ô tô: 2 số + 1-2 chữ cái + phần số đuôi
      const match = s.match(/^(\d{2}[A-Z]{1,2})(\d*)$/);
      if (match) {
        prefix = match[1];
        tail = match[2];
      } else {
        prefix = s;
      }
    } else {
      // Xe máy: 4 ký tự đầu (VD: 29A1) làm prefix
      if (s.length >= 4) {
        prefix = s.substring(0, 4);
        tail = s.substring(4);
      } else {
        prefix = s;
      }
    }

    // Thêm dấu '-' sau 2 số đầu (mã vùng)
    prefix = prefix.replace(/^(\d{2})([A-Z])/, '$1-$2');

    if (tail) {
      tail = tail.substring(0, 5); // Tối đa 5 số đuôi
      if (tail.length === 5) {
        tail = tail.substring(0, 3) + '.' + tail.substring(3);
      }
      // Dùng '-' thay khoảng trắng để khớp chuẩn OCR
      return prefix + '-' + tail;
    }

    return prefix;
  };

  /**
   * Kiểm tra biển số xe Việt Nam hợp lệ (chuẩn OCR với '-').
   *   Xe máy:  29-A1-123.45
   *   Ô tô:    30-A-123.45
   *   Biển đôi: 51-AA-123.45
   *   Biển ngắn (4-5 số): 29-A1-1234 / 30-A-12345
   */
  const isValidPlate = (plate: string): boolean => {
    const p = plate.trim();
    // Xe máy: 29-A1-123.45 hoặc 29-A1-1234
    const moto = /^\d{2}-[A-Z]\d-(\d{3}\.\d{2}|\d{4,5})$/.test(p);
    // Ô tô 1 chữ: 30-A-123.45 hoặc 30-A-1234
    const car1 = /^\d{2}-[A-Z]-(\d{3}\.\d{2}|\d{4,5})$/.test(p);
    // Ô tô 2 chữ (biển đôi): 51-AA-123.45 hoặc 51-AA-1234
    const car2 = /^\d{2}-[A-Z]{2}-(\d{3}\.\d{2}|\d{4,5})$/.test(p);
    return moto || car1 || car2;
  };

  useEffect(() => {
    fetchInitialData();
  }, [facilityId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [vtRes, slotRes, facilities] = await Promise.all<any>([
        vehicleTypeApi.getVehicleTypes(),
        api.getAvailableSlots(facilityId),
        api.getPublicFacilities(1, 100),
      ]);

      const slots: AvailableSlot[] = slotRes || [];
      setAvailableSlots(slots);

      if (vtRes.success) {
        // Only show vehicle types that this facility actually supports
        // (i.e. they appear in the availableSlots response for this facility)
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
    } catch {
      Alert.alert("Lỗi", "Không thể tải dữ liệu, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    // Format một lần cuối cùng trước khi submit
    const finalPlate = autoFormatPlate(licensePlate);
    if (!finalPlate.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập biển số xe.");
      return;
    }
    if (!isValidPlate(finalPlate)) {
      Alert.alert(
        "Biển số không hợp lệ",
        `"${finalPlate}" không đúng định dạng biển số Việt Nam.\n\nVí dụ hợp lệ:\n• Xe máy: 29-A1-123.45\n• Ô tô: 30-A-123.45`
      );
      return;
    }
    if (startTime.getTime() - Date.now() < 30 * 60 * 1000) {
      Alert.alert("Thời gian không hợp lệ", "Phải đặt trước ít nhất 30 phút.");
      return;
    }

    // Validate operation hours
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

    try {
      setSubmitting(true);
      const res = (await reservationApi.createReservation({
        facilityId,
        vehicleTypeId: selectedVehicleType,
        licensePlate: finalPlate,
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
          <View style={styles.stepHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepNum}>1</Text>
            </View>
            <Text style={styles.stepTitle}>Phương tiện</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.fieldLabel}>Loại xe</Text>
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
                    onPress={() => setSelectedVehicleType(vt._id)}
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

            <Text style={styles.fieldLabel}>Biển số xe</Text>
            <View style={[styles.plateInput, plateError ? { borderColor: Colors.danger } : {}]}>
              <Ionicons
                name="newspaper-outline"
                size={18}
                color={plateError ? Colors.danger : Colors.textSecondary}
              />
              <TextInput
                style={styles.plateField}
                placeholder={
                  (() => {
                    const typeName = vehicleTypes.find(v => v._id === selectedVehicleType)?.name?.toLowerCase() || '';
                    if (typeName.includes('ô tô') || typeName.includes('car')) return "Ví dụ: 30-A-123.45";
                    return "Ví dụ: 29-A1-123.45";
                  })()
                }
                placeholderTextColor={Colors.placeholder}
                value={licensePlate}
                onChangeText={(text) => {
                  const formatted = autoFormatPlate(text);
                  setLicensePlate(formatted);
                  // Chỉ validate khi đã gõ đủ chiều dài tối thiểu (tránh lỗi khi đang gõ)
                  if (formatted.length >= 8) {
                    setPlateError(isValidPlate(formatted) ? '' : 'Biển số không đúng định dạng');
                  } else {
                    setPlateError('');
                  }
                }}
                autoCapitalize="characters"
                maxLength={15}
              />
            </View>
            {plateError ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <Ionicons name="alert-circle" size={13} color={Colors.danger} />
                <Text style={{ fontSize: 12, color: Colors.danger, fontFamily: Typography.fontFamily.medium }}>
                  {plateError}
                </Text>
              </View>
            ) : licensePlate.length >= 8 && isValidPlate(licensePlate) ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <Ionicons name="checkmark-circle" size={13} color={Colors.success} />
                <Text style={{ fontSize: 12, color: Colors.success, fontFamily: Typography.fontFamily.medium }}>
                  Biển số hợp lệ
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.stepHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepNum}>2</Text>
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

            {/* Reminder */}
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
            style={[styles.confirmBtn, submitting && styles.confirmBtnLoading]}
            onPress={handleBook}
            disabled={submitting}
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
  fieldDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 14,
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

  // Plate input
  plateInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: Colors.white,
  },
  plateField: {
    flex: 1,
    fontSize: 16,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    letterSpacing: 1,
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
