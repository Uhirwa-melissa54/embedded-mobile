import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const { width } = Dimensions.get('window');

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
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const user = Object.values(DEMO_USERS).find(
        (u) => u.username === username && u.password === password
      );
      if (user) {
        global.currentUser = user;
        Alert.alert(
          'Access Granted',
          `Welcome, ${user.name}`,
          [
            {
              text: 'Continue',
              onPress: () => {
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
        Alert.alert('Access Denied', 'Invalid credentials');
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
      <ThemedView style={styles.root}>
        {/* Background grid lines */}
        <View style={styles.gridOverlay} pointerEvents="none">
          {[...Array(6)].map((_, i) => (
            <View key={i} style={[styles.gridLine, { left: (width / 6) * i }]} />
          ))}
        </View>

        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <View style={styles.logoMark} />
              <ThemedText style={styles.logoText}>
                EDGE<ThemedText style={styles.logoThin}>WALLET</ThemedText>
              </ThemedText>
            </View>
            <View style={styles.headerDivider} />
            <ThemedText style={styles.tagline}>RFID PAYMENT INFRASTRUCTURE</ThemedText>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <ThemedText style={styles.formLabel}>SIGN IN</ThemedText>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.fieldLabel}>USERNAME</ThemedText>
              <TextInput
                style={[styles.input, usernameFocused && styles.inputFocused]}
                value={username}
                onChangeText={setUsername}
                placeholder="—"
                placeholderTextColor="#3a3a3a"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setUsernameFocused(true)}
                onBlur={() => setUsernameFocused(false)}
              />
              <View style={[styles.inputUnderline, usernameFocused && styles.inputUnderlineFocused]} />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.fieldLabel}>PASSWORD</ThemedText>
              <TextInput
                style={[styles.input, passwordFocused && styles.inputFocused]}
                value={password}
                onChangeText={setPassword}
                placeholder="—"
                placeholderTextColor="#3a3a3a"
                secureTextEntry
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <View style={[styles.inputUnderline, passwordFocused && styles.inputUnderlineFocused]} />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonLoading]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#0a0a0a" size="small" />
              ) : (
                <ThemedText style={styles.buttonText}>AUTHENTICATE →</ThemedText>
              )}
            </TouchableOpacity>
          </View>

          {/* Demo Section */}
          <View style={styles.demoSection}>
            <View style={styles.demoHeader}>
              <View style={styles.demoDivider} />
              <View style={styles.demoDivider} />
            </View>

            <View style={styles.demoRow}>
              <TouchableOpacity
                style={styles.demoCard}
                onPress={() => fillDemoCredentials('agent')}
                activeOpacity={0.75}
              >
                <ThemedText style={styles.demoRole}>AGENT</ThemedText>
                <ThemedText style={styles.demoDesc}>Top-up cards</ThemedText>
                <View style={styles.demoIndicator} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.demoCard}
                onPress={() => fillDemoCredentials('sales')}
                activeOpacity={0.75}
              >
                <ThemedText style={styles.demoRole}>SALES</ThemedText>
                <ThemedText style={styles.demoDesc}>Process payments</ThemedText>
                <View style={[styles.demoIndicator, styles.demoIndicatorAlt]} />
              </TouchableOpacity>
            </View>

            
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>TEAM ID · k2m2zI</ThemedText>
          </View>
        </Animated.View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  root: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  gridLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },

  // Header
  header: {
    marginBottom: 48,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  logoMark: {
    width: 10,
    height: 10,
    backgroundColor: '#e8ff5a',
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 4,
    color: '#f0f0f0',
  },
  logoThin: {
    fontWeight: '300',
    color: '#f0f0f0',
  },
  headerDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 10,
    letterSpacing: 3,
    color: '#444',
    fontWeight: '500',
  },

  // Form
  form: {
    flex: 1,
    justifyContent: 'center',
  },
  formLabel: {
    fontSize: 11,
    letterSpacing: 4,
    color: '#555',
    fontWeight: '600',
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 32,
  },
  fieldLabel: {
    fontSize: 9,
    letterSpacing: 3,
    color: '#444',
    fontWeight: '700',
    marginBottom: 12,
  },
  input: {
    fontSize: 20,
    color: '#f0f0f0',
    paddingBottom: 8,
    backgroundColor: 'transparent',
    letterSpacing: 1,
  },
  inputFocused: {
    color: '#ffffff',
  },
  inputUnderline: {
    height: 1,
    backgroundColor: '#222',
  },
  inputUnderlineFocused: {
    backgroundColor: '#e8ff5a',
  },
  button: {
    backgroundColor: '#e8ff5a',
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonLoading: {
    backgroundColor: '#c8df3a',
  },
  buttonText: {
    color: '#0a0a0a',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 3,
  },

  // Demo Section
  demoSection: {
    marginTop: 48,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  demoDivider: {
    flex: 1,
    height: 1,
    backgroundColor: '#1e1e1e',
  },
  demoLabel: {
    fontSize: 9,
    letterSpacing: 3,
    color: '#333',
    fontWeight: '700',
  },
  demoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  demoCard: {
    flex: 1,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#1e1e1e',
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  demoRole: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#e0e0e0',
    marginBottom: 4,
  },
  demoDesc: {
    fontSize: 10,
    color: '#3a3a3a',
    letterSpacing: 0.5,
  },
  demoIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 3,
    height: '100%',
    backgroundColor: '#e8ff5a',
  },
  demoIndicatorAlt: {
    backgroundColor: '#5ae8c8',
  },
  credentialsPill: {
    marginTop: 12,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#1e1e1e',
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'center',
  },
  credText: {
    fontSize: 11,
    color: '#3a3a3a',
    letterSpacing: 1,
  },
  credMono: {
    color: '#e8ff5a',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#111',
  },
  footerText: {
    fontSize: 9,
    color: '#282828',
    letterSpacing: 3,
    fontWeight: '600',
  },
});