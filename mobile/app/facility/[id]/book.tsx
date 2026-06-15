import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
} from "../../../src/constants/theme";
import { Button, TextInput, Loading, Card } from "../../../src/components";
import {
  reservationApi,
  vehicleTypeApi,
  api,
} from "../../../src/services/api";
import { AvailableSlot } from "../../../src/types/facility.types";

export default function BookingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const facilityId = typeof id === "string" ? id : id?.[0] || "";

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);

  // Form State
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>("");
  const [licensePlate, setLicensePlate] = useState("");

  // Thời gian mặc định: Bắt đầu = Hiện tại + 30 phút, Kết thúc = Hiện tại + 2 tiếng rưỡi
  const [startTime, setStartTime] = useState(
    new Date(Date.now() + 35 * 60 * 1000),
  );
  const [endTime, setEndTime] = useState(
    new Date(Date.now() + 155 * 60 * 1000),
  );

  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");

  const openPicker = (field: "start" | "end", mode: "date" | "time") => {
    setPickerMode(mode);
    if (field === "start") setShowStart(true);
    else setShowEnd(true);
  };

  useEffect(() => {
    fetchInitialData();
  }, [facilityId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [vtRes, slotRes] = await Promise.all<any>([
        vehicleTypeApi.getVehicleTypes(),
        api.getAvailableSlots(facilityId),
      ]);

      if (vtRes.success) {
        setVehicleTypes(vtRes.data);
        if (vtRes.data.length > 0) {
          setSelectedVehicleType(vtRes.data[0]._id);
        }
      }
      if (slotRes) {
        setAvailableSlots(slotRes as AvailableSlot[]);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải dữ liệu ban đầu");
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!licensePlate.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập biển số xe");
      return;
    }

    const minAdvanceMs = 30 * 60 * 1000;
    if (startTime.getTime() - Date.now() < minAdvanceMs) {
      Alert.alert(
        "Lỗi",
        "Phải đặt trước ít nhất 30 phút so với thời gian bắt đầu",
      );
      return;
    }

    if (endTime <= startTime) {
      Alert.alert("Lỗi", "Thời gian kết thúc phải sau thời gian bắt đầu");
      return;
    }

    try {
      setSubmitting(true);
      const res = (await reservationApi.createReservation({
        facilityId,
        vehicleTypeId: selectedVehicleType,
        licensePlate: licensePlate.trim(),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      })) as any;

      if (res.success) {
        Alert.alert("Thành công", "Đặt chỗ thành công!", [
          { text: "OK", onPress: () => router.push("/(main)/reservations") },
        ]);
      }
    } catch (error: any) {
      Alert.alert(
        "Lỗi đặt chỗ",
        error?.message || "Có lỗi xảy ra, vui lòng thử lại",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Tính số lượng slot trống cho loại xe đang chọn
  const currentAvailableSlots =
    availableSlots.find((s) => s.vehicleTypeId === selectedVehicleType)
      ?.availableCount || 0;

  if (loading) return <Loading />;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <View style={styles.customHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Tạo Đặt chỗ trước</Text>
      <Text style={styles.subtitle}>
        Điền thông tin xe và thời gian gửi để giữ chỗ.
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Phương tiện</Text>
        <Text style={styles.label}>Loại xe</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.vehicleTypeContainer}
          style={{ marginBottom: Spacing.lg, marginHorizontal: -Spacing.lg, paddingHorizontal: Spacing.lg }}
        >
          {vehicleTypes.map((vt) => (
            <TouchableOpacity
              key={vt._id}
              style={[
                styles.vehicleTypeItem,
                selectedVehicleType === vt._id &&
                  styles.vehicleTypeItemSelected,
              ]}
              onPress={() => setSelectedVehicleType(vt._id)}
            >
              <Text
                style={[
                  styles.vehicleTypeText,
                  selectedVehicleType === vt._id &&
                    styles.vehicleTypeTextSelected,
                ]}
              >
                {vt.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TextInput
          label="Biển số xe"
          placeholder="Ví dụ: 30A-12345"
          value={licensePlate}
          onChangeText={setLicensePlate}
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Thời gian</Text>

        <View style={styles.datePickerContainer}>
          <Text style={styles.label}>Giờ bắt đầu dự kiến (Vào bãi)</Text>
          <View style={{ flexDirection: "row", gap: Spacing.sm }}>
            <TouchableOpacity
              style={[styles.datePickerButton, { flex: 1 }]}
              onPress={() => openPicker("start", "date")}
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color={Colors.textSecondary}
              />
              <Text style={styles.dateText}>
                {startTime.toLocaleDateString("vi-VN")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.datePickerButton, { flex: 1 }]}
              onPress={() => openPicker("start", "time")}
            >
              <Ionicons
                name="time-outline"
                size={20}
                color={Colors.textSecondary}
              />
              <Text style={styles.dateText}>
                {startTime.toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </TouchableOpacity>
          </View>
          {showStart && (
            <DateTimePicker
              value={startTime}
              mode={pickerMode}
              is24Hour={true}
              display="default"
              onChange={(event, date) => {
                if (Platform.OS === "android") setShowStart(false);
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
                if (Platform.OS === "ios" && event.type === "set") {
                  setShowStart(false);
                }
              }}
            />
          )}
        </View>

        <View style={styles.datePickerContainer}>
          <Text style={styles.label}>Giờ kết thúc dự kiến (Ra bãi)</Text>
          <View style={{ flexDirection: "row", gap: Spacing.sm }}>
            <TouchableOpacity
              style={[styles.datePickerButton, { flex: 1 }]}
              onPress={() => openPicker("end", "date")}
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color={Colors.textSecondary}
              />
              <Text style={styles.dateText}>
                {endTime.toLocaleDateString("vi-VN")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.datePickerButton, { flex: 1 }]}
              onPress={() => openPicker("end", "time")}
            >
              <Ionicons
                name="time-outline"
                size={20}
                color={Colors.textSecondary}
              />
              <Text style={styles.dateText}>
                {endTime.toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </TouchableOpacity>
          </View>
          {showEnd && (
            <DateTimePicker
              value={endTime}
              mode={pickerMode}
              is24Hour={true}
              display="default"
              onChange={(event, date) => {
                if (Platform.OS === "android") setShowEnd(false);
                if (event.type === "set" && date) {
                  const newDate = new Date(endTime);
                  if (pickerMode === "date") {
                    newDate.setFullYear(
                      date.getFullYear(),
                      date.getMonth(),
                      date.getDate(),
                    );
                  } else {
                    newDate.setHours(date.getHours(), date.getMinutes());
                  }
                  setEndTime(newDate);
                }
                if (Platform.OS === "ios" && event.type === "set") {
                  setShowEnd(false);
                }
              }}
            />
          )}
        </View>
      </View>

      <View style={styles.infoBox}>
        <Ionicons
          name="information-circle-outline"
          size={24}
          color={Colors.primary}
        />
        <View style={styles.infoTextContainer}>
          <Text style={styles.infoTitle}>Tình trạng bãi đỗ hiện tại</Text>
          <Text style={styles.infoText}>
            Loại xe bạn chọn đang còn{" "}
            <Text
              style={{
                fontWeight: "bold",
                color:
                  currentAvailableSlots > 0 ? Colors.success : Colors.danger,
              }}
            >
              {currentAvailableSlots} chỗ trống
            </Text>
            .
          </Text>
        </View>
      </View>

      <Button
        title="Xác nhận Đặt chỗ"
        onPress={handleBook}
        loading={submitting}
        size="lg"
        fullWidth
        style={styles.bookBtn}
      />
      </ScrollView>
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
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    backgroundColor: Colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing["3xl"],
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  vehicleTypeContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  vehicleTypeItem: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
  },
  vehicleTypeItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryBg,
  },
  vehicleTypeText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  vehicleTypeTextSelected: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semiBold,
  },
  datePickerContainer: {
    marginBottom: Spacing.md,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    backgroundColor: Colors.white,
  },
  dateText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: Colors.primaryBg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
    alignItems: "center",
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryDark,
    marginBottom: 2,
  },
  infoText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  bookBtn: {
    marginTop: Spacing.md,
  },
});
