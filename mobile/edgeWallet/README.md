# EdgeWallet Mobile App

A React Native mobile application for the EdgeWallet RFID payment system with role-based access control.

## Demo Login Credentials

The app includes a demo login system with two roles:

### Agent (Top-up Role)
- **Username**: `agent`
- **Password**: `1234`
- **Access**: Dashboard, Top-up, Transaction History

### Salesperson (Payment Role)
- **Username**: `sales`
- **Password**: `1234`
- **Access**: Dashboard, Payment/Marketplace, Transaction History

## Features

### Login System
- Role-based authentication
- Quick-fill demo credentials
- Secure password input
- Logout functionality with confirmation

### 1. Dashboard
- Real-time card detection via MQTT
- Display active card information with Mastercard-style visual
- Quick statistics (total cards, today's transactions, total volume, average transaction)
- MQTT connection status indicator

### 2. Top-Up
- Scan RFID card to auto-populate UID
- Add money to existing cards
- Register new cards with holder name
- Real-time balance updates

### 3. Payment (Marketplace)
- Browse products and services by category
- Add items to cart with quantity control
- Real-time balance checking
- Multi-item checkout
- Cart management (add, remove, update quantities)

### 4. Transaction History
- View all transactions (top-ups and payments)
- Filter by card UID
- Display transaction details (amount, type, timestamp, balance)
- Pull-to-refresh functionality

## Technology Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: React Hooks
- **API Communication**: Fetch API
- **Real-time Updates**: MQTT (mqtt.js)
- **Language**: TypeScript

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Emulator (for Android development)

## Installation

1. Navigate to the mobile app directory:
```bash
cd mobile/edgeWallet
```

2. Install dependencies:
```bash
npm install
```

## Configuration

The app is pre-configured to connect to:
- **Backend API**: `http://157.173.101.159:8256`
- **MQTT Broker**: `mqtt://157.173.101.159:1883`
- **Team ID**: `bright_sandracp_isaac`

To change these settings, edit:
- `services/api.ts` for API endpoint
- `services/mqtt.ts` for MQTT broker and topics

## Running the App

### Development Mode

Start the Expo development server:
```bash
npm start
```

Then choose your platform:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your physical device

### Platform-Specific Commands

iOS:
```bash
npm run ios
```

Android:
```bash
npm run android
```

Web (for testing):
```bash
npm run web
```

## Project Structure

```
mobile/edgeWallet/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Dashboard screen
│   │   ├── topup.tsx          # Top-up screen
│   │   ├── payment.tsx        # Payment/Marketplace screen
│   │   ├── transactions.tsx   # Transaction history screen
│   │   └── _layout.tsx        # Tab navigation layout
│   └── _layout.tsx            # Root layout
├── components/
│   ├── BalanceCard.tsx        # Card visual component
│   ├── ProductCard.tsx        # Product display component
│   ├── TransactionItem.tsx    # Transaction list item
│   ├── themed-text.tsx        # Themed text component
│   └── themed-view.tsx        # Themed view component
├── services/
│   ├── api.ts                 # API service (HTTP requests)
│   └── mqtt.ts                # MQTT service (real-time updates)
├── constants/
│   └── theme.ts               # Theme configuration
└── package.json
```

## Key Components

### API Service (`services/api.ts`)
Handles all HTTP communication with the backend:
- `getCard(uid)` - Fetch card details
- `getAllCards()` - Fetch all cards
- `getTransactions(uid?)` - Fetch transactions
- `topup(data)` - Perform top-up
- `pay(data)` - Process payment
- `getProducts()` - Fetch products
- `getServices()` - Fetch services

### MQTT Service (`services/mqtt.ts`)
Manages real-time communication:
- Connects to MQTT broker
- Subscribes to card status and balance topics
- Provides event listeners for card detection
- Handles connection status

## Usage Flow

### Login Flow
1. Open the app (login screen appears first)
2. Choose a demo account:
   - Tap "Agent" button to auto-fill agent credentials
   - Tap "Salesperson" button to auto-fill sales credentials
   - Or manually enter: username (`agent` or `sales`) and password (`1234`)
3. Tap "Enter" to login
4. App navigates to appropriate screen based on role

### Agent (Top-Up) Flow
1. Open the app and navigate to "Top Up" tab
2. Scan RFID card (auto-populates UID)
3. For new cards, enter holder name
4. Enter amount to add
5. Tap "Confirm Top Up"
6. View updated balance

### Salesperson (Payment) Flow
1. Navigate to "Payment" tab
2. Scan customer's RFID card
3. Browse products/services by category
4. Add items to cart
5. Review cart and total amount
6. Tap "Pay Now" to process payment
7. View updated balance and receipt

### Dashboard View
1. Navigate to "Dashboard" tab
2. View active card information
3. See real-time statistics
4. Monitor MQTT connection status

### Transaction History
1. Navigate to "History" tab
2. View all transactions
3. Pull down to refresh
4. See transaction details (type, amount, timestamp)

## Troubleshooting

### MQTT Connection Issues
- Ensure the MQTT broker is running and accessible
- Check network connectivity
- Verify broker URL in `services/mqtt.ts`

### API Connection Issues
- Verify backend server is running
- Check API_BASE_URL in `services/api.ts`
- Ensure device/emulator can reach the backend

### Card Not Detected
- Verify MQTT connection is active (green dot on dashboard)
- Check that Arduino/RFID reader is publishing to correct topics
- Ensure team ID matches in all components

## Development Notes

- The app uses TypeScript for type safety
- All API calls include error handling
- MQTT reconnection is automatic
- Pull-to-refresh is available on all list screens
- Cart state is managed locally (resets on payment)

## Testing

To test without physical RFID hardware:
1. Use the web dashboard to create test cards
2. Manually trigger MQTT messages using an MQTT client
3. Use the backend API directly via Postman/curl

## Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

## License

This project is part of the EdgeWallet RFID Payment System assignment.

## Team

Team ID: bright_sandracp_isaac
