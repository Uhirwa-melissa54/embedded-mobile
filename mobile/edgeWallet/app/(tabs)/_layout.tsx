import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, TouchableOpacity, Alert, View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TabLayout() {
  const currentUser = (global as any).currentUser || { role: 'agent', name: 'User' };

  const handleLogout = () => {
    Alert.alert(
      'SIGN OUT',
      'End your current session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
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
        headerShown: true,
        tabBarButton: HapticTab,

        // ── Tab bar ──────────────────────────────────────────
        tabBarStyle: {
          backgroundColor: '#080808',
          borderTopWidth: 1,
          borderTopColor: '#161616',
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 10,
          ...(Platform.OS === 'ios' ? { position: 'absolute' } : {}),
        },
        tabBarActiveTintColor: '#e8ff5a',
        tabBarInactiveTintColor: '#2a2a2a',
        tabBarLabelStyle: {
          fontSize: 8,
          fontWeight: '700',
          letterSpacing: 2,
          textTransform: 'uppercase',
        },

        // ── Header ───────────────────────────────────────────
        headerStyle: {
          backgroundColor: '#080808',
          borderBottomWidth: 1,
          borderBottomColor: '#161616',
          shadowOpacity: 0,
          elevation: 0,
        },
        headerTitleStyle: {
          color: '#f0f0f0',
          fontSize: 10,
          fontWeight: '800',
          letterSpacing: 4,
          textTransform: 'uppercase',
        },
        headerTintColor: '#e8ff5a',

        headerLeft: () => (
          <View style={styles.headerLeft}>
            <View style={styles.logoMark} />
            <Text style={styles.userRole}>
              {currentUser.role === 'agent' ? '👤' : '🛒'}
            </Text>
          </View>
        ),

        headerRight: () => (
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutBtn}
            activeOpacity={0.7}
          >
            <IconSymbol
              size={16}
              name="rectangle.portrait.and.arrow.right"
              color="#333"
            />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'HOME',
          headerTitle: 'DASHBOARD',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="house.fill" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="topup"
        options={{
          title: 'TOP UP',
          headerTitle: 'TOP UP',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="plus.circle.fill" color={color} focused={focused} accent="#e8ff5a" />
          ),
        }}
      />
      <Tabs.Screen
        name="payment"
        options={{
          title: 'MARKET',
          headerTitle: 'MARKETPLACE',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="cart.fill" color={color} focused={focused} accent="#5ae8c8" />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'LEDGER',
          headerTitle: 'LEDGER HISTORY',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="list.bullet" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

function TabIcon({
  name,
  color,
  focused,
  accent = '#e8ff5a',
}: {
  name: string;
  color: string;
  focused: boolean;
  accent?: string;
}) {
  return (
    <View style={[styles.tabIconWrapper, focused && styles.tabIconWrapperFocused]}>
      {focused && <View style={[styles.tabIconDot, { backgroundColor: accent }]} />}
      <IconSymbol size={20} name={name} color={focused ? accent : '#2a2a2a'} />
    </View>
  );
}

const styles = StyleSheet.create({
  headerLeft: {
    marginLeft: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoMark: {
    width: 8,
    height: 8,
    backgroundColor: '#e8ff5a',
    transform: [{ rotate: '45deg' }],
  },
  userRole: {
    fontSize: 14,
  },
  logoutBtn: {
    marginRight: 16,
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapper: {
    width: 36,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabIconWrapperFocused: {
    // subtle glow container — icon color handles the rest
  },
  tabIconDot: {
    position: 'absolute',
    top: 0,
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
});