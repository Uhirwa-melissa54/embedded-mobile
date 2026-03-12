import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// Demo users
const DEMO_USERS = {
  agent: {
    username: 'agent',
    password: '1234',
    role: 'agent',
    name: 'Agent User',
  },
  sales: {
    username: 'sales',
    password: '1234',
    role: 'sales',
    name: 'Sales Person',
  },
};

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    setLoading(true);

    // Simulate network delay
    setTimeout(() => {
      const user = Object.values(DEMO_USERS).find(
        (u) => u.username === username && u.password === password
      );

      if (user) {
        // Store user info (in a real app, use AsyncStorage)
        global.currentUser = user;
        
        Alert.alert(
          'Login Successful',
          `Welcome ${user.name}!\n\nRole: ${user.role === 'agent' ? 'Agent (Top-up)' : 'Salesperson (Payment)'}`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to appropriate tab based on role
                if (user.role === 'agent') {
                  router.replace('/(tabs)');
                } else {
                  router.replace('/(tabs)/payment');
                }
              },
            },
          ]
        );
      } else {
        Alert.alert('Login Failed', 'Invalid username or password');
      }

      setLoading(false);
    }, 800);
  };

  const fillDemoCredentials = (role: 'agent' | 'sales') => {
    const user = DEMO_USERS[role];
    setUsername(user.username);
    setPassword(user.password);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ThemedView style={styles.content}>
        {/* Logo/Header */}
        <View style={styles.header}>
          <ThemedText style={styles.logo}>Edge<ThemedText style={styles.logoAccent}>Wallet</ThemedText></ThemedText>
          <ThemedText style={styles.subtitle}>RFID Payment System</ThemedText>
        </View>

        {/* Login Card */}
        <View style={styles.card}>
          <ThemedText style={styles.title}>Login</ThemedText>
          <ThemedText style={styles.description}>
            Enjoy your digital wallet and life.
          </ThemedText>

          {/* Username Input */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Username</ThemedText>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Password</ThemedText>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              placeholderTextColor="#9ca3af"
              secureTextEntry
            />
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>Enter</ThemedText>
            )}
          </TouchableOpacity>

          {/* Demo Credentials */}
          <View style={styles.demoSection}>
            <ThemedText style={styles.demoTitle}>Demo Accounts:</ThemedText>
            
            <TouchableOpacity
              style={styles.demoButton}
              onPress={() => fillDemoCredentials('agent')}
            >
              <View style={styles.demoButtonContent}>
                <View>
                  <ThemedText style={styles.demoButtonTitle}>👤 Agent</ThemedText>
                  <ThemedText style={styles.demoButtonSubtitle}>
                    Top-up cards
                  </ThemedText>
                </View>
                <ThemedText style={styles.demoButtonArrow}>→</ThemedText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.demoButton}
              onPress={() => fillDemoCredentials('sales')}
            >
              <View style={styles.demoButtonContent}>
                <View>
                  <ThemedText style={styles.demoButtonTitle}>🛒 Salesperson</ThemedText>
                  <ThemedText style={styles.demoButtonSubtitle}>
                    Process payments
                  </ThemedText>
                </View>
                <ThemedText style={styles.demoButtonArrow}>→</ThemedText>
              </View>
            </TouchableOpacity>

            <View style={styles.credentialsBox}>
              <ThemedText style={styles.credentialsText}>
                Username: <ThemedText style={styles.credentialsBold}>agent</ThemedText> or <ThemedText style={styles.credentialsBold}>sales</ThemedText>
              </ThemedText>
              <ThemedText style={styles.credentialsText}>
                Password: <ThemedText style={styles.credentialsBold}>1234</ThemedText>
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            Team ID: k2m2zI
          </ThemedText>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  logoAccent: {
    color: '#8b5cf6',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 8,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#000',
  },
  button: {
    backgroundColor: '#8b5cf6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#d1d5db',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  demoSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(209, 213, 219, 0.3)',
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    opacity: 0.8,
  },
  demoButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  demoButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  demoButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  demoButtonSubtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  demoButtonArrow: {
    fontSize: 20,
    opacity: 0.5,
  },
  credentialsBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  credentialsText: {
    fontSize: 12,
    marginBottom: 4,
  },
  credentialsBold: {
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 12,
    opacity: 0.5,
  },
});
