import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import ProductCard from '@/components/ProductCard';
import apiService, { Card, Product, Service } from '@/services/api';
import mqttService, { TOPICS } from '@/services/mqtt';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'product' | 'service';
  emoji: string;
}

export default function PaymentScreen() {
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadProducts();
    
    // Listen for card scans
    const handleCardStatus = async (message: any) => {
      if (message.uid) {
        try {
          const card = await apiService.getCard(message.uid);
          setActiveCard(card);
        } catch (err) {
          Alert.alert('Error', 'Card not found');
        }
      }
    };

    mqttService.subscribe(TOPICS.STATUS, handleCardStatus);

    return () => {
      mqttService.unsubscribe(TOPICS.STATUS, handleCardStatus);
    };
  }, []);

  const loadProducts = async () => {
    try {
      const [productsData, servicesData] = await Promise.all([
        apiService.getProducts(),
        apiService.getServices(),
      ]);
      setProducts(productsData);
      setServices(servicesData);
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  const addToCart = (item: Product | Service, type: 'product' | 'service') => {
    const existingItem = cart.find(i => i.id === item._id);
    
    if (existingItem) {
      setCart(cart.map(i => 
        i.id === item._id 
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
    } else {
      setCart([...cart, {
        id: item._id,
        name: item.name,
        price: item.price,
        quantity: 1,
        type,
        emoji: item.emoji,
      }]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handlePayment = async () => {
    if (!activeCard) {
      Alert.alert('Error', 'Please scan a card first');
      return;
    }

    if (cart.length === 0) {
      Alert.alert('Error', 'Cart is empty');
      return;
    }

    const totalAmount = getTotalAmount();
    
    if (activeCard.balance < totalAmount) {
      Alert.alert('Insufficient Balance', `Your balance ($${activeCard.balance.toFixed(2)}) is less than the total amount ($${totalAmount.toFixed(2)})`);
      return;
    }

    setLoading(true);

    try {
      // Process each item in cart
      for (const item of cart) {
        await apiService.pay({
          card_uid: activeCard.uid,
          product_id: item.type === 'product' ? item.id : undefined,
          service_id: item.type === 'service' ? item.id : undefined,
          quantity: item.quantity,
        });
      }

      // Refresh card balance
      const updatedCard = await apiService.getCard(activeCard.uid);
      setActiveCard(updatedCard);
      
      Alert.alert('Success', `Payment successful! New balance: $${updatedCard.balance.toFixed(2)}`);
      setCart([]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set([...products.map(p => p.category), ...services.map(s => s.category)])];
  
  const filteredItems = selectedCategory === 'all'
    ? [...products.map(p => ({ ...p, type: 'product' as const })), ...services.map(s => ({ ...s, type: 'service' as const }))]
    : [
        ...products.filter(p => p.category === selectedCategory).map(p => ({ ...p, type: 'product' as const })),
        ...services.filter(s => s.category === selectedCategory).map(s => ({ ...s, type: 'service' as const }))
      ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.mainContent}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Marketplace</ThemedText>
          <ThemedText style={styles.subtitle}>Select products to purchase</ThemedText>
        </ThemedView>

        {activeCard && (
          <View style={styles.cardInfo}>
            <View style={styles.cardDot} />
            <View>
              <ThemedText style={styles.cardText}>{activeCard.holderName}</ThemedText>
              <ThemedText style={styles.cardBalance}>Balance: ${activeCard.balance.toFixed(2)}</ThemedText>
            </View>
          </View>
        )}

        {/* Category Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryTabs}>
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[styles.categoryTab, selectedCategory === category && styles.categoryTabActive]}
              onPress={() => setSelectedCategory(category)}
            >
              <ThemedText style={[styles.categoryTabText, selectedCategory === category && styles.categoryTabTextActive]}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Products Grid */}
        <View style={styles.productsGrid}>
          {filteredItems.map(item => (
            <ProductCard
              key={item._id}
              product={item}
              onAdd={() => addToCart(item, item.type)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Cart Section */}
      <View style={styles.cartSection}>
        <View style={styles.cartHeader}>
          <ThemedText style={styles.cartTitle}>Cart</ThemedText>
          <View style={styles.cartBadge}>
            <ThemedText style={styles.cartBadgeText}>{cart.length}</ThemedText>
          </View>
        </View>

        {cart.length === 0 ? (
          <View style={styles.cartEmpty}>
            <ThemedText style={styles.cartEmptyText}>🛒</ThemedText>
            <ThemedText style={styles.cartEmptySubtext}>Add products to cart</ThemedText>
          </View>
        ) : (
          <>
            <ScrollView style={styles.cartItems}>
              {cart.map(item => (
                <View key={item.id} style={styles.cartItem}>
                  <View style={styles.cartItemInfo}>
                    <ThemedText style={styles.cartItemEmoji}>{item.emoji}</ThemedText>
                    <View style={styles.cartItemDetails}>
                      <ThemedText style={styles.cartItemName}>{item.name}</ThemedText>
                      <ThemedText style={styles.cartItemPrice}>${item.price.toFixed(2)}</ThemedText>
                    </View>
                  </View>
                  <View style={styles.cartItemActions}>
                    <TouchableOpacity onPress={() => updateQuantity(item.id, -1)} style={styles.quantityBtn}>
                      <ThemedText>-</ThemedText>
                    </TouchableOpacity>
                    <ThemedText style={styles.quantity}>{item.quantity}</ThemedText>
                    <TouchableOpacity onPress={() => updateQuantity(item.id, 1)} style={styles.quantityBtn}>
                      <ThemedText>+</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeBtn}>
                      <ThemedText style={styles.removeBtnText}>×</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.cartFooter}>
              <View style={styles.cartTotal}>
                <ThemedText style={styles.cartTotalLabel}>Total</ThemedText>
                <ThemedText style={styles.cartTotalValue}>${getTotalAmount().toFixed(2)}</ThemedText>
              </View>
              <TouchableOpacity
                style={[styles.payButton, (!activeCard || loading) && styles.payButtonDisabled]}
                onPress={handlePayment}
                disabled={!activeCard || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText style={styles.payButtonText}>Pay Now</ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  mainContent: {
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
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    padding: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
  },
  cardDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 12,
  },
  cardText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardBalance: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  categoryTabs: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  categoryTabActive: {
    backgroundColor: '#8b5cf6',
  },
  categoryTabText: {
    fontSize: 14,
    color: '#6b7280',
  },
  categoryTabTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  productsGrid: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cartSection: {
    width: 300,
    borderLeftWidth: 1,
    borderLeftColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  cartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  cartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  cartBadge: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cartEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  cartEmptyText: {
    fontSize: 48,
    marginBottom: 8,
  },
  cartEmptySubtext: {
    fontSize: 14,
    opacity: 0.5,
  },
  cartItems: {
    flex: 1,
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  cartItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cartItemEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  cartItemDetails: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '500',
  },
  cartItemPrice: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  cartItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    marginHorizontal: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  removeBtn: {
    marginLeft: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtnText: {
    color: '#ef4444',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cartFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cartTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cartTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  cartTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  payButton: {
    backgroundColor: '#8b5cf6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
