import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {

  return (
    <Tabs>
      <Tabs.Screen name = "dashboard" options={{title: "Dashboard"}} />
      <Tabs.Screen name = "topup" options={{title: "Top Up"}} />
      <Tabs.Screen name = "payment" options={{title: "Payment"}} />
      <Tabs.Screen name = "transactions" options={{title: "History"}} />
    </Tabs>
  );
}
