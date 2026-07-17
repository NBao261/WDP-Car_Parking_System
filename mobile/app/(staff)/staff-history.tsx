import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
        <Ionicons name={icon} size={32} color={Colors.disabled} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </View>
  );
}

const SessionCard = React.memo(({ item }: { item: any }) => {
  return (
    <View style={styles.card}>
      {/* Row 1: Plate + Time */}
      <View style={styles.cardHeader}>
        <View style={styles.plateWrap}>
          <Text style={styles.plateText}>{item.licensePlate}</Text>
        </View>
        <Text style={styles.cardTime}>
          {new Date(item.startTime || item.checkInTime).toLocaleTimeString(
            "vi-VN",
            { hour: "2-digit", minute: "2-digit" },
          )}
        </Text>
      </View>

      {/* Row 2: Date */}
      <View style={styles.cardDetail}>
        <Ionicons name="time-outline" size={14} color={Colors.primary} />
        <Text style={styles.cardDetailText}>
          {new Date(item.startTime || item.checkInTime).toLocaleDateString(
            "vi-VN",
          )}
        </Text>
      </View>

      {/* Row 3: Floor + Slot */}
      <View style={styles.cardFooter}>
        <View style={styles.cardDetail}>
          <Ionicons
            name="layers-outline"
            size={14}
            color={Colors.textTertiary}
          />
          <Text style={styles.cardSlotText}>
            Tầng {item.floorId?.name || "---"}
          </Text>
          <Text style={styles.cardDot}>•</Text>
          <Text style={styles.cardSlotText}>
            Ô {item.slotId?.code || "---"}
          </Text>
        </View>
      </View>
    </View>
  );
});

export default function StaffHistoryScreen() {
  const { selectedFacilityId } = useAuthStore();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchActiveSessions = async (pageNum = 1, isLoadMore = false) => {
    try {
      if (!selectedFacilityId) return;
      const response = await sessionApi.getActiveSessions({
        facilityId: selectedFacilityId,
        page: pageNum,
        limit: 10,
      });
      if (response.data) {
        setSessions(prev => isLoadMore ? [...prev, ...response.data] : response.data);
        setTotalPages(response.totalPages || 1);
        setTotalCount(response.total || 0);
        setPage(pageNum);
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
      setLoading(true);
      fetchActiveSessions(1, false);
    }, [selectedFacilityId]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchActiveSessions(1, false);
  }, [selectedFacilityId]);

  const loadMore = () => {
    if (page < totalPages && !loading && !refreshing) {
      fetchActiveSessions(page + 1, true);
    }
  };

  const renderItem = useCallback(({ item }: { item: any }) => <SessionCard item={item} />, []);

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]} style={styles.headerSafe}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Lịch sử đỗ xe</Text>
        </View>

        {/* Subtitle label */}
        <View style={styles.subtitleWrap}>
          <Text style={styles.subtitleText}>Các xe đang đỗ trong toà nhà</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{totalCount} xe</Text>
          </View>
        </View>
      </SafeAreaView>

      {/* Content */}
      <View style={styles.content}>
        {loading && !refreshing && sessions.length === 0 ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
        ) : (
          <FlatList
            data={sessions}
            keyExtractor={(item) => item._id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={Colors.primary}
              />
            }
            ListEmptyComponent={
              <EmptyState
                icon="car-outline"
                title="Không tìm thấy xe nào"
                subtitle="Vui lòng kiểm tra lại hoặc quét xe mới ở tab Quét!"
              />
            }
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            removeClippedSubviews={true}
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={5}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
          />
        )}
      </View>
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
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.brandDark,
  },

  subtitleWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 14,
  },
  subtitleText: {
    fontSize: 13,
    color: Colors.textTertiary,
    fontFamily: Typography.fontFamily.medium,
  },
  countBadge: {
    backgroundColor: Colors.primaryBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
  },

  content: { flex: 1, backgroundColor: Colors.white },
  list: { padding: 16, paddingBottom: 32 },

  // Card
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#14161C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  plateWrap: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  plateText: {
    fontSize: 15,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.brandDark,
    letterSpacing: 2,
  },
  cardTime: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.brandDark,
  },

  cardDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  cardDetailText: {
    fontSize: 13,
    color: Colors.textTertiary,
    fontFamily: Typography.fontFamily.medium,
  },

  cardFooter: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cardSlotText: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textSecondary,
  },
  cardDot: {
    fontSize: 13,
    color: Colors.disabled,
    marginHorizontal: 2,
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
    maxWidth: 220,
  },
});

