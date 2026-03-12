import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/services/api';

interface BalanceCardProps {
  card: Card;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ card }) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTitle}>EdgeWallet</Text>
          <Text style={styles.cardSubtitle}>RFID Payment Card</Text>
        </View>
        <View style={styles.chipContainer}>
          <View style={styles.chip} />
          <View style={styles.contactless}>
            <Text style={styles.contactlessIcon}>📡</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.cardMiddle}>
        <Text style={styles.cardNumber}>**** **** **** {card.uid.slice(-4)}</Text>
      </View>
      
      <View style={styles.cardFooter}>
        <View style={styles.cardInfo}>
          <Text style={styles.label}>CARD HOLDER</Text>
          <Text style={styles.value}>{card.holderName}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.label}>BALANCE</Text>
          <Text style={styles.value}>${card.balance.toFixed(2)}</Text>
        </View>
      </View>
      
      <View style={styles.brandContainer}>
        <View style={styles.mcCircles}>
          <View style={[styles.circle, styles.circleRed]} />
          <View style={[styles.circle, styles.circleYellow]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    minHeight: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  chipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    width: 40,
    height: 30,
    backgroundColor: '#FFD700',
    borderRadius: 6,
  },
  contactless: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactlessIcon: {
    fontSize: 16,
  },
  cardMiddle: {
    marginBottom: 24,
  },
  cardNumber: {
    color: '#fff',
    fontSize: 20,
    letterSpacing: 3,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardInfo: {
    flex: 1,
  },
  label: {
    color: '#94a3b8',
    fontSize: 10,
    marginBottom: 4,
    letterSpacing: 1,
  },
  value: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  brandContainer: {
    alignItems: 'flex-end',
  },
  mcCircles: {
    flexDirection: 'row',
    width: 40,
    height: 24,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    position: 'absolute',
  },
  circleRed: {
    backgroundColor: '#eb001b',
    left: 0,
  },
  circleYellow: {
    backgroundColor: '#f79e1b',
    left: 16,
    opacity: 0.9,
  },
});

export default BalanceCard;
