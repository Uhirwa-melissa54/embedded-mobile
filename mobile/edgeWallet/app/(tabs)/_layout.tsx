import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  
  // Get current user role (in a real app, use AsyncStorage or Context)
  const currentUser = (global as any).currentUser || { role: 'agent' };
  const isAgent = currentUser.role === 'agent';
  const isSales = currentUser.role === 'sales';

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            (global as any).currentUser = null;
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
        headerRight: () => (
          <TouchableOpacity
            onPress={handleLogout}
            style={{ marginRight: 16 }}
          >
            <IconSymbol size={24} name="rectangle.portrait.and.arrow.right" color={Colors[colorScheme ?? 'light'].tint} />
          </TouchableOpacity>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          headerTitle: `Dashboard - ${currentUser.name || 'User'}`,
        }}
      />
      <Tabs.Screen
        name="topup"
        options={{
          title: 'Top Up',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="plus.circle.fill" color={color} />,
          headerTitle: 'Top Up Card',
          // Hide for sales role
          href: isSales ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="payment"
        options={{
          title: 'Payment',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="cart.fill" color={color} />,
          headerTitle: 'Marketplace',
          // Hide for agent role (optional - agents can also view marketplace)
          // href: isAgent ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet" color={color} />,
          headerTitle: 'Transaction History',
        }}
      />
    </Tabs>
  );
}
