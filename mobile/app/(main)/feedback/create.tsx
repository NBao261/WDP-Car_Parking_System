import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Typography, Spacing } from "../../../src/constants/theme";
import { Button } from "../../../src/components";
import { feedbackApi } from "../../../src/services/api";

const FEEDBACK_TYPES = [
  { id: "lost_card", label: "Mất thẻ/Vé", icon: "card-outline" },
  { id: "wrong_fee", label: "Sai phí gửi", icon: "cash-outline" },
  { id: "hard_to_find", label: "Khó tìm vị trí", icon: "navigate-outline" },
  { id: "slot_occupied", label: "Chỗ bị chiếm", icon: "car-sport-outline" },
  { id: "other", label: "Khác", icon: "chatbubble-ellipses-outline" },
];

export default function CreateFeedbackScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string>("other");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async () => {
    // Xin quyền truy cập thư viện ảnh
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Quyền bị từ chối",
        "Bạn cần cấp quyền truy cập thư viện ảnh để đính kèm hình ảnh."
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setImages([...images, base64Image]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mô tả phản hồi");
      return;
    }

    try {
      setSubmitting(true);
      const res: any = await feedbackApi.createFeedback({
        type: selectedType,
        description: description.trim(),
        images,
      });

      if (res.success) {
        Alert.alert("Thành công", "Phản hồi của bạn đã được gửi.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      console.log("Submit feedback error", error);
      Alert.alert(
        "Lỗi",
        error?.response?.data?.message || "Không thể gửi phản hồi lúc này."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gửi Phản Hồi</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text style={styles.sectionTitle}>Loại vấn đề</Text>
        <View style={styles.typeContainer}>
          {FEEDBACK_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeButton,
                selectedType === type.id && styles.typeButtonSelected,
              ]}
              onPress={() => setSelectedType(type.id)}
            >
              <Ionicons
                name={type.icon as any}
                size={20}
                color={
                  selectedType === type.id ? Colors.primary : Colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.typeText,
                  selectedType === type.id && styles.typeTextSelected,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Mô tả chi tiết</Text>
        <TextInput
          style={styles.input}
          placeholder="Vui lòng mô tả chi tiết vấn đề bạn gặp phải..."
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.sectionTitle}>Hình ảnh đính kèm (tùy chọn)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
          {images.map((img, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri: img }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removeImageBtn}
                onPress={() => removeImage(index)}
              >
                <Ionicons name="close-circle" size={24} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          ))}
          {images.length < 3 && (
            <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
              <Ionicons name="camera-outline" size={32} color={Colors.textSecondary} />
              <Text style={styles.addImageText}>Thêm ảnh</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={submitting ? "Đang gửi..." : "Gửi Phản Hồi"}
          onPress={handleSubmit}
          disabled={submitting || !description.trim()}
          loading={submitting}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Spacing.xl + Spacing.sm,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  typeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  typeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  typeButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "10",
  },
  typeText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  typeTextSelected: {
    color: Colors.primary,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: Spacing.md,
    fontSize: 15,
    color: Colors.textPrimary,
    minHeight: 120,
  },
  imageScroll: {
    flexDirection: "row",
    marginTop: Spacing.xs,
  },
  imageContainer: {
    marginRight: Spacing.md,
    position: "relative",
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: Colors.border,
  },
  removeImageBtn: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "white",
    borderRadius: 12,
  },
  addImageBtn: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.surface,
  },
  addImageText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  footer: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
