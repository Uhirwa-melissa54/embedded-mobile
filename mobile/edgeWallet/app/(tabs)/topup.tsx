import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import apiService, { Card } from '@/services/api';
import mqttService, { TOPICS } from '@/services/mqtt';

export default function TopupScreen() {
  const [uid, setUid] = useState('');
  const [holderName, setHolderName] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  useEffect(() => {
    // Listen for card scans
    const handleCardStatus = async (message: any) => {
      if (message.uid) {
        setUid(message.uid);
        try {
          const card = await apiService.getCard(message.uid);
          setActiveCard(card);
          setHolderName(card.holderName);
        } catch (err) {
          // New card
          setActiveCard(null);
          setHolderName('');
        }
      }
    };

    mqttService.subscribe(TOPICS.STATUS, handleCardStatus);

    return () => {
      mqttService.unsubscribe(TOPICS.STATUS, handleCardStatus);
    };
  }, []);

  const handleTopup = async () => {
    if (!uid) {
      Alert.alert('Error', 'Please scan a card first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!activeCard && !holderName) {
      Alert.alert('Error', 'Please enter a holder name for new cards');
      return;
    }

    setLoading(true);

    try {
      const result = await apiService.topup({
        uid,
        amount: parseFloat(amount),
        holderName: holderName || undefined,
      });

      Alert.alert('Success', `Top-up successful! New balance: $${result.card.balance.toFixed(2)}`);
      
      // Update active card
      setActiveCard(result.card);
      setAmount('');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Top-up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Top Up Card</ThemedText>
        <ThemedText style={styles.subtitle}>Add money to your RFID card</ThemedText>
      </ThemedView>

      {activeCard && (
        <View style={styles.cardInfo}>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Card UID:</ThemedText>
            <ThemedText style={styles.infoValue}>{activeCard.uid}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Holder:</ThemedText>
            <ThemedText style={styles.infoValue}>{activeCard.holderName}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Current Balance:</ThemedText>
            <ThemedText style={[styles.infoValue, styles.balance]}>
              ${activeCard.balance.toFixed(2)}
            </ThemedText>
          </View>
        </View>
      )}

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Card UID</ThemedText>
          <TextInput
            style={styles.input}
            value={uid}
            onChangeText={setUid}
            placeholder="Scan card to auto-fill"
            placeholderTextColor="#9ca3af"
            editable={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Card Holder Name</ThemedText>
          <TextInput
            style={styles.input}
            value={holderName}
            onChangeText={setHolderName}
            placeholder="Enter name for new cards"
            placeholderTextColor="#9ca3af"
            editable={!activeCard}
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Amount ($)</ThemedText>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor="#9ca3af"
            keyboardType="decimal-pad"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, (!uid || loading) && styles.buttonDisabled]}
          onPress={handleTopup}
          disabled={!uid || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.buttonText}>Confirm Top Up</ThemedText>
          )}
        </TouchableOpacity>
      </View>

      {!uid && (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyText}>
            Scan an RFID card to begin top-up
          </ThemedText>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  cardInfo: {
    margin: 20,
    padding: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  balance: {
    color: '#10b981',
    fontSize: 16,
  },
  form: {
    padding: 20,
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
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.5,
    textAlign: 'center',
  },
});
