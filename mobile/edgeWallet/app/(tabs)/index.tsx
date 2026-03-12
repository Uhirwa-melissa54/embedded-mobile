import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  ScrollView,
  RefreshControl,
  View,
  Text,
  Animated,
  Dimensions,
} from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import BalanceCard from '@/components/BalanceCard';
import apiService, { Card, Transaction } from '@/services/api';
import mqttService, { TOPICS } from '@/services/mqtt';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [stats, setStats] = useState({
    totalCards: 0,
    todayTransactions: 0,
    totalVolume: 0,
    avgTransaction: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [mqttConnected, setMqttConnected] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const currentUser = (global as any).currentUser || { role: 'agent', name: 'User' };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    loadDashboardData();
    connectMqtt();

    return () => {
      mqttService.disconnect();
    };
  }, []);

  useEffect(() => {
    if (mqttConnected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.6, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [mqttConnected]);

  const connectMqtt = async () => {
    try {
      await mqttService.connect();
      setMqttConnected(true);
      mqttService.subscribe(TOPICS.STATUS, async (message) => {
        if (message.uid) {
          try {
            const card = await apiService.getCard(message.uid);
            setActiveCard(card);
          } catch (err) {
            console.error('Failed to fetch card:', err);
          }
        }
      });
      mqttService.subscribe(TOPICS.BALANCE, (message) => {
        if (activeCard && message.uid === activeCard.uid) {
          setActiveCard({ ...activeCard, balance: message.balance });
        }
      });
    } catch (err) {
      setMqttConnected(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const [cards, transactions] = await Promise.all([
        apiService.getAllCards(),
        apiService.getTransactions(),
      ]);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTxns = transactions.filter((t) => new Date(t.timestamp) >= today);
      const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
      const avgTransaction = transactions.length > 0 ? totalVolume / transactions.length : 0;
      setStats({
        totalCards: cards.length,
        todayTransactions: todayTxns.length,
        totalVolume,
        avgTransaction,
      });
      if (cards.length > 0) setActiveCard(cards[0]);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const isAgent = currentUser.role === 'agent';

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#e8ff5a"
          colors={['#e8ff5a']}
        />
      }
    >
      {/* Background grid */}
      <View style={styles.gridOverlay} pointerEvents="none">
        {[...Array(6)].map((_, i) => (
          <View key={i} style={[styles.gridLine, { left: (width / 6) * i }]} />
        ))}
      </View>

      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <View style={styles.logoRow}>
                <View style={styles.logoMark} />
                <Text style={styles.logoText}>
                  EDGE<Text style={styles.logoThin}>WALLET</Text>
                </Text>
              </View>
              <Text style={styles.tagline}>RFID PAYMENT INFRASTRUCTURE</Text>
            </View>

            <View style={[styles.rolePill, isAgent ? styles.rolePillAgent : styles.rolePillSales]}>
              <Text style={[styles.roleText, isAgent ? styles.roleTextAgent : styles.roleTextSales]}>
                {isAgent ? 'AGENT' : 'SALES'}
              </Text>
            </View>
          </View>

          {/* Connection status */}
          <View style={styles.statusRow}>
            <View style={styles.statusDotWrapper}>
              <Animated.View
                style={[
                  styles.statusDotPulse,
                  mqttConnected ? styles.dotPulseOn : styles.dotPulseOff,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              />
              <View style={[styles.statusDot, mqttConnected ? styles.dotOn : styles.dotOff]} />
            </View>
            <Text style={styles.statusText}>
              {mqttConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </Text>
          </View>

          <View style={styles.headerRule} />
        </View>

        {/* Active Card */}
        {activeCard ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ACTIVE CARD</Text>
            <BalanceCard card={activeCard} />
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>⬡</Text>
            </View>
            <Text style={styles.emptyTitle}>AWAITING CARD</Text>
            <Text style={styles.emptySubtitle}>Scan an RFID card to begin</Text>
          </View>
        )}

        {/* Stats Grid */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionLabel}>METRICS</Text>
          <View style={styles.statsGrid}>
            <StatTile label="TOTAL CARDS" value={String(stats.totalCards)} accent="#e8ff5a" />
            <StatTile label="TODAY'S TXN" value={String(stats.todayTransactions)} accent="#5ae8c8" />
            <StatTile label="TOTAL VOL." value={`$${stats.totalVolume.toFixed(0)}`} accent="#e8ff5a" />
            <StatTile label="AVG. TXN" value={`$${stats.avgTransaction.toFixed(0)}`} accent="#5ae8c8" />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
          <View style={styles.actionsList}>
            {(isAgent
              ? [
                  ['01', 'Navigate to Top Up to add funds to cards'],
                  ['02', 'Scan RFID card to auto-populate UID'],
                  ['03', 'Register new cards with holder names'],
                ]
              : [
                  ['01', 'Navigate to Payment to process sales'],
                  ['02', 'Browse products by category'],
                  ['03', 'Add items to cart and checkout'],
                ]
            ).map(([num, text]) => (
              <View key={num} style={styles.actionRow}>
                <Text style={[styles.actionNum, isAgent ? styles.accentYellow : styles.accentTeal]}>
                  {num}
                </Text>
                <View style={styles.actionRuleDot} />
                <Text style={styles.actionText}>{text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>TEAM ID · k2m2zI</Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

function StatTile({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <View style={styles.statTile}>
      <View style={[styles.statAccentBar, { backgroundColor: accent }]} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color: accent }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  gridLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },

  // Header
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
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
  logoThin: {
    fontWeight: '300',
  },
  tagline: {
    fontSize: 9,
    letterSpacing: 3,
    color: '#333',
    fontWeight: '600',
  },
  rolePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  rolePillAgent: {
    borderColor: '#e8ff5a',
    backgroundColor: 'rgba(232,255,90,0.06)',
  },
  rolePillSales: {
    borderColor: '#5ae8c8',
    backgroundColor: 'rgba(90,232,200,0.06)',
  },
  roleText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 3,
  },
  roleTextAgent: { color: '#e8ff5a' },
  roleTextSales: { color: '#5ae8c8' },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  statusDotWrapper: {
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDotPulse: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    opacity: 0.3,
  },
  dotPulseOn: { backgroundColor: '#10b981' },
  dotPulseOff: { backgroundColor: '#ef4444' },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotOn: { backgroundColor: '#10b981' },
  dotOff: { backgroundColor: '#ef4444' },
  statusText: {
    fontSize: 9,
    letterSpacing: 3,
    color: '#444',
    fontWeight: '700',
  },
  headerRule: {
    height: 1,
    backgroundColor: '#161616',
  },

  // Sections
  section: {
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  sectionLabel: {
    fontSize: 9,
    letterSpacing: 3,
    color: '#333',
    fontWeight: '700',
    marginBottom: 14,
  },

  // Empty state
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyIconText: {
    fontSize: 32,
    color: '#1e1e1e',
  },
  emptyTitle: {
    fontSize: 11,
    letterSpacing: 4,
    color: '#2a2a2a',
    fontWeight: '800',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 11,
    color: '#2a2a2a',
    letterSpacing: 1,
  },

  // Stats
  statsSection: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statTile: {
    width: '47.5%',
    backgroundColor: '#0f0f0f',
    borderWidth: 1,
    borderColor: '#1a1a1a',
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  statAccentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  statLabel: {
    fontSize: 8,
    letterSpacing: 2.5,
    color: '#333',
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 4,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  // Actions
  actionsSection: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  actionsList: {
    gap: 0,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
    gap: 12,
  },
  actionNum: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    width: 20,
  },
  accentYellow: { color: '#e8ff5a' },
  accentTeal: { color: '#5ae8c8' },
  actionRuleDot: {
    width: 3,
    height: 3,
    backgroundColor: '#222',
    borderRadius: 2,
  },
  actionText: {
    fontSize: 12,
    color: '#3a3a3a',
    flex: 1,
    letterSpacing: 0.3,
    lineHeight: 18,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    marginTop: 8,
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