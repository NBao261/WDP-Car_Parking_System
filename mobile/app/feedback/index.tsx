import React, { useCallback, useState } from "react";
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Typography, Spacing, Shadows } from "../../src/constants/theme";
import { feedbackApi } from "../../src/services/api";

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    submitted:  { label: "Đã gửi",       color: Colors.warning,       bg: Colors.warningLight,  icon: "time-outline" },
    processing: { label: "Đang xử lý",   color: Colors.primary,       bg: Colors.primaryBg,     icon: "sync-outline" },
    resolved:   { label: "Đã giải quyết",color: Colors.success,       bg: Colors.successLight,  icon: "checkmark-circle-outline" },
    rejected:   { label: "Từ chối",       color: Colors.danger,        bg: Colors.dangerLight,   icon: "close-circle-outline" },
  };
  const s = map[status] || { label: status, color: Colors.textSecondary, bg: Colors.surfaceElevated, icon: "ellipse-outline" };
  return (
    <View style={[styles.chip, { backgroundColor: s.bg }]}>
      <Ionicons name={s.icon} size={11} color={s.color} />
      <Text style={[styles.chipText, { color: s.color }]}>{s.label}</Text>
    </View>
  );
}

function TypeLabel({ type }: { type: string }) {
  const map: Record<string, string> = {
    lost_card:     "Mất thẻ/Vé",
    wrong_fee:     "Sai phí",
    hard_to_find:  "Khó tìm chỗ",
    slot_occupied: "Chỗ bị chiếm",
    other:         "Khác",
  };
  return <Text style={styles.typeLabel}>{map[type] || type}</Text>;
}

export default function FeedbackListScreen() {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeedbacks = async () => {
    try {
      const res: any = await feedbackApi.getFeedbacks({ limit: 50 });
      if (res.success) setFeedbacks(res.data || []);
    } catch (e) {
      console.log("Error fetching feedbacks", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetchFeedbacks(); }, []));
  const onRefresh = () => { setRefreshing(true); fetchFeedbacks(); };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.timelineRow}>
      {/* Timeline line */}
      <View style={styles.timelineLeft}>
        <View style={[styles.dot, { backgroundColor: item.status === 'resolved' ? Colors.success : Colors.primary }]} />
        {index < feedbacks.length - 1 && <View style={styles.line} />}
      </View>
      {/* Card */}
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <TypeLabel type={item.type} />
            <Text style={styles.dateText}>
              {new Date(item.createdAt).toLocaleDateString("vi-VN", {
                day: "2-digit", month: "2-digit", year: "numeric",
              })}
            </Text>
          </View>
          <StatusChip status={item.status} />
        </View>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        {item.responseNote && (
          <View style={styles.responseBox}>
            <View style={styles.responseHeader}>
              <Ionicons name="person-circle-outline" size={14} color={Colors.primary} />
              <Text style={styles.responseBy}>Phản hồi từ quản lý</Text>
            </View>
            <Text style={styles.responseNote}>{item.responseNote}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      {/* Header */}
      <LinearGradient colors={[Colors.gradientStart, Colors.gradientMid]} style={styles.header}>
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Phản hồi của tôi</Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => router.push("/feedback/create" as any)}
            >
              <Ionicons name="add" size={22} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      ) : feedbacks.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="chatbubble-outline" size={32} color={Colors.textTertiary} />
          </View>
          <Text style={styles.emptyTitle}>Chưa có phản hồi nào</Text>
          <Text style={styles.emptySub}>Gửi phản hồi để chúng tôi cải thiện dịch vụ</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push("/feedback/create" as any)}>
            <Ionicons name="add-circle-outline" size={16} color={Colors.white} />
            <Text style={styles.emptyBtnText}>Gửi phản hồi mới</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={feedbacks}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  header: { paddingHorizontal: 16, paddingBottom: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", paddingTop: 8 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontFamily: Typography.fontFamily.bold, color: Colors.white },
  addBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
  },

  list: { padding: 16, paddingBottom: 32 },

  // Timeline
  timelineRow: { flexDirection: "row", marginBottom: 4 },
  timelineLeft: { width: 28, alignItems: "center" },
  dot: { width: 12, height: 12, borderRadius: 6, marginTop: 18, zIndex: 1 },
  line: { width: 2, flex: 1, backgroundColor: Colors.borderLight, marginTop: 4, alignSelf: "center" },

  // Card
  card: {
    flex: 1, marginLeft: 10, marginBottom: 16,
    backgroundColor: Colors.surface,
    borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  dateText: { fontSize: 11, color: Colors.textTertiary, fontFamily: Typography.fontFamily.regular, marginTop: 2 },
  description: { fontSize: 14, color: Colors.textPrimary, fontFamily: Typography.fontFamily.regular, lineHeight: 20 },

  // Type
  typeLabel: { fontSize: 14, fontFamily: Typography.fontFamily.semiBold, color: Colors.textPrimary },

  // Status chip
  chip: { flexDirection: "row", alignItems: "center", gap: 3, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4 },
  chipText: { fontSize: 11, fontFamily: Typography.fontFamily.semiBold },

  // Response
  responseBox: {
    marginTop: 10, padding: 10, backgroundColor: Colors.primaryBg,
    borderRadius: 10, borderLeftWidth: 3, borderLeftColor: Colors.primary,
  },
  responseHeader: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 },
  responseBy: { fontSize: 11, fontFamily: Typography.fontFamily.semiBold, color: Colors.primary },
  responseNote: { fontSize: 13, color: Colors.textPrimary, lineHeight: 18 },

  // Empty
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.surfaceElevated,
    alignItems: "center", justifyContent: "center", marginBottom: 16,
  },
  emptyTitle: { fontSize: 16, fontFamily: Typography.fontFamily.semiBold, color: Colors.textPrimary, marginBottom: 6 },
  emptySub: { fontSize: 13, color: Colors.textSecondary, textAlign: "center", lineHeight: 20, marginBottom: 20 },
  emptyBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12,
  },
  emptyBtnText: { color: Colors.white, fontSize: 14, fontFamily: Typography.fontFamily.semiBold },
});
