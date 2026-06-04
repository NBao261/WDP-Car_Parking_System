import React, { useState, useCallback } from 'react';
import { useFocusEffect } from "expo-router";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../src/constants/theme';
import { SessionDetailCard, FeeEstimate } from '../../src/components';
import { ParkingSession } from '../../src/types/session.types';
import { sessionApi } from '../../src/services/api';

export default function SessionsScreen() {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [activeSessions, setActiveSessions] = useState<ParkingSession[]>([]);
  const [historySessions, setHistorySessions] = useState<ParkingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSessions = async () => {
    try {
      const status = activeTab === 'active' ? 'active' : 'completed';
      const response = (await sessionApi.getMySessions(status)) as any;
      
      if (response.success) {
        // Map backend response to FE interface
        const mappedSessions: ParkingSession[] = response.data.map((s: any) => ({
          _id: s._id,
          code: s.code,
          licensePlate: s.licensePlate,
          facilityName: s.facilityId?.name || 'Unknown',
          floorName: s.floorId?.name || '',
          slotCode: s.slotId?.code || '',
          vehicleTypeName: s.vehicleTypeId?.name || '',
          checkInTime: s.checkInTime,
          checkOutTime: s.checkOutTime || null,
          status: s.status,
          totalFee: s.totalFee || 0,
          pricingPlan: s.pricingPlanId // For fee estimation if needed
        }));

        if (activeTab === 'active') {
          setActiveSessions(mappedSessions);
        } else {
          setHistorySessions(mappedSessions);
        }
      }
    } catch (error) {
      console.log('Error fetching sessions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchSessions();
    }, [activeTab])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSessions();
  }, [activeTab]);

  const renderEmptyState = (title: string, subtitle: string) => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={64} color={Colors.disabled} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </View>
  );

  const renderActiveTab = () => {
    if (loading && !refreshing) return <ActivityIndicator style={styles.loader} color={Colors.primary} />;

    if (activeSessions.length === 0) {
      return (
        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          {renderEmptyState('Chưa có lượt gửi nào', 'Lượt gửi hiện tại của bạn sẽ hiển thị ở đây')}
        </ScrollView>
      );
    }

    return (
      <ScrollView 
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeSessions.map((session: any) => {
          // Use base fee from pricing plan if available
          const baseFee = session.pricingPlan?.rates?.[0]?.amount || 20000;
          return (
            <View key={session._id} style={styles.activeSessionWrapper}>
              <SessionDetailCard session={session} />
              <FeeEstimate checkInTime={session.checkInTime} baseFee={baseFee} />
            </View>
          );
        })}
      </ScrollView>
    );
  };

  const renderHistoryTab = () => {
    if (loading && !refreshing) return <ActivityIndicator style={styles.loader} color={Colors.primary} />;

    if (historySessions.length === 0) {
      return (
        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          {renderEmptyState('Chưa có lịch sử', 'Các lượt gửi đã hoàn thành sẽ hiển thị ở đây')}
        </ScrollView>
      );
    }

    return (
      <FlatList
        data={historySessions}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <SessionDetailCard session={item} />
        )}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Segmented Control */}
      <View style={styles.segmentContainer}>
        <View style={styles.segmentControl}>
          <TouchableOpacity
            style={[styles.segmentButton, activeTab === 'active' && styles.segmentButtonActive]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.segmentText, activeTab === 'active' && styles.segmentTextActive]}>
              Đang đỗ
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentButton, activeTab === 'history' && styles.segmentButtonActive]}
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.segmentText, activeTab === 'history' && styles.segmentTextActive]}>
              Lịch sử
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'active' ? renderActiveTab() : renderHistoryTab()}
      </View>
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
    flexDirection: 'row',
    backgroundColor: Colors.divider,
    borderRadius: BorderRadius.md,
    padding: 2,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  segmentButtonActive: {
    backgroundColor: Colors.white,
    // Add shadow
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
    padding: Spacing.base,
  },
  activeSessionWrapper: {
    marginBottom: Spacing.xl,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    marginTop: 100, // push down a bit
  },
  emptyTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textPrimary,
    marginTop: Spacing.base,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing['3xl'],
  }
});
