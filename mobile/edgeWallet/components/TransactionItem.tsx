import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Transaction } from '@/services/api';

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const isTopup = transaction.type === 'TOPUP';
  const date = new Date(transaction.timestamp);
  
  return (
    <View style={styles.item}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{isTopup ? '💰' : '🛒'}</Text>
      </View>
      
      <View style={styles.details}>
        <Text style={styles.description}>
          {transaction.description || (isTopup ? 'Top-up' : 'Payment')}
        </Text>
        {transaction.productName && (
          <Text style={styles.productName}>{transaction.productName}</Text>
        )}
        <Text style={styles.date}>
          {date.toLocaleDateString()} {date.toLocaleTimeString()}
        </Text>
        <Text style={styles.cardUid}>Card: {transaction.card_uid}</Text>
      </View>
      
      <View style={styles.amountContainer}>
        <Text style={[styles.amount, isTopup ? styles.positive : styles.negative]}>
          {isTopup ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
        </Text>
        <Text style={styles.balance}>
          Balance: ${transaction.balanceAfter.toFixed(2)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  details: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2,
  },
  cardUid: {
    fontSize: 11,
    color: '#9ca3af',
    fontFamily: 'monospace',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  positive: {
    color: '#10b981',
  },
  negative: {
    color: '#ef4444',
  },
  balance: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default TransactionItem;
