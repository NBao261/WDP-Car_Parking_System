import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Typography } from "../../src/constants/theme";
import { sessionApi } from "../../src/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useAuthStore } from "../../src/store/useAuthStore";

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

function SessionCard({ item }: { item: any }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          <View
            style={[styles.plateWrap, { backgroundColor: Colors.primaryBg }]}
          >
            <Text style={styles.plateText}>{item.licensePlate}</Text>
          </View>
        </View>
        <Text style={styles.cardTime}>
          {new Date(item.startTime || item.checkInTime).toLocaleTimeString(
            "vi-VN",
            { hour: "2-digit", minute: "2-digit" },
          )}
        </Text>
      </View>
      <View style={styles.cardDetails}>
        <View style={styles.cardDetail}>
          <Ionicons name="time-outline" size={13} color={Colors.textTertiary} />
          <Text style={styles.cardDetailText} numberOfLines={1}>
            Vào:{" "}
            {new Date(item.startTime || item.checkInTime).toLocaleDateString(
              "vi-VN",
            )}
          </Text>
        </View>
        <View style={styles.cardDetail}>
          <Ionicons
            name="location-outline"
            size={13}
            color={Colors.textTertiary}
          />
          <Text style={styles.cardDetailText}>
            Tầng {item.floorId?.name || "---"} • Ô {item.slotId?.code || "---"}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function StaffHistoryScreen() {
  const { selectedFacilityId } = useAuthStore();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActiveSessions = async () => {
    try {
      if (!selectedFacilityId) return;
      const response = await sessionApi.getActiveSessions({
        facilityId: selectedFacilityId,
      });
      if (response.data) {
        setSessions(response.data);
      }
    } catch (error) {
      console.log("Error fetching staff history", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchActiveSessions();
    }, [selectedFacilityId]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchActiveSessions();
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
            <Text style={styles.headerTitle}>Lịch sử</Text>
            <Text style={styles.headerSub}>Các xe đang đỗ trong toà nhà</Text>
          </SafeAreaView>
        </LinearGradient>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
        ) : (
          <FlatList
            data={sessions}
            keyExtractor={(item) => item._id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <EmptyState
                icon="car-outline"
                title="Chưa có xe nào"
                subtitle="Chưa có lượt gửi xe nào đang hoạt động"
              />
            }
            renderItem={({ item }) => <SessionCard item={item} />}
            contentContainerStyle={styles.list}
          />
        )}
      </View>
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

  content: { flex: 1 },
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
  cardDetail: { flexDirection: "row", alignItems: "center", gap: 5 },
  cardDetailText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.regular,
    flex: 1,
  },

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
