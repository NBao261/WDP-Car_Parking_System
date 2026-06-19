import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { Colors, Typography } from '../../src/constants/theme';

function TabIcon({ name, color, focused }: { name: any; color: string; focused: boolean }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Ionicons name={name} size={22} color={color} />
    </View>
  );
}

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: Typography.fontFamily.medium,
          marginTop: 0,
        },
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 6,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 16,
          elevation: 16,
        },
        headerStyle: {
          backgroundColor: Colors.white,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: Colors.textPrimary,
        headerTitleStyle: {
          fontFamily: Typography.fontFamily.bold,
          fontSize: Typography.fontSize.md,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Trang chủ',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="facilities"
        options={{
          title: 'Bãi xe',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'map' : 'map-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: 'Hoạt động',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'receipt' : 'receipt-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Tôi',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} color={color} focused={focused} />
          ),
        }}
      />
      {/* Hidden screens — not shown in tab bar */}
      <Tabs.Screen name="reservations" options={{ href: null }} />
      <Tabs.Screen name="facility/[id]" options={{ href: null }} />
      <Tabs.Screen name="scan-plate" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 36,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  iconWrapActive: {
    backgroundColor: Colors.primaryBg,
  },
});
