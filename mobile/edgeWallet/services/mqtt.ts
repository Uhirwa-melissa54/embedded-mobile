// MQTT Service for EdgeWallet
import mqtt from 'mqtt';

const MQTT_BROKER = 'mqtt://157.173.101.159:1883';
const TEAM_ID = 'bright_sandracp_isaac';

export const TOPICS = {
  STATUS: `rfid/${TEAM_ID}/card/status`,
  BALANCE: `rfid/${TEAM_ID}/card/balance`,
  TOPUP: `rfid/${TEAM_ID}/card/topup`,
  PAY: `rfid/${TEAM_ID}/card/pay`,
};

export interface CardStatusMessage {
  uid: string;
  balance: number;
  status: string;
}

export interface CardBalanceMessage {
  uid: string;
  balance: number;
}

class MqttService {
  private client: mqtt.MqttClient | null = null;
  private listeners: Map<string, Set<(message: any) => void>> = new Map();

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.client = mqtt.connect(MQTT_BROKER);

        this.client.on('connect', () => {
          console.log('Connected to MQTT broker');
          
          // Subscribe to relevant topics
          this.client?.subscribe(TOPICS.STATUS);
          this.client?.subscribe(TOPICS.BALANCE);
          
          resolve();
        });

        this.client.on('message', (topic, message) => {
          try {
            const payload = JSON.parse(message.toString());
            this.notifyListeners(topic, payload);
          } catch (err) {
            console.error('Failed to parse MQTT message:', err);
          }
        });

        this.client.on('error', (err) => {
          console.error('MQTT error:', err);
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  disconnect() {
    if (this.client) {
      this.client.end();
      this.client = null;
    }
  }

  subscribe(topic: string, callback: (message: any) => void) {
    if (!this.listeners.has(topic)) {
      this.listeners.set(topic, new Set());
    }
    this.listeners.get(topic)?.add(callback);
  }

  unsubscribe(topic: string, callback: (message: any) => void) {
    this.listeners.get(topic)?.delete(callback);
  }

  private notifyListeners(topic: string, message: any) {
    const callbacks = this.listeners.get(topic);
    if (callbacks) {
      callbacks.forEach(callback => callback(message));
    }
  }

  isConnected(): boolean {
    return this.client?.connected || false;
  }
}

export default new MqttService();
