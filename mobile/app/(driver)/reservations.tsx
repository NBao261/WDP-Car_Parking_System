import React, { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Colors, Typography, Spacing } from "../../src/constants/theme";
import { ReservationCard } from "../../src/components";
import { Reservation } from "../../src/types/reservation.types";
import { reservationApi } from "../../src/services/api";

export default function ReservationsScreen() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "history">(
    "upcoming",
  );
  const [upcoming, setUpcoming] = useState<Reservation[]>([]);
  const [history, setHistory] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchReservations = async () => {
    try {
      const response = (await reservationApi.getReservations()) as any;
      if (response.success) {
        const allReservations: Reservation[] = response.data;

        // Phân loại Đặt chỗ
        const up = allReservations.filter((r) =>
          ["pending", "confirmed"].includes(r.status),
        );
        const hist = allReservations.filter((r) =>
          ["used", "cancelled", "expired"].includes(r.status),
        );

        setUpcoming(up);
        setHistory(hist);
      }
    } catch (error) {
      console.log("Error fetching reservations:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReservations();
    }, []),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReservations();
  }, []);

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      const response = (await reservationApi.cancelReservation(id)) as any;
      if (response.success) {
        fetchReservations(); // Tải lại danh sách sau khi hủy
      }
    } catch (error) {
      console.log("Error cancelling reservation:", error);
      // Hiển thị toast hoặc alert lỗi (nếu có UI component Toast)
    } finally {
      setCancellingId(null);
    }
  };

  const renderEmptyState = (title: string, subtitle: string) => (
    <View style={styles.emptyState}>
      <Ionicons
        name="calendar-outline"
        size={64}
        color={Colors.disabled}
        style={{ marginBottom: Spacing.md }}
      />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </View>
  );

  const renderContent = () => {
    if (loading && !refreshing) {
      return <ActivityIndicator style={styles.loader} color={Colors.primary} />;
    }

    const currentData = activeTab === "upcoming" ? upcoming : history;

    if (currentData.length === 0) {
      return (
        <ScrollView
          contentContainerStyle={styles.emptyScroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {renderEmptyState(
            activeTab === "upcoming"
              ? "Không có đặt chỗ nào sắp tới"
              : "Chưa có lịch sử đặt chỗ",
            activeTab === "upcoming"
              ? "Các đặt chỗ chờ xác nhận hoặc đã xác nhận sẽ hiển thị ở đây"
              : "Các đặt chỗ đã hoàn thành, quá hạn hoặc bị hủy sẽ hiển thị ở đây",
          )}
        </ScrollView>
      );
    }

    return (
      <FlatList
        data={currentData}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <ReservationCard
            reservation={item}
            onCancel={handleCancel}
            cancellingId={cancellingId}
          />
        )}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.segmentContainer}>
        <View style={styles.segmentControl}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              activeTab === "upcoming" && styles.segmentButtonActive,
            ]}
            onPress={() => setActiveTab("upcoming")}
          >
            <Text
              style={[
                styles.segmentText,
                activeTab === "upcoming" && styles.segmentTextActive,
              ]}
            >
              Sắp tới
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              activeTab === "history" && styles.segmentButtonActive,
            ]}
            onPress={() => setActiveTab("history")}
          >
            <Text
              style={[
                styles.segmentText,
                activeTab === "history" && styles.segmentTextActive,
              ]}
            >
              Lịch sử
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>{renderContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  segmentContainer: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  segmentControl: {
    flexDirection: "row",
    backgroundColor: Colors.divider,
    borderRadius: 8,
    padding: 2,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    borderRadius: 6,
  },
  segmentButtonActive: {
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
  },
  segmentTextActive: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semiBold,
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.lg,
  },
  emptyScroll: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
    marginTop: Spacing["3xl"],
  },
  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
    textAlign: "center",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing["3xl"],
  },
});
