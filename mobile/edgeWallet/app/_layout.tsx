import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export const unstable_settings = {
  initialRouteName: 'login',
};

// Force dark theme tokens to match EdgeWallet's #0a0a0a system
const EdgeTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0a0a0a',
    card: '#080808',
    text: '#f0f0f0',
    border: '#161616',
    primary: '#e8ff5a',
    notification: '#e8ff5a',
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={EdgeTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',
            headerShown: true,
            headerStyle: { backgroundColor: '#080808' },
            headerTitleStyle: {
              color: '#f0f0f0',
              fontSize: 10,
              fontWeight: '800',
              letterSpacing: 4,
              textTransform: 'uppercase',
            },
            headerTintColor: '#e8ff5a',
            headerShadowVisible: false,
          }}
        />
      </Stack>
      <StatusBar style="light" backgroundColor="#0a0a0a" />
    </ThemeProvider>
  );
}