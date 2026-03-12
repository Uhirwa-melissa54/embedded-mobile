import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, RefreshControl, View, Text } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import BalanceCard from '@/components/BalanceCard';
import apiService, { Card, Transaction } from '@/services/api';
import mqttService, { TOPICS } from '@/services/mqtt';

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

  // Get current user
  const currentUser = (global as any).currentUser || { role: 'agent', name: 'User' };

  useEffect(() => {
    loadDashboardData();
    connectMqtt();

    return () => {
      mqttService.disconnect();
    };
  }, []);

  const connectMqtt = async () => {
    try {
      await mqttService.connect();
      setMqttConnected(true);

      // Listen for card status updates
      mqttService.subscribe(TOPICS.STATUS, async (message) => {
        console.log('Card detected:', message);
        if (message.uid) {
          try {
            const card = await apiService.getCard(message.uid);
            setActiveCard(card);
          } catch (err) {
            console.error('Failed to fetch card:', err);
          }
        }
      });

      // Listen for balance updates
      mqttService.subscribe(TOPICS.BALANCE, (message) => {
        console.log('Balance updated:', message);
        if (activeCard && message.uid === activeCard.uid) {
          setActiveCard({ ...activeCard, balance: message.balance });
        }
      });
    } catch (err) {
      console.error('MQTT connection failed:', err);
      setMqttConnected(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const [cards, transactions] = await Promise.all([
        apiService.getAllCards(),
        apiService.getTransactions(),
      ]);

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayTxns = transactions.filter(
        (t) => new Date(t.timestamp) >= today
      );

      const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
      const avgTransaction = transactions.length > 0 ? totalVolume / transactions.length : 0;

      setStats({
        totalCards: cards.length,
        todayTransactions: todayTxns.length,
        totalVolume,
        avgTransaction,
      });

      // Set most recently updated card as active
      if (cards.length > 0) {
        setActiveCard(cards[0]);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <ThemedView style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <ThemedText type="title">EdgeWallet</ThemedText>
            <ThemedText style={styles.subtitle}>RFID Payment System</ThemedText>
          </View>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>
              {currentUser.role === 'agent' ? '👤 Agent' : '🛒 Sales'}
            </Text>
          </View>
        </View>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, mqttConnected ? styles.connected : styles.disconnected]} />
          <Text style={styles.statusText}>
            {mqttConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>
      </ThemedView>

      {/* Active Card */}
      {activeCard && (
        <View style={styles.section}>
          <BalanceCard card={activeCard} />
        </View>
      )}

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <ThemedText style={styles.statLabel}>Total Cards</ThemedText>
          <ThemedText style={styles.statValue}>{stats.totalCards}</ThemedText>
        </View>
        <View style={styles.statCard}>
          <ThemedText style={styles.statLabel}>Today's Txns</ThemedText>
          <ThemedText style={styles.statValue}>{stats.todayTransactions}</ThemedText>
        </View>
        <View style={styles.statCard}>
          <ThemedText style={styles.statLabel}>Total Volume</ThemedText>
          <ThemedText style={styles.statValue}>${stats.totalVolume.toFixed(2)}</ThemedText>
        </View>
        <View style={styles.statCard}>
          <ThemedText style={styles.statLabel}>Avg. Transaction</ThemedText>
          <ThemedText style={styles.statValue}>${stats.avgTransaction.toFixed(2)}</ThemedText>
        </View>
      </View>

      {!activeCard && (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyText}>
            Scan an RFID card to begin...
          </ThemedText>
        </View>
      )}

      {/* Role-specific quick actions */}
      <View style={styles.quickActions}>
        <ThemedText style={styles.quickActionsTitle}>Quick Actions</ThemedText>
        {currentUser.role === 'agent' ? (
          <ThemedText style={styles.quickActionsText}>
            • Navigate to "Top Up" to add money to cards{'\n'}
            • Scan RFID card to auto-populate UID{'\n'}
            • Register new cards with holder names
          </ThemedText>
        ) : (
          <ThemedText style={styles.quickActionsText}>
            • Navigate to "Payment" to process sales{'\n'}
            • Browse products by category{'\n'}
            • Add items to cart and checkout
          </ThemedText>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  roleBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  connected: {
    backgroundColor: '#10b981',
  },
  disconnected: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    fontSize: 12,
    color: '#6b7280',
  },
  section: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  statCard: {
    width: '48%',
    margin: '1%',
    padding: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.5,
    textAlign: 'center',
  },
  quickActions: {
    margin: 20,
    padding: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  quickActionsText: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 22,
  },
});
