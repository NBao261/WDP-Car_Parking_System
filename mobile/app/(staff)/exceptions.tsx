import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
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
  { label: string; color: string; icon: any; bg: string }
> = {
  PENDING: {
    label: "Đang chờ",
    color: "#ff9800",
    icon: "time-outline",
    bg: "#fff3e0",
  },
  RESOLVED: {
    label: "Đã giải quyết",
    color: "#4caf50",
    icon: "checkmark-circle-outline",
    bg: "#e8f5e9",
  },
  REJECTED: {
    label: "Từ chối",
    color: "#f44336",
    icon: "close-circle-outline",
    bg: "#ffebee",
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
        <Ionicons name={icon} size={32} color={Colors.textTertiary} />
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
    const date = new Date(item.createdAt).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardLeft}>
            <View
              style={[styles.plateWrap, { backgroundColor: Colors.primaryBg }]}
            >
              <Text style={styles.plateText}>
                {item.actualPlate || item.expectedPlate || "Không rõ"}
              </Text>
            </View>
          </View>
          <Text style={styles.cardTime}>{date.split(" ")[1]}</Text>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.cardDetail}>
            <Ionicons
              name="alert-circle-outline"
              size={14}
              color={typeConfig.color}
            />
            <Text
              style={[
                styles.cardDetailText,
                {
                  color: typeConfig.color,
                  fontFamily: Typography.fontFamily.semiBold,
                },
              ]}
            >
              {typeConfig.label}
            </Text>
          </View>
          <View style={styles.cardDetail}>
            <Ionicons
              name="time-outline"
              size={14}
              color={Colors.textTertiary}
            />
            <Text style={styles.cardDetailText}>
              Ngày: {date.split(" ")[0]}
            </Text>
          </View>
        </View>

        {item.description ? (
          <View style={styles.descWrap}>
            <Text style={styles.descText} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
        ) : null}

        <View style={styles.footerWrap}>
          <View style={[styles.badge, { backgroundColor: statusConfig.bg }]}>
            <Ionicons
              name={statusConfig.icon}
              size={12}
              color={statusConfig.color}
            />
            <Text style={[styles.badgeText, { color: statusConfig.color }]}>
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
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientMid]}
          style={styles.header}
        >
          <SafeAreaView edges={["top"]}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={{
                width: 100,
                height: 28,
                resizeMode: "contain",
                marginTop: 12,
              }}
            />
            <Text style={styles.headerTitle}>Sự cố</Text>
            <Text style={styles.headerSub}>
              Theo dõi và xử lý sự cố trong ca trực
            </Text>
          </SafeAreaView>
        </LinearGradient>
      </View>

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
              subtitle="Chưa có sự cố nào được ghi nhận"
            />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  headerWrapper: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 22,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textOnDark,
    marginTop: 8,
  },
  headerSub: {
    fontSize: 13,
    color: Colors.textOnDarkMuted,
    fontFamily: Typography.fontFamily.regular,
    marginTop: 3,
  },

  list: { padding: 16, paddingBottom: 32 },

  // Card
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#5E8F25",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  plateWrap: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  plateText: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
    letterSpacing: 1.5,
  },
  cardTime: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontFamily: Typography.fontFamily.medium,
  },

  cardDetails: { gap: 4 },
  cardDetail: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardDetailText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.regular,
    flex: 1,
  },

  descWrap: {
    marginTop: 10,
    backgroundColor: Colors.surfaceElevated,
    padding: 10,
    borderRadius: 8,
  },
  descText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.regular,
  },

  footerWrap: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
  },

  // Badge
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 11, fontFamily: Typography.fontFamily.semiBold },

  // Empty
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    marginTop: 60,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
