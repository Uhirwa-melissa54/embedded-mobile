import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  RefreshControl,
  Animated,
  Dimensions,
} from 'react-native';
import TransactionItem from '@/components/TransactionItem';
import apiService, { Transaction } from '@/services/api';

const { width } = Dimensions.get('window');

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await apiService.getTransactions();
      setTransactions(data);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  // Group transactions by date
  const grouped = transactions.reduce<Record<string, Transaction[]>>((acc, txn) => {
    const date = new Date(txn.timestamp);
    const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
    if (!acc[key]) acc[key] = [];
    acc[key].push(txn);
    return acc;
  }, {});

  const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <View style={styles.root}>
      {/* BG grid */}
      <View style={styles.gridOverlay} pointerEvents="none">
        {[...Array(6)].map((_, i) => (
          <View key={i} style={[styles.gridLine, { left: (width / 6) * i }]} />
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#e8ff5a"
            colors={['#e8ff5a']}
          />
        }
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <View style={styles.logoMark} />
              <Text style={styles.logoText}>
                LEDGER<Text style={styles.logoThin}>HISTORY</Text>
              </Text>
            </View>
            <Text style={styles.tagline}>ALL TRANSACTION RECORDS</Text>
            <View style={styles.headerRule} />

            {/* Summary row */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryTile}>
                <Text style={styles.summaryLabel}>TRANSACTIONS</Text>
                <Text style={[styles.summaryValue, { color: '#e8ff5a' }]}>
                  {transactions.length}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryTile}>
                <Text style={styles.summaryLabel}>TOTAL VOLUME</Text>
                <Text style={[styles.summaryValue, { color: '#5ae8c8' }]}>
                  ${totalVolume.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryTile}>
                <Text style={styles.summaryLabel}>AVG. AMOUNT</Text>
                <Text style={[styles.summaryValue, { color: '#e8ff5a' }]}>
                  ${transactions.length > 0 ? (totalVolume / transactions.length).toFixed(2) : '0.00'}
                </Text>
              </View>
            </View>
          </View>

          {/* Transaction list */}
          <View style={styles.listSection}>
            {transactions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>▱▱▱</Text>
                <Text style={styles.emptyTitle}>NO RECORDS</Text>
                <Text style={styles.emptySubtitle}>Transactions will appear here</Text>
              </View>
            ) : (
              Object.entries(grouped).map(([date, txns]) => (
                <View key={date} style={styles.dateGroup}>
                  {/* Date header */}
                  <View style={styles.dateHeader}>
                    <Text style={styles.dateLabel}>{date}</Text>
                    <View style={styles.dateLine} />
                    <Text style={styles.dateCount}>{txns.length}</Text>
                  </View>

                  {/* Items */}
                  {txns.map((txn, index) => (
                    <View key={txn._id} style={styles.txnRow}>
                      <Text style={styles.txnIndex}>
                        {String(index + 1).padStart(2, '0')}
                      </Text>
                      <View style={styles.txnContent}>
                        <TransactionItem transaction={txn} />
                      </View>
                    </View>
                  ))}
                </View>
              ))
            )}
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
  scroll: {
    flex: 1,
  },

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
  logoThin: {
    fontWeight: '300',
  },
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
    marginBottom: 20,
  },

  // Summary
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: '#0f0f0f',
    borderWidth: 1,
    borderColor: '#1a1a1a',
    marginBottom: 28,
  },
  summaryTile: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#1a1a1a',
  },
  summaryLabel: {
    fontSize: 7,
    letterSpacing: 2,
    color: '#2a2a2a',
    fontWeight: '700',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  // List
  listSection: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  dateLabel: {
    fontSize: 8,
    letterSpacing: 2.5,
    color: '#333',
    fontWeight: '700',
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#141414',
  },
  dateCount: {
    fontSize: 8,
    color: '#222',
    fontWeight: '700',
    letterSpacing: 1,
  },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 2,
  },
  txnIndex: {
    fontSize: 9,
    color: '#222',
    fontWeight: '700',
    letterSpacing: 1,
    paddingTop: 14,
    width: 20,
  },
  txnContent: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },

  // Empty
  emptyState: {
    paddingVertical: 64,
    alignItems: 'center',
    gap: 8,
  },
  emptyIcon: {
    fontSize: 18,
    color: '#1a1a1a',
    letterSpacing: 4,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 10,
    letterSpacing: 4,
    color: '#222',
    fontWeight: '800',
  },
  emptySubtitle: {
    fontSize: 10,
    color: '#1e1e1e',
    letterSpacing: 1,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    borderTopWidth: 1,
    borderTopColor: '#111',
    marginTop: 8,
  },
  footerText: {
    fontSize: 9,
    color: '#1e1e1e',
    letterSpacing: 3,
    fontWeight: '600',
  },
});