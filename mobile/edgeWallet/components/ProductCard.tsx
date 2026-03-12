import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Product, Service } from '@/services/api';

interface ProductCardProps {
  product: (Product | Service) & { type: 'product' | 'service' };
  onAdd: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => {
  const isSvc = product.type === 'service';

  return (
    <View style={styles.card}>
      {/* Accent top line */}
      <View style={[styles.accentBar, { backgroundColor: isSvc ? '#5ae8c8' : '#e8ff5a' }]} />

      <Text style={styles.emoji}>{product.emoji}</Text>

      <Text style={styles.name} numberOfLines={1}>
        {product.name.toUpperCase()}
      </Text>

      <Text style={[styles.price, { color: isSvc ? '#5ae8c8' : '#e8ff5a' }]}>
        ${product.price.toFixed(2)}
      </Text>

      <View style={styles.categoryBadge}>
        <Text style={styles.categoryText}>{product.category.toUpperCase()}</Text>
      </View>

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: isSvc ? '#5ae8c8' : '#e8ff5a' }]}
        onPress={onAdd}
        activeOpacity={0.8}
      >
        <Text style={styles.addButtonText}>+ ADD</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '47%',
    backgroundColor: '#0f0f0f',
    borderWidth: 1,
    borderColor: '#1a1a1a',
    padding: 14,
    marginBottom: 10,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  emoji: {
    fontSize: 36,
    marginBottom: 8,
    marginTop: 6,
  },
  name: {
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
    color: '#d0d0d0',
    letterSpacing: 1.5,
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  categoryBadge: {
    borderWidth: 1,
    borderColor: '#1e1e1e',
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 7,
    color: '#444',
    letterSpacing: 2,
    fontWeight: '700',
  },
  addButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    width: '100%',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#0a0a0a',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
  },
});

export default ProductCard;
