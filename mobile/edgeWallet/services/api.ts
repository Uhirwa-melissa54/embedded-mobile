// API Service for EdgeWallet
const API_BASE_URL = 'http://10.12.72.178:8256';

export interface Card {
  uid: string;
  card_uid: string;
  holderName: string;
  balance: number;
  lastTopup: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  card_uid: string;
  uid: string;
  amount: number;
  type: 'TOPUP' | 'PAYMENT';
  balanceBefore: number;
  balanceAfter: number;
  description?: string;
  productName?: string;
  timestamp: string;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  emoji: string;
  active: boolean;
}

export interface Service {
  _id: string;
  name: string;
  price: number;
  category: string;
  emoji: string;
  active: boolean;
}

export interface TopupRequest {
  uid: string;
  amount: number;
  holderName?: string;
}

export interface PaymentRequest {
  card_uid: string;
  product_id?: string;
  service_id?: string;
  quantity?: number;
  operator?: string;
}

class ApiService {
  // Card operations
  async getCard(uid: string): Promise<Card> {
    const response = await fetch(`${API_BASE_URL}/card/${uid}`);
    if (!response.ok) {
      throw new Error('Card not found');
    }
    return response.json();
  }

  async getAllCards(): Promise<Card[]> {
    const response = await fetch(`${API_BASE_URL}/cards`);
    if (!response.ok) {
      throw new Error('Failed to fetch cards');
    }
    return response.json();
  }

  // Transaction operations
  async getTransactions(uid?: string): Promise<Transaction[]> {
    const url = uid 
      ? `${API_BASE_URL}/transactions/${uid}`
      : `${API_BASE_URL}/transactions`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }
    return response.json();
  }

  // Top-up operation
  async topup(data: TopupRequest): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/topup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Top-up failed');
    }
    
    return result;
  }

  // Payment operation
  async pay(data: PaymentRequest): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || result.message || 'Payment failed');
    }
    
    return result;
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    return response.json();
  }

  // Service operations
  async getServices(): Promise<Service[]> {
    const response = await fetch(`${API_BASE_URL}/services`);
    if (!response.ok) {
      throw new Error('Failed to fetch services');
    }
    return response.json();
  }
}

export default new ApiService();
