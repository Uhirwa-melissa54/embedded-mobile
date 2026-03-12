import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Transaction } from '@/services/api';

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const isTopup = transaction.type === 'TOPUP';
  const date = new Date(transaction.timestamp);

  return (
    <View style={styles.item}>
      {/* Left accent bar */}
      <View style={[styles.accentSide, { backgroundColor: isTopup ? '#5ae8c8' : '#e8ff5a' }]} />

      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{isTopup ? '↑' : '↓'}</Text>
      </View>

      <View style={styles.details}>
        <View style={styles.topRow}>
          <Text style={styles.description} numberOfLines={1}>
            {(transaction.description || (isTopup ? 'Top-up' : 'Payment')).toUpperCase()}
          </Text>
          <View style={[styles.typeBadge, isTopup ? styles.typeBadgeTopup : styles.typeBadgePayment]}>
            <Text style={[styles.typeBadgeText, isTopup ? styles.typeBadgeTextTopup : styles.typeBadgeTextPayment]}>
              {isTopup ? 'TOPUP' : 'PAYMENT'}
            </Text>
          </View>
        </View>

        {transaction.productName && (
          <Text style={styles.productName} numberOfLines={1}>{transaction.productName}</Text>
        )}

        <View style={styles.metaRow}>
          <Text style={styles.date}>
            {date.toLocaleDateString()} · {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <Text style={styles.cardUid}>
            {transaction.card_uid.slice(-8).toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.amountContainer}>
        <Text style={[styles.amount, isTopup ? styles.positive : styles.negative]}>
          {isTopup ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
        </Text>
        <Text style={styles.balance}>
          BAL ${transaction.balanceAfter.toFixed(2)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    padding: 14,
    paddingLeft: 0,
    backgroundColor: '#0f0f0f',
    borderWidth: 1,
    borderColor: '#1a1a1a',
    marginBottom: 8,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
  },
  accentSide: {
    width: 3,
    alignSelf: 'stretch',
    marginRight: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    backgroundColor: '#161616',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#1e1e1e',
  },
  icon: {
    fontSize: 14,
    color: '#555',
    fontWeight: '700',
  },
  details: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  description: {
    fontSize: 11,
    fontWeight: '800',
    color: '#d0d0d0',
    letterSpacing: 1,
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
  },
  typeBadgeTopup: {
    borderColor: 'rgba(90,232,200,0.3)',
  },
  typeBadgePayment: {
    borderColor: 'rgba(232,255,90,0.3)',
  },
  typeBadgeText: {
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  typeBadgeTextTopup: {
    color: '#5ae8c8',
  },
  typeBadgeTextPayment: {
    color: '#e8ff5a',
  },
  productName: {
    fontSize: 10,
    color: '#444',
    letterSpacing: 0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  date: {
    fontSize: 9,
    color: '#333',
    letterSpacing: 0.5,
  },
  cardUid: {
    fontSize: 8,
    color: '#2a2a2a',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1,
  },
  amountContainer: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  positive: {
    color: '#5ae8c8',
  },
  negative: {
    color: '#ef4444',
  },
  balance: {
    fontSize: 8,
    color: '#333',
    letterSpacing: 1.5,
    fontWeight: '700',
  },
});

export default TransactionItem;
