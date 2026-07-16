import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Typography } from "../../src/constants/theme";
import { exceptionApi } from "../../src/services/api";
import { useAuthStore } from "../../src/store/useAuthStore";

// Map exception types to labels and colors
const EXCEPTION_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  LOST_CARD: { label: "Mất vé", color: "#ff9800", bg: "#fff3e0" },
  WRONG_PLATE: { label: "Sai biển số", color: "#f44336", bg: "#ffebee" },
  SYSTEM_ERROR: { label: "Lỗi hệ thống", color: "#9c27b0", bg: "#f3e5f5" },
  OTHER: { label: "Khác", color: "#607d8b", bg: "#eceff1" },
};

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: any; bg: string; dotColor: string }
> = {
  PENDING: {
    label: "Đang chờ",
    color: Colors.brandDark,
    icon: "time-outline",
    bg: Colors.surfaceElevated,
    dotColor: "#6B7260",
  },
  RESOLVED: {
    label: "Đã giải quyết",
    color: "#2E7D32",
    icon: "checkmark-circle-outline",
    bg: "#E8F5E9",
    dotColor: "#2E7D32",
  },
  REJECTED: {
    label: "Từ chối",
    color: "#9E9E9E",
    icon: "close-circle-outline",
    bg: Colors.surfaceElevated,
    dotColor: "#9E9E9E",
  },
};

function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: any;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={32} color={Colors.disabled} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </View>
  );
}

export default function ExceptionsScreen() {
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { selectedFacilityId } = useAuthStore();

  const fetchExceptions = async () => {
    try {
      if (!selectedFacilityId) return;
      const res: any = await exceptionApi.getExceptions({
        limit: 50,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      if (res.data) {
        setExceptions(Array.isArray(res.data) ? res.data : []);
      }
    } catch (e) {
      console.log("Error fetching exceptions", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExceptions();
  }, [selectedFacilityId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchExceptions();
  }, [selectedFacilityId]);

  const renderItem = ({ item }: { item: any }) => {
    const typeConfig = EXCEPTION_CONFIG[item.type] || EXCEPTION_CONFIG.OTHER;
    const statusConfig =
      STATUS_CONFIG[item.status.toUpperCase()] || STATUS_CONFIG.PENDING;
    const createdDate = new Date(item.createdAt);
    const time = createdDate.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const date = createdDate.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    return (
      <View style={styles.card}>
        {/* Row 1: Plate + Time */}
        <View style={styles.cardRow1}>
          <Text style={styles.cardPlate}>
            {item.actualPlate || item.expectedPlate || "Không rõ"}
          </Text>
          <Text style={styles.cardTime}>{time}</Text>
        </View>

        {/* Category pill */}
        <View style={styles.categoryRow}>
          <View
            style={[styles.categoryPill, { backgroundColor: typeConfig.bg }]}
          >
            <Text
              style={[styles.categoryText, { color: typeConfig.color }]}
            >
              {typeConfig.label}
            </Text>
          </View>
        </View>

        {/* Description */}
        {item.description ? (
          <View style={styles.descWrap}>
            <Text style={styles.descText} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
        ) : null}

        {/* Footer: Date + Status Badge */}
        <View style={styles.footerRow}>
          <View style={styles.dateWrap}>
            <Ionicons
              name="calendar-outline"
              size={13}
              color={Colors.textTertiary}
            />
            <Text style={styles.dateText}>{date}</Text>
          </View>

          <View
            style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: statusConfig.dotColor },
              ]}
            />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <SafeAreaView edges={["top"]} style={styles.headerSafe}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Báo cáo Sự cố</Text>
            <Text style={styles.headerSub}>
              Quản lý và giải quyết sự cố tại bãi đỗ
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <FlatList
        data={exceptions}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="shield-checkmark-outline"
              title="Không có sự cố nào"
              subtitle="Hệ thống đang hoạt động ổn định, không có báo cáo cần xử lý."
            />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },

  headerSafe: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.brandDark,
  },
  headerSub: {
    fontSize: 13,
    color: Colors.textTertiary,
    fontFamily: Typography.fontFamily.medium,
    marginTop: 3,
  },

  list: { padding: 16, paddingBottom: 32 },

  // Card
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#14161C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  cardRow1: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardPlate: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.brandDark,
    letterSpacing: 0.5,
  },
  cardTime: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textTertiary,
  },

  // Category pill
  categoryRow: {
    marginBottom: 10,
  },
  categoryPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.bold,
  },

  // Description
  descWrap: {
    marginBottom: 12,
  },
  descText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.regular,
    lineHeight: 20,
  },

  // Footer
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  dateWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dateText: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textTertiary,
  },

  // Status badge
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.bold,
  },

  // Empty
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    marginTop: 40,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.brandDark,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textTertiary,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 240,
  },
});

