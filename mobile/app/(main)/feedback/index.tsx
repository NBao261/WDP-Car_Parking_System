import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Typography, Spacing } from "../../../src/constants/theme";
import { feedbackApi } from "../../../src/services/api";

export default function FeedbackListScreen() {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeedbacks = async () => {
    try {
      const res: any = await feedbackApi.getFeedbacks({ limit: 50 });
      console.log("Feedbacks response:", JSON.stringify(res).substring(0, 300));
      if (res.success) {
        setFeedbacks(res.data || []);
      }
    } catch (error) {
      console.log("Error fetching feedbacks", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Re-fetch feedbacks every time the screen gains focus
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchFeedbacks();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeedbacks();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return Colors.warning;
      case "processing":
        return Colors.primary;
      case "resolved":
        return Colors.success;
      case "rejected":
        return Colors.danger;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "submitted":
        return "Đã gửi";
      case "processing":
        return "Đang xử lý";
      case "resolved":
        return "Đã giải quyết";
      case "rejected":
        return "Từ chối";
      default:
        return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "lost_card":
        return "card-outline";
      case "wrong_fee":
        return "cash-outline";
      case "hard_to_find":
        return "navigate-outline";
      case "slot_occupied":
        return "car-sport-outline";
      default:
        return "chatbubble-ellipses-outline";
    }
  };

  const renderFeedbackItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={styles.iconContainer}>
            <Ionicons name={getTypeIcon(item.type) as any} size={20} color={Colors.primary} />
          </View>
          <Text style={styles.dateText}>
            {new Date(item.createdAt).toLocaleDateString("vi-VN")}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + "20" },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>
      {item.responseNote ? (
        <View style={styles.responseContainer}>
          <Text style={styles.responseTitle}>Phản hồi từ Admin:</Text>
          <Text style={styles.responseText}>{item.responseNote}</Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Phản hồi của tôi</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/feedback/create")}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : feedbacks.length === 0 ? (
        <View style={styles.center}>
          <Ionicons
            name="chatbubble-outline"
            size={64}
            color={Colors.border}
          />
          <Text style={styles.emptyText}>Bạn chưa gửi phản hồi nào</Text>
        </View>
      ) : (
        <FlatList
          data={feedbacks}
          keyExtractor={(item) => item._id}
          renderItem={renderFeedbackItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: Spacing.md,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  dateText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  description: {
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  responseContainer: {
    marginTop: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  responseTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  responseText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    marginTop: Spacing.md,
    fontSize: 16,
    color: Colors.textSecondary,
  },
});
