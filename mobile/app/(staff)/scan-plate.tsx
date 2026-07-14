import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  Alert,
  TextInput,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as ImageManipulator from "expo-image-manipulator";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from "../../src/constants/theme";
import { formatPlate, matchVehicleType } from "../../src/utils/format";
import {
  alprApi,
  sessionApi,
  paymentApi,
  vehicleTypeApi,
  exceptionApi,
} from "../../src/services/api";
import { useAuthStore } from "../../src/store/useAuthStore";

export default function StaffScanScreen() {
  const router = useRouter();
  const { user, selectedFacilityId } = useAuthStore();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  // States
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);

  // Modal States
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [plateData, setPlateData] = useState<{
    plate: string;
    imageUrl: string;
  } | null>(null);
  const [exceptionModalVisible, setExceptionModalVisible] = useState(false);

  // Exception States
  const [exceptionType, setExceptionType] = useState("LOST_CARD");
  const [exceptionDesc, setExceptionDesc] = useState("");
  const [exceptionPlate, setExceptionPlate] = useState("");
  const [submittingException, setSubmittingException] = useState(false);

  // Checkout Specific States
  const [checkoutSession, setCheckoutSession] = useState<any>(null);
  const [checkoutFee, setCheckoutFee] = useState<any>(null);
  const [isCalculatingFee, setIsCalculatingFee] = useState(false);

  // Selected vehicle type for check-in
  const [selectedVehicleType, setSelectedVehicleType] = useState<string | null>(
    null,
  );

  useEffect(() => {
    fetchVehicleTypes();
  }, []);

  const fetchVehicleTypes = async () => {
    try {
      const res = await vehicleTypeApi.getVehicleTypes();
      if (res.data) setVehicleTypes(res.data);
    } catch (e) {
      console.log("Error fetching vehicle types", e);
    }
  };

  const getFacilityId = () => {
    return selectedFacilityId;
  };

  const submitException = async () => {
    if (!selectedFacilityId) return;
    setSubmittingException(true);
    try {
      await exceptionApi.createException({
        type: exceptionType,
        description: exceptionDesc,
        facilityId: selectedFacilityId,
        actualPlate: exceptionPlate,
        checkInImage: plateData?.imageUrl || undefined,
      });
      Alert.alert("Thành công", "Đã báo cáo sự cố!");
      setExceptionModalVisible(false);
      setExceptionDesc("");
      setExceptionPlate("");
    } catch (e: any) {
      Alert.alert("Lỗi", e.message || "Không thể báo cáo sự cố");
    } finally {
      setSubmittingException(false);
    }
  };

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Vui lòng cấp quyền sử dụng camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Cấp quyền</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const facilityId = getFacilityId();
  if (!facilityId) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Bạn chưa được phân công bãi xe nào.</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          base64: false,
        });
        if (photo) {
          const cropWidth = photo.width * (GUIDE_BOX_WIDTH / screenWidth);
          const cropHeight = photo.height * (GUIDE_BOX_HEIGHT / screenHeight);
          const originX = (photo.width - cropWidth) / 2;
          const originY = (photo.height - cropHeight) / 2;

          const manipResult = await ImageManipulator.manipulateAsync(
            photo.uri,
            [
              {
                crop: {
                  originX,
                  originY,
                  width: cropWidth,
                  height: cropHeight,
                },
              },
            ],
            { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
          );

          setScannedImage(manipResult.uri);
          processImage(manipResult.uri);
        }
      } catch (error) {
        Alert.alert("Lỗi", "Không thể chụp ảnh");
      }
    }
  };

  const processImage = async (uri: string) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      // @ts-ignore
      formData.append("image", {
        uri,
        name: "plate.jpg",
        type: "image/jpeg",
      });

      // 1. Call ALPR
      const alprRes = await alprApi.scanPlate(formData);
      if (!alprRes.success) {
        Alert.alert(
          "Thông báo",
          alprRes.message || "Không nhận dạng được biển số.",
        );
        resetScan();
        return;
      }

      const { licensePlate, imageUrl } = alprRes.data;
      const formattedPlate = formatPlate(licensePlate);
      setPlateData({ plate: formattedPlate, imageUrl });
      setExceptionPlate(formattedPlate);

      // 2. Search for active session with this plate
      try {
        const searchRes = await sessionApi.searchSession(formattedPlate);
        const session = searchRes.data;

        const sessionFacilityId =
          session?.facilityId?._id || session?.facilityId;
        if (
          session &&
          session.status === "active" &&
          sessionFacilityId === facilityId
        ) {
          // CHECK-OUT FLOW
          setCheckoutSession(session);
          setShowCheckOutModal(true);
          calculateFee(session._id);
        } else {
          // CHECK-IN FLOW (No active session at this facility)
          if (vehicleTypes.length > 0) {
            const matchedTypeId = matchVehicleType(
              formattedPlate,
              vehicleTypes,
            );
            setSelectedVehicleType(matchedTypeId || vehicleTypes[0]._id);
          }
          setShowCheckInModal(true);
        }
      } catch (searchErr: any) {
        // If 404 not found, it means it's a Check-in flow
        if (
          searchErr?.status === 404 ||
          searchErr?.message?.includes("not found") ||
          searchErr?.message?.includes("Không tìm thấy")
        ) {
          if (vehicleTypes.length > 0) {
            const matchedTypeId = matchVehicleType(
              formattedPlate,
              vehicleTypes,
            );
            setSelectedVehicleType(matchedTypeId || vehicleTypes[0]._id);
          }
          setShowCheckInModal(true);
        } else {
          throw searchErr; // Re-throw if it's another error
        }
      }
    } catch (error: any) {
      console.log("ALPR/Process Error", error);
      Alert.alert(
        "Lỗi xử lý",
        error.message || "Có lỗi xảy ra khi xử lý biển số.",
      );
      resetScan();
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateFee = async (sessionId: string) => {
    setIsCalculatingFee(true);
    try {
      const feeRes = await sessionApi.calculateFee(sessionId);
      setCheckoutFee(feeRes.data);
    } catch (error) {
      console.log("Fee calculation error", error);
      Alert.alert("Lỗi", "Không thể tính phí.");
    } finally {
      setIsCalculatingFee(false);
    }
  };

  const handleCheckIn = async () => {
    if (!selectedVehicleType || !plateData) return;
    setIsProcessing(true);
    try {
      await sessionApi.checkIn({
        facilityId,
        vehicleTypeId: selectedVehicleType,
        licensePlate: plateData.plate,
        checkInImage: plateData.imageUrl,
      });
      Alert.alert("Thành công", `Đã tạo lượt gửi cho xe ${plateData.plate}`);
      resetScan();
    } catch (error: any) {
      Alert.alert("Lỗi Check-in", error.message || "Không thể tạo lượt gửi");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckOut = async () => {
    if (!checkoutSession) return;
    setIsProcessing(true);
    try {
      await paymentApi.cashCheckout({
        sessionId: checkoutSession._id,
        checkOutImage: plateData?.imageUrl,
      });
      Alert.alert(
        "Thành công",
        `Đã thanh toán và check-out xe ${plateData?.plate}`,
      );
      resetScan();
    } catch (error: any) {
      Alert.alert(
        "Lỗi Check-out",
        error.message || "Không thể hoàn tất check-out",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const resetScan = () => {
    setScannedImage(null);
    setPlateData(null);
    setShowCheckInModal(false);
    setShowCheckOutModal(false);
    setCheckoutSession(null);
    setCheckoutFee(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientMid]}
          style={styles.header}
        >
          <SafeAreaView edges={["top"]}>
            <View style={styles.headerTop}>
              <Image
                source={require("../../assets/images/logo.png")}
                style={{ width: 100, height: 28, resizeMode: "contain" }}
              />
              <TouchableOpacity
                onPress={() => setExceptionModalVisible(true)}
                style={styles.iconButton}
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={24}
                  color={Colors.white}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.headerTitle}>Quét Biển Số</Text>
            <Text style={styles.headerSub}>
              Tự động nhận diện biển số xe ra vào
            </Text>
          </SafeAreaView>
        </LinearGradient>
      </View>

      {scannedImage ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: scannedImage }} style={styles.preview} />
          {isProcessing && (
            <View style={styles.processingOverlay}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.processingText}>Đang xử lý...</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <CameraView style={styles.camera} facing="back" ref={cameraRef} />
          <View style={[styles.overlay, StyleSheet.absoluteFillObject]}>
            <View style={styles.guideBox} />
            <Text style={styles.guideText}>
              Căn chỉnh biển số xe vào khung hình
            </Text>
          </View>
        </View>
      )}

      <View style={styles.controls}>
        {!scannedImage && (
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureInner} />
          </TouchableOpacity>
        )}
      </View>

      <Modal visible={showCheckInModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Xác nhận Check-in</Text>
              <TouchableOpacity onPress={resetScan}>
                <Ionicons name="close" size={24} color={Colors.textTertiary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Biển số nhận diện:</Text>
            <Text style={styles.modalPlateText}>{plateData?.plate}</Text>

            <Text style={styles.modalLabel}>Chọn loại xe:</Text>
            <View style={styles.vehicleTypeContainer}>
              {vehicleTypes.map((vt) => (
                <TouchableOpacity
                  key={vt._id}
                  style={[
                    styles.vtButton,
                    selectedVehicleType === vt._id && styles.vtButtonActive,
                  ]}
                  onPress={() => setSelectedVehicleType(vt._id)}
                >
                  <Text
                    style={[
                      styles.vtButtonText,
                      selectedVehicleType === vt._id &&
                        styles.vtButtonTextActive,
                    ]}
                  >
                    {vt.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                (!selectedVehicleType || isProcessing) && styles.disabledButton,
              ]}
              onPress={handleCheckIn}
              disabled={!selectedVehicleType || isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.primaryButtonText}>Tạo lượt gửi</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showCheckOutModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Xác nhận Check-out</Text>
              <TouchableOpacity onPress={resetScan}>
                <Ionicons name="close" size={24} color={Colors.textTertiary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Biển số nhận diện:</Text>
            <Text style={styles.modalPlateText}>{plateData?.plate}</Text>

            {checkoutSession && (
              <View style={styles.sessionDetails}>
                <Text style={styles.detailText}>
                  Vào lúc:{" "}
                  {checkoutSession.checkInTime
                    ? new Date(checkoutSession.checkInTime).toLocaleString(
                        "vi-VN",
                      )
                    : "Không rõ"}
                </Text>
                {checkoutSession.checkInImage && (
                  <View style={{ marginTop: 12 }}>
                    <Text style={[styles.detailText, { marginBottom: 8 }]}>
                      Ảnh lúc vào:
                    </Text>
                    <Image
                      source={{ uri: checkoutSession.checkInImage }}
                      style={{
                        width: "100%",
                        height: 120,
                        borderRadius: 8,
                        resizeMode: "cover",
                      }}
                    />
                  </View>
                )}
              </View>
            )}

            <View style={styles.feeContainer}>
              <Text style={styles.feeLabel}>Phí gửi xe:</Text>
              {isCalculatingFee ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Text style={styles.feeValue}>
                  {checkoutFee?.totalFee?.toLocaleString("vi-VN")} VNĐ
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                (isCalculatingFee || isProcessing) && styles.disabledButton,
              ]}
              onPress={handleCheckOut}
              disabled={isCalculatingFee || isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.primaryButtonText}>
                  Thu tiền mặt & Check-out
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={exceptionModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setExceptionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Báo cáo sự cố</Text>
              <TouchableOpacity onPress={() => setExceptionModalVisible(false)}>
                <Ionicons name="close" size={24} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalLabel}>Biển số</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nhập biển số xe..."
              value={exceptionPlate}
              onChangeText={(text) => setExceptionPlate(formatPlate(text))}
            />
            <Text style={styles.modalLabel}>Loại sự cố</Text>
            <View style={styles.pickerWrap}>
              <Picker
                selectedValue={exceptionType}
                onValueChange={(val) => setExceptionType(val)}
              >
                <Picker.Item label="Mất vé" value="LOST_CARD" />
                <Picker.Item label="Sai biển số" value="WRONG_PLATE" />
                <Picker.Item label="Lỗi hệ thống" value="SYSTEM_ERROR" />
                <Picker.Item label="Khác" value="OTHER" />
              </Picker>
            </View>
            <Text style={styles.modalLabel}>Ghi chú</Text>
            <TextInput
              style={[styles.modalInput, { height: 80 }]}
              placeholder="Mô tả sự cố..."
              multiline
              value={exceptionDesc}
              onChangeText={setExceptionDesc}
            />
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={submitException}
              disabled={submittingException}
            >
              {submittingException ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.primaryButtonText}>Gửi báo cáo</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GUIDE_BOX_WIDTH = SCREEN_WIDTH * 0.9;
const GUIDE_BOX_HEIGHT = GUIDE_BOX_WIDTH * 0.75;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerWrapper: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
    marginBottom: -20,
    zIndex: 10,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 42,
    paddingTop: 12,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconButton: {
    padding: Spacing.xs,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textOnDark,
    marginTop: 16,
  },
  headerSub: {
    fontSize: 13,
    color: Colors.textOnDarkMuted,
    fontFamily: Typography.fontFamily.regular,
    marginTop: 3,
  },
  message: { textAlign: "center", padding: 20, color: Colors.textPrimary },
  camera: { flex: 1 },
  previewContainer: { flex: 1, position: "relative" },
  preview: { flex: 1, resizeMode: "contain" },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  processingText: {
    color: Colors.white,
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  guideBox: {
    width: GUIDE_BOX_WIDTH,
    height: GUIDE_BOX_HEIGHT,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: "transparent",
    borderRadius: BorderRadius.md,
  },
  guideText: {
    color: Colors.white,
    marginTop: Spacing.xl,
    fontSize: Typography.fontSize.md,
  },
  controls: {
    height: 120,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: Colors.black,
    paddingBottom: 20,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignSelf: "center",
    marginTop: 20,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: Typography.fontWeight.semiBold,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.white,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  modalLabel: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    marginTop: 10,
    fontFamily: Typography.fontFamily.medium,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: 12,
    fontSize: 16,
    marginTop: 8,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    marginTop: 8,
    overflow: "hidden",
  },
  modalPlateText: {
    fontSize: 32,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
    textAlign: "center",
    marginVertical: 10,
  },

  vehicleTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
    marginBottom: 24,
  },
  vtButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  vtButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  vtButtonText: {
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
  },
  vtButtonTextActive: { color: Colors.white },

  sessionDetails: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
  },
  detailText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.medium,
  },

  feeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 20,
  },
  feeLabel: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  feeValue: {
    fontSize: 24,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.danger,
  },

  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledButton: { opacity: 0.6 },
  primaryButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
  },
});
