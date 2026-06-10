import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge, TextInput } from '../../src/components';
import { Colors, Typography, Spacing, BorderRadius } from '../../src/constants/theme';
import { api, vehicleTypeApi } from '../../src/services/api';
import { Facility } from '../../src/types/facility.types';

export default function FacilitiesScreen() {
  const router = useRouter();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [vehicleTypeIdFilter, setVehicleTypeIdFilter] = useState<string>('all');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchFacilities = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const data = await api.getPublicFacilities(1, 50, debouncedSearch, statusFilter, vehicleTypeIdFilter);
      setFacilities(data);
    } catch (error) {
      console.log('Failed to fetch facilities', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, [debouncedSearch, statusFilter, vehicleTypeIdFilter]);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await vehicleTypeApi.getVehicleTypes();
        if (response.success) {
          setVehicleTypes(response.data);
        }
      } catch (err) {
        console.log('Failed to fetch vehicle types', err);
      }
    };
    fetchTypes();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFacilities(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          placeholder="Tìm kiếm bãi xe, địa chỉ..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Ionicons name="search" size={20} color={Colors.textSecondary} />}
          style={styles.searchInput}
        />
        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {(['all', 'active', 'inactive'] as const).map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterChip,
                  statusFilter === status && styles.filterChipActive
                ]}
                onPress={() => setStatusFilter(status)}
              >
                <Text style={[
                  styles.filterChipText,
                  statusFilter === status && styles.filterChipTextActive
                ]}>
                  {status === 'all' ? 'Tất cả' : status === 'active' ? 'Mở cửa' : 'Đóng cửa'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={[styles.filterRow, { marginTop: Spacing.sm }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            <TouchableOpacity
              style={[styles.filterChip, vehicleTypeIdFilter === 'all' && styles.filterChipActive]}
              onPress={() => setVehicleTypeIdFilter('all')}
            >
              <Text style={[styles.filterChipText, vehicleTypeIdFilter === 'all' && styles.filterChipTextActive]}>
                Tất cả xe
              </Text>
            </TouchableOpacity>
            {vehicleTypes.map(type => (
              <TouchableOpacity
                key={type._id}
                style={[styles.filterChip, vehicleTypeIdFilter === type._id && styles.filterChipActive]}
                onPress={() => setVehicleTypeIdFilter(type._id)}
              >
                <Text style={[styles.filterChipText, vehicleTypeIdFilter === type._id && styles.filterChipTextActive]}>
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={facilities}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item: facility }) => (
          <Card
            title={facility.name}
            subtitle={facility.address}
            variant="elevated"
            style={styles.card}
            onPress={() => router.push(`/facility/${facility._id}`)}
          >
            <View style={styles.facilityInfo}>
              <View style={styles.facilityDetail}>
                <Ionicons name="location-outline" size={16} color={Colors.primary} />
                <Text style={styles.facilityDetailText} numberOfLines={1}>
                  {facility.address}
                </Text>
              </View>
              <View style={[styles.facilityDetail, { marginTop: Spacing.xs }]}>
                <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.facilityDetailText}>
                  {facility.operationHours?.open || '00:00'} - {facility.operationHours?.close || '23:59'}
                </Text>
                <View style={{ flex: 1 }} />
                <Badge 
                  label={facility.status === 'active' ? 'Mở cửa' : 'Đóng cửa'} 
                  variant={facility.status === 'active' ? 'success' : 'danger'} 
                  size="sm" 
                />
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Không tìm thấy bãi xe nào.</Text>
          </View>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: Spacing.base,
  },
  card: {
    marginBottom: Spacing.md,
  },
  facilityInfo: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  facilityDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  facilityDetailText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    flexShrink: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  header: {
    backgroundColor: Colors.white,
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  searchInput: {
    marginBottom: Spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
  },
  filterScroll: {
    gap: Spacing.sm,
    paddingRight: Spacing.xl,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  filterChipActive: {
    backgroundColor: Colors.primary + '15',
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.primary,
  },
});
