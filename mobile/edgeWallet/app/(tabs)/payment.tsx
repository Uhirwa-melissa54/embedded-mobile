import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import ProductCard from '@/components/ProductCard';
import apiService, { Card, Product, Service } from '@/services/api';
import mqttService, { TOPICS } from '@/services/mqtt';

const { width } = Dimensions.get('window');

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

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cartSlide = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    loadProducts();

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
    return () => mqttService.unsubscribe(TOPICS.STATUS, handleCardStatus);
  }, []);

  useEffect(() => {
    Animated.spring(cartSlide, {
      toValue: cart.length > 0 ? 0 : 300,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  }, [cart.length > 0]);

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
    const existing = cart.find(i => i.id === item._id);
    if (existing) {
      setCart(cart.map(i => i.id === item._id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { id: item._id, name: item.name, price: item.price, quantity: 1, type, emoji: item.emoji }]);
    }
  };

  const removeFromCart = (id: string) => setCart(cart.filter(i => i.id !== id));

  const updateQuantity = (id: string, delta: number) => {
    setCart(
      cart
        .map(item => item.id === id ? { ...item, quantity: item.quantity + delta } : item)
        .filter(item => item.quantity > 0)
    );
  };

  const getTotalAmount = () => cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const getTotalItems = () => cart.reduce((sum, i) => sum + i.quantity, 0);

  const handlePayment = async () => {
    if (!activeCard) { Alert.alert('No Card', 'Please scan a card first'); return; }
    if (cart.length === 0) { Alert.alert('Empty Cart', 'Add items before paying'); return; }

    const total = getTotalAmount();
    if (activeCard.balance < total) {
      Alert.alert('Insufficient Balance', `Balance $${activeCard.balance.toFixed(2)} · Required $${total.toFixed(2)}`);
      return;
    }

    setLoading(true);
    try {
      for (const item of cart) {
        await apiService.pay({
          card_uid: activeCard.uid,
          product_id: item.type === 'product' ? item.id : undefined,
          service_id: item.type === 'service' ? item.id : undefined,
          quantity: item.quantity,
        });
      }
      const updatedCard = await apiService.getCard(activeCard.uid);
      setActiveCard(updatedCard);
      Alert.alert('Payment Complete', `New balance: $${updatedCard.balance.toFixed(2)}`);
      setCart([]);
    } catch (err: any) {
      Alert.alert('Payment Failed', err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set([...products.map(p => p.category), ...services.map(s => s.category)])];
  const filteredItems = selectedCategory === 'all'
    ? [...products.map(p => ({ ...p, type: 'product' as const })), ...services.map(s => ({ ...s, type: 'service' as const }))]
    : [
        ...products.filter(p => p.category === selectedCategory).map(p => ({ ...p, type: 'product' as const })),
        ...services.filter(s => s.category === selectedCategory).map(s => ({ ...s, type: 'service' as const })),
      ];

  return (
    <View style={styles.root}>
      {/* BG grid */}
      <View style={styles.gridOverlay} pointerEvents="none">
        {[...Array(6)].map((_, i) => (
          <View key={i} style={[styles.gridLine, { left: (width / 6) * i }]} />
        ))}
      </View>

      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* LEFT — Marketplace */}
        <View style={styles.marketplace}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <View style={styles.logoMark} />
              <Text style={styles.logoText}>MARKET<Text style={styles.logoThin}>PLACE</Text></Text>
            </View>
            <Text style={styles.tagline}>SELECT PRODUCTS TO PURCHASE</Text>
            <View style={styles.headerRule} />
          </View>

          {/* Active card strip */}
          {activeCard ? (
            <View style={styles.cardStrip}>
              <View style={styles.cardStripDot} />
              <View style={styles.cardStripInfo}>
                <Text style={styles.cardStripName}>{activeCard.holderName.toUpperCase()}</Text>
                <Text style={styles.cardStripUid}>{activeCard.uid}</Text>
              </View>
              <View style={styles.cardStripBalance}>
                <Text style={styles.cardStripBalanceLabel}>BALANCE</Text>
                <Text style={styles.cardStripBalanceValue}>${activeCard.balance.toFixed(2)}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.noCard}>
              <Text style={styles.noCardText}>AWAITING CARD SCAN</Text>
            </View>
          )}

          {/* Category tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catContent}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.catTab, selectedCategory === cat && styles.catTabActive]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.75}
              >
                <Text style={[styles.catTabText, selectedCategory === cat && styles.catTabTextActive]}>
                  {cat.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Products */}
          <ScrollView style={styles.productsScroll} showsVerticalScrollIndicator={false}>
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
        </View>

        {/* RIGHT — Cart */}
        <View style={styles.cartPanel}>
          {/* Cart header */}
          <View style={styles.cartHeader}>
            <Text style={styles.cartTitle}>CART</Text>
            {cart.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{getTotalItems()}</Text>
              </View>
            )}
          </View>
          <View style={styles.cartRule} />

          {cart.length === 0 ? (
            <View style={styles.cartEmpty}>
              <Text style={styles.cartEmptyIcon}>▱▱▱</Text>
              <Text style={styles.cartEmptyTitle}>EMPTY</Text>
              <Text style={styles.cartEmptySubtitle}>Add products to begin</Text>
            </View>
          ) : (
            <>
              <ScrollView style={styles.cartItems} showsVerticalScrollIndicator={false}>
                {cart.map((item, index) => (
                  <View key={item.id} style={styles.cartItem}>
                    <View style={styles.cartItemTop}>
                      <Text style={styles.cartItemIndex}>{String(index + 1).padStart(2, '0')}</Text>
                      <Text style={styles.cartItemEmoji}>{item.emoji}</Text>
                      <View style={styles.cartItemMeta}>
                        <Text style={styles.cartItemName} numberOfLines={1}>{item.name.toUpperCase()}</Text>
                        <Text style={styles.cartItemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
                      </View>
                      <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeBtn}>
                        <Text style={styles.removeBtnText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.cartItemBottom}>
                      <Text style={styles.unitPrice}>${item.price.toFixed(2)} / unit</Text>
                      <View style={styles.qtyRow}>
                        <TouchableOpacity onPress={() => updateQuantity(item.id, -1)} style={styles.qtyBtn}>
                          <Text style={styles.qtyBtnText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.qtyValue}>{item.quantity}</Text>
                        <TouchableOpacity onPress={() => updateQuantity(item.id, 1)} style={styles.qtyBtn}>
                          <Text style={styles.qtyBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.cartItemRule} />
                  </View>
                ))}
              </ScrollView>

              {/* Cart footer */}
              <View style={styles.cartFooter}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>TOTAL</Text>
                  <Text style={styles.totalValue}>${getTotalAmount().toFixed(2)}</Text>
                </View>

                {activeCard && (
                  <View style={styles.balanceRow}>
                    <Text style={styles.balanceLabel}>REMAINING</Text>
                    <Text style={[
                      styles.balanceValue,
                      activeCard.balance - getTotalAmount() < 0 ? styles.balanceNeg : styles.balancePos
                    ]}>
                      ${(activeCard.balance - getTotalAmount()).toFixed(2)}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.payBtn, (!activeCard || loading) && styles.payBtnDisabled]}
                  onPress={handlePayment}
                  disabled={!activeCard || loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color="#0a0a0a" size="small" />
                  ) : (
                    <Text style={styles.payBtnText}>CONFIRM PAYMENT →</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Animated.View>
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
  container: {
    flex: 1,
    flexDirection: 'row',
  },

  // Marketplace (left)
  marketplace: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#161616',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
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
    backgroundColor: '#5ae8c8',
    transform: [{ rotate: '45deg' }],
  },
  logoText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 4,
    color: '#f0f0f0',
  },
  logoThin: {
    fontWeight: '300',
  },
  tagline: {
    fontSize: 8,
    letterSpacing: 3,
    color: '#2a2a2a',
    fontWeight: '700',
    marginBottom: 14,
  },
  headerRule: {
    height: 1,
    backgroundColor: '#161616',
  },

  // Card strip
  cardStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#0f0f0f',
    borderWidth: 1,
    borderColor: '#1a1a1a',
    borderLeftWidth: 3,
    borderLeftColor: '#5ae8c8',
  },
  cardStripDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#5ae8c8',
    marginRight: 12,
  },
  cardStripInfo: {
    flex: 1,
  },
  cardStripName: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#e0e0e0',
  },
  cardStripUid: {
    fontSize: 9,
    color: '#333',
    letterSpacing: 1,
    marginTop: 2,
  },
  cardStripBalance: {
    alignItems: 'flex-end',
  },
  cardStripBalanceLabel: {
    fontSize: 8,
    letterSpacing: 2,
    color: '#333',
    fontWeight: '700',
  },
  cardStripBalanceValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#5ae8c8',
    letterSpacing: 0.5,
  },
  noCard: {
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 4,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  noCardText: {
    fontSize: 8,
    letterSpacing: 3,
    color: '#2a2a2a',
    fontWeight: '700',
  },

  // Category tabs
  catScroll: {
    marginTop: 16,
    maxHeight: 40,
  },
  catContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  catTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#1e1e1e',
    backgroundColor: 'transparent',
  },
  catTabActive: {
    backgroundColor: '#5ae8c8',
    borderColor: '#5ae8c8',
  },
  catTabText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#333',
  },
  catTabTextActive: {
    color: '#0a0a0a',
  },

  // Products
  productsScroll: {
    flex: 1,
    marginTop: 16,
  },
  productsGrid: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  // Cart panel (right)
  cartPanel: {
    width: 280,
    backgroundColor: '#080808',
    borderLeftWidth: 1,
    borderLeftColor: '#161616',
  },
  cartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    gap: 10,
  },
  cartTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 4,
    color: '#e0e0e0',
  },
  cartBadge: {
    backgroundColor: '#e8ff5a',
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 22,
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#0a0a0a',
    fontSize: 10,
    fontWeight: '800',
  },
  cartRule: {
    height: 1,
    backgroundColor: '#161616',
    marginHorizontal: 20,
  },

  // Empty
  cartEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  cartEmptyIcon: {
    fontSize: 20,
    color: '#1e1e1e',
    letterSpacing: 4,
    marginBottom: 8,
  },
  cartEmptyTitle: {
    fontSize: 10,
    letterSpacing: 4,
    color: '#222',
    fontWeight: '800',
  },
  cartEmptySubtitle: {
    fontSize: 10,
    color: '#1e1e1e',
    letterSpacing: 1,
  },

  // Cart items
  cartItems: {
    flex: 1,
    paddingTop: 8,
  },
  cartItem: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  cartItemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cartItemIndex: {
    fontSize: 9,
    color: '#2a2a2a',
    fontWeight: '700',
    letterSpacing: 1,
    width: 18,
  },
  cartItemEmoji: {
    fontSize: 18,
  },
  cartItemMeta: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#d0d0d0',
  },
  cartItemPrice: {
    fontSize: 12,
    color: '#e8ff5a',
    fontWeight: '700',
    marginTop: 2,
  },
  removeBtn: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  removeBtnText: {
    color: '#333',
    fontSize: 10,
    fontWeight: '700',
  },
  cartItemBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 26,
  },
  unitPrice: {
    fontSize: 9,
    color: '#2a2a2a',
    letterSpacing: 0.5,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#1e1e1e',
  },
  qtyBtnText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '300',
    lineHeight: 18,
  },
  qtyValue: {
    width: 28,
    textAlign: 'center',
    fontSize: 11,
    color: '#e0e0e0',
    fontWeight: '700',
    letterSpacing: 1,
  },
  cartItemRule: {
    height: 1,
    backgroundColor: '#111',
    marginTop: 14,
  },

  // Cart footer
  cartFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#161616',
    gap: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  totalLabel: {
    fontSize: 9,
    letterSpacing: 3,
    color: '#333',
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#e8ff5a',
    letterSpacing: -0.5,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 8,
    letterSpacing: 3,
    color: '#2a2a2a',
    fontWeight: '700',
  },
  balanceValue: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  balancePos: { color: '#5ae8c8' },
  balanceNeg: { color: '#ef4444' },
  payBtn: {
    backgroundColor: '#e8ff5a',
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  payBtnDisabled: {
    backgroundColor: '#1a1a1a',
  },
  payBtnText: {
    color: '#0a0a0a',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 3,
  },
});