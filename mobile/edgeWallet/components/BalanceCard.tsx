import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Card } from '@/services/api';

interface BalanceCardProps {
  card: Card;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ card }) => {
  return (
    <View style={styles.card}>
      {/* Accent top bar */}
      <View style={styles.accentBar} />

      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTitle}>EDGE<Text style={styles.cardTitleThin}>WALLET</Text></Text>
          <Text style={styles.cardSubtitle}>RFID PAYMENT CARD</Text>
        </View>
        <View style={styles.chipContainer}>
          <View style={styles.chip}>
            <View style={styles.chipLines}>
              <View style={styles.chipLine} />
              <View style={styles.chipLine} />
              <View style={styles.chipLine} />
            </View>
          </View>
          <Text style={styles.contactlessIcon}>📡</Text>
        </View>
      </View>

      <View style={styles.cardMiddle}>
        <Text style={styles.cardNumberLabel}>CARD NUMBER</Text>
        <Text style={styles.cardNumber}>
          ****  ****  ****  {card.uid.slice(-4)}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardFooter}>
        <View style={styles.cardInfo}>
          <Text style={styles.label}>CARD HOLDER</Text>
          <Text style={styles.value}>{card.holderName.toUpperCase()}</Text>
        </View>
        <View style={[styles.cardInfo, { alignItems: 'flex-end' }]}>
          <Text style={styles.label}>BALANCE</Text>
          <Text style={styles.balanceValue}>${card.balance.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.brandContainer}>
        <View style={styles.mcCircles}>
          <View style={[styles.circle, styles.circleFirst]} />
          <View style={[styles.circle, styles.circleSecond]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0f0f0f',
    borderWidth: 1,
    borderColor: '#1a1a1a',
    padding: 20,
    minHeight: 220,
    position: 'relative',
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#e8ff5a',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    marginTop: 4,
  },
  cardTitle: {
    color: '#f0f0f0',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 3,
  },
  cardTitleThin: {
    fontWeight: '300',
  },
  cardSubtitle: {
    color: '#333',
    fontSize: 8,
    letterSpacing: 2,
    fontWeight: '700',
    marginTop: 4,
  },
  chipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chip: {
    width: 36,
    height: 26,
    backgroundColor: '#e8ff5a',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  chipLines: {
    width: '100%',
    paddingHorizontal: 6,
    gap: 3,
  },
  chipLine: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  contactlessIcon: {
    fontSize: 14,
  },
  cardMiddle: {
    marginBottom: 20,
  },
  cardNumberLabel: {
    fontSize: 7,
    letterSpacing: 2,
    color: '#2a2a2a',
    fontWeight: '700',
    marginBottom: 6,
  },
  cardNumber: {
    color: '#555',
    fontSize: 18,
    letterSpacing: 3,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  divider: {
    height: 1,
    backgroundColor: '#1a1a1a',
    marginBottom: 16,
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
    color: '#333',
    fontSize: 8,
    marginBottom: 6,
    letterSpacing: 2,
    fontWeight: '700',
  },
  value: {
    color: '#d0d0d0',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  balanceValue: {
    color: '#e8ff5a',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandContainer: {
    alignItems: 'flex-end',
  },
  mcCircles: {
    flexDirection: 'row',
    width: 36,
    height: 22,
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    position: 'absolute',
  },
  circleFirst: {
    backgroundColor: '#e8ff5a',
    left: 0,
    opacity: 0.7,
  },
  circleSecond: {
    backgroundColor: '#5ae8c8',
    left: 14,
    opacity: 0.7,
  },
});

export default BalanceCard;
