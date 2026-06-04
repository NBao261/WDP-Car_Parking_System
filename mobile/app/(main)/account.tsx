import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '../../src/components';
import { Colors, Typography, Spacing, BorderRadius } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function AccountScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const menuItems = [
    { icon: 'person-outline' as const, label: 'Thông tin cá nhân', onPress: () => {} },
    { icon: 'car-outline' as const, label: 'Xe của tôi', onPress: () => {} },
    { icon: 'card-outline' as const, label: 'Phương thức thanh toán', onPress: () => {} },
    { icon: 'notifications-outline' as const, label: 'Thông báo', onPress: () => {} },
    { icon: 'help-circle-outline' as const, label: 'Trợ giúp', onPress: () => {} },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đăng xuất', 
          style: 'destructive', 
          onPress: async () => {
            await logout();
            router.replace('/');
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Card */}
      <Card variant="elevated">
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color={Colors.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'Driver'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'driver@smartparking.com'}</Text>
          </View>
        </View>
      </Card>

      {/* Menu Items */}
      <Card variant="outlined">
        {menuItems.map((item, index) => (
          <View key={item.label}>
            <View style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <Ionicons name={item.icon} size={22} color={Colors.textSecondary} />
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
            </View>
            {index < menuItems.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </Card>

      {/* Logout */}
      <Button
        title="Đăng xuất"
        variant="outline"
        fullWidth
        onPress={handleLogout}
        icon={<Ionicons name="log-out-outline" size={20} color={Colors.primary} />}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.base,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    marginLeft: Spacing.md,
  },
  profileName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textPrimary,
  },
  profileEmail: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  menuLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
  },
});
