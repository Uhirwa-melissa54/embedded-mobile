import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import apiService, { Card } from '@/services/api';
import mqttService, { TOPICS } from '@/services/mqtt';

const { width } = Dimensions.get('window');

const QUICK_AMOUNTS = [10, 25, 50, 100];

export default function TopupScreen() {
  const [uid, setUid] = useState('');
  const [holderName, setHolderName] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [nameFocused, setNameFocused] = useState(false);
  const [amountFocused, setAmountFocused] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    const handleCardStatus = async (message: any) => {
      if (message.uid) {
        setUid(message.uid);
        try {
          const card = await apiService.getCard(message.uid);
          setActiveCard(card);
          setHolderName(card.holderName);
          Animated.spring(cardAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 80,
            friction: 12,
          }).start();
        } catch {
          setActiveCard(null);
          setHolderName('');
        }
      }
    };

    mqttService.subscribe(TOPICS.STATUS, handleCardStatus);
    return () => mqttService.unsubscribe(TOPICS.STATUS, handleCardStatus);
  }, []);

  const handleTopup = async () => {
    if (!uid) { Alert.alert('No Card', 'Scan a card first'); return; }
    if (!amount || parseFloat(amount) <= 0) { Alert.alert('Invalid Amount', 'Enter a valid amount'); return; }
    if (!activeCard && !holderName) { Alert.alert('Missing Name', 'Enter a holder name for new cards'); return; }

    setLoading(true);
    try {
      const result = await apiService.topup({
        uid,
        amount: parseFloat(amount),
        holderName: holderName || undefined,
      });
      Alert.alert('Top-Up Complete', `New balance: $${result.card.balance.toFixed(2)}`);
      setActiveCard(result.card);
      setAmount('');
    } catch (err: any) {
      Alert.alert('Top-Up Failed', err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const cardScale = cardAnim.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] });
  const projected = activeCard ? activeCard.balance + (parseFloat(amount) || 0) : null;

  return (
    <View style={styles.root}>
      {/* BG grid */}
      <View style={styles.gridOverlay} pointerEvents="none">
        {[...Array(6)].map((_, i) => (
          <View key={i} style={[styles.gridLine, { left: (width / 6) * i }]} />
        ))}
      </View>

      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        <Animated.View style={{ opacity: fadeAnim }}>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <View style={styles.logoMark} />
              <Text style={styles.logoText}>TOP<Text style={styles.logoThin}>UP</Text></Text>
            </View>
            <Text style={styles.tagline}>ADD FUNDS TO RFID CARD</Text>
            <View style={styles.headerRule} />
          </View>

          {/* Card panel */}
          {activeCard ? (
            <Animated.View style={[styles.cardPanel, { transform: [{ scale: cardScale }] }]}>
              <View style={styles.cardPanelTop}>
                <View style={styles.cardPanelLeft}>
                  <Text style={styles.cardPanelLabel}>CARD UID</Text>
                  <Text style={styles.cardPanelUid}>{activeCard.uid}</Text>
                </View>
                <View style={styles.cardStatusBadge}>
                  <View style={styles.cardStatusDot} />
                  <Text style={styles.cardStatusText}>ACTIVE</Text>
                </View>
              </View>

              <View style={styles.cardPanelDivider} />

              <View style={styles.cardPanelBottom}>
                <View>
                  <Text style={styles.cardPanelLabel}>HOLDER</Text>
                  <Text style={styles.cardPanelHolder}>{activeCard.holderName.toUpperCase()}</Text>
                </View>
                <View style={styles.balanceCol}>
                  <Text style={styles.cardPanelLabel}>BALANCE</Text>
                  <Text style={styles.cardPanelBalance}>${activeCard.balance.toFixed(2)}</Text>
                  {parseFloat(amount) > 0 && (
                    <Text style={styles.cardPanelProjected}>→ ${projected?.toFixed(2)}</Text>
                  )}
                </View>
              </View>
            </Animated.View>
          ) : (
            <View style={styles.noCard}>
              <Text style={styles.noCardIcon}>▱▱▱</Text>
              <Text style={styles.noCardTitle}>AWAITING CARD SCAN</Text>
              <Text style={styles.noCardSub}>Hold RFID card near reader</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            {/* UID (read-only) */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>CARD UID</Text>
              <View style={styles.readonlyField}>
                <Text style={styles.readonlyValue} numberOfLines={1}>
                  {uid || '—'}
                </Text>
                <View style={styles.readonlyBadge}>
                  <Text style={styles.readonlyBadgeText}>AUTO</Text>
                </View>
              </View>
              <View style={styles.fieldUnderline} />
            </View>

            {/* Holder name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>CARD HOLDER</Text>
              <TextInput
                style={[styles.fieldInput, nameFocused && styles.fieldInputFocused, activeCard && styles.fieldInputLocked]}
                value={holderName}
                onChangeText={setHolderName}
                placeholder={activeCard ? activeCard.holderName : '—'}
                placeholderTextColor="#2a2a2a"
                editable={!activeCard}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
                autoCapitalize="words"
              />
              <View style={[styles.fieldUnderline, nameFocused && styles.fieldUnderlineFocused]} />
              {activeCard && <Text style={styles.lockedHint}>LOCKED · EXISTING CARD</Text>}
            </View>

            {/* Amount */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>AMOUNT (USD)</Text>
              <View style={styles.amountRow}>
                <Text style={styles.amountPrefix}>$</Text>
                <TextInput
                  style={[styles.amountInput, amountFocused && styles.fieldInputFocused]}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor="#2a2a2a"
                  keyboardType="decimal-pad"
                  onFocus={() => setAmountFocused(true)}
                  onBlur={() => setAmountFocused(false)}
                />
              </View>
              <View style={[styles.fieldUnderline, amountFocused && styles.fieldUnderlineFocused]} />
            </View>

            {/* Quick amounts */}
            <View style={styles.quickRow}>
              {QUICK_AMOUNTS.map(q => (
                <TouchableOpacity
                  key={q}
                  style={[styles.quickBtn, amount === String(q) && styles.quickBtnActive]}
                  onPress={() => setAmount(String(q))}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.quickBtnText, amount === String(q) && styles.quickBtnTextActive]}>
                    +${q}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Confirm button */}
            <TouchableOpacity
              style={[styles.confirmBtn, (!uid || loading) && styles.confirmBtnDisabled]}
              onPress={handleTopup}
              disabled={!uid || loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#0a0a0a" size="small" />
              ) : (
                <Text style={[styles.confirmBtnText, (!uid || loading) && styles.confirmBtnTextDisabled]}>
                  CONFIRM TOP-UP →
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>TEAM ID · k2m2zI</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  scroll: { flex: 1 },

  // Header
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 0,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  logoMark: {
    width: 8,
    height: 8,
    backgroundColor: '#e8ff5a',
    transform: [{ rotate: '45deg' }],
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 4,
    color: '#f0f0f0',
  },
  logoThin: { fontWeight: '300' },
  tagline: {
    fontSize: 9,
    letterSpacing: 3,
    color: '#2a2a2a',
    fontWeight: '700',
    marginBottom: 16,
  },
  headerRule: {
    height: 1,
    backgroundColor: '#161616',
  },

  // Card panel
  cardPanel: {
    marginHorizontal: 24,
    marginTop: 24,
    backgroundColor: '#0f0f0f',
    borderWidth: 1,
    borderColor: '#1e1e1e',
    borderTopWidth: 2,
    borderTopColor: '#e8ff5a',
    padding: 18,
  },
  cardPanelTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  cardPanelLeft: {},
  cardPanelLabel: {
    fontSize: 8,
    letterSpacing: 2.5,
    color: '#2a2a2a',
    fontWeight: '700',
    marginBottom: 4,
  },
  cardPanelUid: {
    fontSize: 12,
    color: '#444',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1,
  },
  cardStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(90,232,200,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cardStatusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#5ae8c8',
  },
  cardStatusText: {
    fontSize: 8,
    letterSpacing: 2,
    color: '#5ae8c8',
    fontWeight: '700',
  },
  cardPanelDivider: {
    height: 1,
    backgroundColor: '#161616',
    marginBottom: 14,
  },
  cardPanelBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardPanelHolder: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#e0e0e0',
  },
  balanceCol: { alignItems: 'flex-end' },
  cardPanelBalance: {
    fontSize: 22,
    fontWeight: '800',
    color: '#e8ff5a',
    letterSpacing: -0.5,
  },
  cardPanelProjected: {
    fontSize: 11,
    color: '#5ae8c8',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 2,
  },

  // No card
  noCard: {
    marginHorizontal: 24,
    marginTop: 24,
    paddingVertical: 28,
    borderWidth: 1,
    borderColor: '#161616',
    borderStyle: 'dashed',
    alignItems: 'center',
    gap: 6,
  },
  noCardIcon: {
    fontSize: 16,
    color: '#1e1e1e',
    letterSpacing: 4,
    marginBottom: 4,
  },
  noCardTitle: {
    fontSize: 9,
    letterSpacing: 3,
    color: '#222',
    fontWeight: '800',
  },
  noCardSub: {
    fontSize: 9,
    color: '#1e1e1e',
    letterSpacing: 1,
  },

  // Form
  form: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  fieldGroup: {
    marginBottom: 30,
  },
  fieldLabel: {
    fontSize: 8,
    letterSpacing: 3,
    color: '#333',
    fontWeight: '700',
    marginBottom: 10,
  },
  fieldInput: {
    fontSize: 20,
    color: '#f0f0f0',
    paddingBottom: 8,
    backgroundColor: 'transparent',
    letterSpacing: 0.5,
  },
  fieldInputFocused: {
    color: '#ffffff',
  },
  fieldInputLocked: {
    color: '#3a3a3a',
  },
  readonlyField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  readonlyValue: {
    fontSize: 14,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1,
    flex: 1,
  },
  readonlyBadge: {
    borderWidth: 1,
    borderColor: '#1e1e1e',
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  readonlyBadgeText: {
    fontSize: 7,
    letterSpacing: 2,
    color: '#2a2a2a',
    fontWeight: '700',
  },
  fieldUnderline: {
    height: 1,
    backgroundColor: '#1a1a1a',
  },
  fieldUnderlineFocused: {
    backgroundColor: '#e8ff5a',
  },
  lockedHint: {
    fontSize: 7,
    letterSpacing: 2,
    color: '#222',
    fontWeight: '700',
    marginTop: 6,
  },

  // Amount
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    paddingBottom: 8,
  },
  amountPrefix: {
    fontSize: 20,
    color: '#333',
    fontWeight: '300',
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    color: '#f0f0f0',
    fontWeight: '800',
    letterSpacing: -0.5,
    backgroundColor: 'transparent',
  },

  // Quick amounts
  quickRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
    marginTop: 4,
  },
  quickBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e1e1e',
    backgroundColor: 'transparent',
  },
  quickBtnActive: {
    backgroundColor: '#e8ff5a',
    borderColor: '#e8ff5a',
  },
  quickBtnText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#333',
  },
  quickBtnTextActive: {
    color: '#0a0a0a',
  },

  // Confirm button
  confirmBtn: {
    backgroundColor: '#e8ff5a',
    paddingVertical: 18,
    alignItems: 'center',
  },
  confirmBtnDisabled: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  confirmBtnText: {
    color: '#0a0a0a',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3,
  },
  confirmBtnTextDisabled: {
    color: '#222',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#111',
  },
  footerText: {
    fontSize: 9,
    color: '#1e1e1e',
    letterSpacing: 3,
    fontWeight: '600',
  },
});