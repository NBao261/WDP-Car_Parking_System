import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Image, Alert,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Typography, Spacing, Shadows } from "../../src/constants/theme";
import { feedbackApi, sessionApi } from "../../src/services/api";

const FEEDBACK_TYPES = [
  { id: "lost_card",     label: "Mất thẻ/Vé",    icon: "card-outline"                  },
  { id: "wrong_fee",    label: "Sai phí gửi",    icon: "cash-outline"                  },
  { id: "hard_to_find", label: "Khó tìm vị trí", icon: "navigate-outline"              },
  { id: "slot_occupied",label: "Chỗ bị chiếm",   icon: "car-sport-outline"             },
  { id: "other",        label: "Khác",            icon: "chatbubble-ellipses-outline"   },
];

export default function CreateFeedbackScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string>("other");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [loadingSessions, setLoadingSessions] = useState(true);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoadingSessions(true);
        // Load cả active và completed để user có thể feedback cho những phiên gần đây
        const activeRes: any = await sessionApi.getMySessions('active');
        const completedRes: any = await sessionApi.getMySessions('completed');
        
        let allSessions: any[] = [];
        if (activeRes.success && activeRes.data) allSessions = [...allSessions, ...activeRes.data];
        if (completedRes.success && completedRes.data) allSessions = [...allSessions, ...completedRes.data];

        // Sắp xếp phiên mới nhất lên đầu
        allSessions.sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());

        // Lấy 5 phiên gửi xe gần nhất
        const recentSessions = allSessions.slice(0, 5);

        setSessions(recentSessions);
        if (recentSessions.length > 0) {
          setSelectedSessionId(recentSessions[0]._id);
        } else {
          Alert.alert("Chưa có lượt gửi xe", "Bạn cần có ít nhất một lượt gửi xe để có thể gửi phản hồi.", [
            { text: "Đóng", onPress: () => router.back() }
          ]);
        }
      } catch (err) {
        console.log("Error loading sessions:", err);
      } finally {
        setLoadingSessions(false);
      }
    };
    loadSessions();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Quyền bị từ chối", "Bạn cần cấp quyền thư viện ảnh."); return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [4, 3], quality: 0.5, base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      setImages(prev => [...prev, `data:image/jpeg;base64,${result.assets[0].base64}`]);
    }
  };

  const removeImage = (index: number) => setImages(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (!description.trim()) { Alert.alert("Thiếu mô tả", "Vui lòng mô tả vấn đề bạn gặp phải."); return; }
    if (!selectedSessionId) { Alert.alert("Lỗi", "Vui lòng chọn lượt gửi xe để phản hồi."); return; }

    try {
      setSubmitting(true);
      const payload: any = { type: selectedType, description: description.trim(), images, sessionId: selectedSessionId };

      const res: any = await feedbackApi.createFeedback(payload);
      if (res.success) {
        Alert.alert("✅ Gửi thành công!", "Phản hồi của bạn đã được ghi nhận.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error?.response?.data?.message || "Không thể gửi phản hồi lúc này.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTypeData = FEEDBACK_TYPES.find(t => t.id === selectedType);

  if (loadingSessions) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Đang tải dữ liệu...</Text>
      </View>
    );
  }

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
                <Text style={styles.heroTitle}>Gửi phản hồi</Text>
                <View style={{ width: 38 }} />
              </View>
              <View style={styles.heroBody}>
                <View style={styles.heroIconWrap}>
                  <Ionicons name="chatbubble-ellipses" size={22} color={Colors.primary} />
                </View>
                <Text style={styles.heroSub}>Giúp chúng tôi cải thiện dịch vụ tốt hơn</Text>
              </View>
            </SafeAreaView>
          </LinearGradient>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* ── Step 1: Lượt gửi xe ── */}
          {sessions.length > 0 && (
            <>
              <View style={styles.stepHeader}>
                <View style={styles.stepBadge}><Text style={styles.stepNum}>1</Text></View>
                <Text style={styles.stepTitle}>Chọn lượt gửi xe <Text style={{ color: Colors.danger }}>*</Text></Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                {sessions.map((sess) => {
                  const active = selectedSessionId === sess._id;
                  const date = new Date(sess.checkInTime);
                  const timeString = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.getDate()}/${date.getMonth() + 1}`;
                  return (
                    <TouchableOpacity
                      key={sess._id}
                      style={[styles.typeChip, { marginRight: 10, width: 'auto', paddingHorizontal: 16 }, active && styles.typeChipActive]}
                      onPress={() => setSelectedSessionId(sess._id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="car-outline" size={17} color={active ? Colors.primary : Colors.textSecondary} />
                      <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>Biển số: {sess.licensePlate || "Không biển"} - {timeString}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          )}

          {/* ── Step 2: Loại vấn đề ── */}
          <View style={styles.stepHeader}>
            <View style={styles.stepBadge}><Text style={styles.stepNum}>2</Text></View>
            <Text style={styles.stepTitle}>Loại vấn đề</Text>
          </View>
          <View style={styles.typesGrid}>
            {FEEDBACK_TYPES.map(type => {
              const active = selectedType === type.id;
              return (
                <TouchableOpacity
                  key={type.id}
                  style={[styles.typeChip, active && styles.typeChipActive]}
                  onPress={() => setSelectedType(type.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons name={type.icon as any} size={17} color={active ? Colors.primary : Colors.textSecondary} />
                  <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>{type.label}</Text>
                  {active && (
                    <View style={styles.typeCheck}>
                      <Ionicons name="checkmark" size={10} color={Colors.white} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Step 3: Mô tả ── */}
          <View style={styles.stepHeader}>
            <View style={styles.stepBadge}><Text style={styles.stepNum}>3</Text></View>
            <Text style={styles.stepTitle}>Mô tả chi tiết</Text>
          </View>
          <View style={styles.card}>
            <TextInput
              style={styles.descInput}
              placeholder={`Mô tả vấn đề "${selectedTypeData?.label}" của bạn...`}
              placeholderTextColor={Colors.placeholder}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
            <Text style={styles.charCount}>{description.length} ký tự</Text>
          </View>

          {/* ── Step 4: Ảnh đính kèm ── */}
          <View style={styles.stepHeader}>
            <View style={styles.stepBadge}><Text style={styles.stepNum}>4</Text></View>
            <Text style={styles.stepTitle}>Hình ảnh <Text style={styles.optional}>(tùy chọn)</Text></Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imgRow}>
            {images.map((img, index) => (
              <View key={index} style={styles.imgWrap}>
                <Image source={{ uri: img }} style={styles.imgPreview} />
                <TouchableOpacity style={styles.imgRemove} onPress={() => removeImage(index)}>
                  <Ionicons name="close-circle" size={22} color={Colors.danger} />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 3 && (
              <TouchableOpacity style={styles.imgAdd} onPress={pickImage}>
                <Ionicons name="camera-outline" size={28} color={Colors.textTertiary} />
                <Text style={styles.imgAddText}>Thêm ảnh</Text>
                <Text style={styles.imgAddSub}>{images.length}/3</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* ── Submit ── */}
          <TouchableOpacity
            style={[styles.submitBtn, (!description.trim() || submitting) && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!description.trim() || submitting}
            activeOpacity={0.85}
          >
            <Ionicons name={submitting ? "hourglass-outline" : "send-outline"} size={20} color={Colors.white} />
            <Text style={styles.submitBtnText}>{submitting ? "Đang gửi..." : "Gửi phản hồi"}</Text>
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
  heroNav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 8, marginBottom: 16 },
  backBtn: { width: 38, height: 38, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 19 },
  heroTitle: { fontSize: 17, fontFamily: Typography.fontFamily.bold, color: Colors.white },
  heroBody: { flexDirection: "row", alignItems: "center", gap: 12 },
  heroIconWrap: { width: 46, height: 46, borderRadius: 12, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center", ...Shadows.sm },
  heroSub: { flex: 1, fontSize: 13, color: Colors.textOnDarkMuted, fontFamily: Typography.fontFamily.regular },

  // Content
  content: { padding: 16 },

  // Step header
  stepHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10, marginTop: 4 },
  stepBadge: { width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" },
  stepNum: { fontSize: 13, fontFamily: Typography.fontFamily.bold, color: Colors.white },
  stepTitle: { fontSize: 15, fontFamily: Typography.fontFamily.semiBold, color: Colors.textPrimary },
  optional: { fontFamily: Typography.fontFamily.regular, color: Colors.textTertiary, fontSize: 13 },

  // Type chips
  typesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  typeChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 9,
    borderRadius: 20, borderWidth: 1.5, borderColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  typeChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  typeChipText: { fontSize: 13, fontFamily: Typography.fontFamily.medium, color: Colors.textSecondary },
  typeChipTextActive: { color: Colors.primary, fontFamily: Typography.fontFamily.semiBold },
  typeCheck: { width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" },

  // Description card
  card: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 14, marginBottom: 20,
    borderWidth: 1, borderColor: Colors.borderLight, ...Shadows.sm,
  },
  descInput: {
    fontSize: 15, fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary, minHeight: 120, textAlignVertical: "top",
  },
  charCount: { fontSize: 11, color: Colors.textTertiary, fontFamily: Typography.fontFamily.medium, textAlign: "right", marginTop: 6 },

  // Image row
  imgRow: { gap: 10, paddingBottom: 4, marginBottom: 20 },
  imgWrap: { position: "relative" },
  imgPreview: { width: 96, height: 96, borderRadius: 12, backgroundColor: Colors.borderLight },
  imgRemove: { position: "absolute", top: -8, right: -8, backgroundColor: Colors.white, borderRadius: 12 },
  imgAdd: {
    width: 96, height: 96, borderRadius: 12,
    borderWidth: 1.5, borderColor: Colors.borderLight, borderStyle: "dashed",
    justifyContent: "center", alignItems: "center", backgroundColor: Colors.surface, gap: 2,
  },
  imgAddText: { fontSize: 12, color: Colors.textSecondary, fontFamily: Typography.fontFamily.medium },
  imgAddSub: { fontSize: 11, color: Colors.textTertiary, fontFamily: Typography.fontFamily.regular },

  // Submit
  submitBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 16,
    ...Shadows.md,
  },
  submitBtnDisabled: { backgroundColor: Colors.disabled },
  submitBtnText: { fontSize: 16, fontFamily: Typography.fontFamily.bold, color: Colors.white },
});
