# EdgeWallet Login Guide

## Quick Start

The EdgeWallet mobile app uses a demo login system with two user roles.

## Demo Accounts

### 👤 Agent Account
**Purpose**: Top-up RFID cards with money

- **Username**: `agent`
- **Password**: `1234`
- **Features**:
  - View dashboard with statistics
  - Top-up cards (add money)
  - View transaction history
  - Scan RFID cards
  - Register new cards

**Use Case**: Bank teller, agent, or administrator who adds money to customer cards.

---

### 🛒 Salesperson Account
**Purpose**: Process payments for products/services

- **Username**: `sales`
- **Password**: `1234`
- **Features**:
  - View dashboard with statistics
  - Browse product marketplace
  - Add items to cart
  - Process payments
  - View transaction history
  - Scan customer RFID cards

**Use Case**: Store cashier, salesperson, or vendor who sells products/services.

---

## How to Login

### Method 1: Quick Fill (Recommended)
1. Open the app
2. On the login screen, tap one of the demo account buttons:
   - **"👤 Agent"** button for agent access
   - **"🛒 Salesperson"** button for sales access
3. Credentials will auto-fill
4. Tap **"Enter"** to login

### Method 2: Manual Entry
1. Open the app
2. Enter username: `agent` or `sales`
3. Enter password: `1234`
4. Tap **"Enter"** to login

---

## Role Differences

| Feature | Agent | Salesperson |
|---------|-------|-------------|
| Dashboard | ✅ Yes | ✅ Yes |
| Top-up Cards | ✅ Yes | ❌ No |
| Payment/Marketplace | ✅ Yes | ✅ Yes |
| Transaction History | ✅ Yes | ✅ Yes |
| Scan RFID Cards | ✅ Yes | ✅ Yes |

---

## Logout

To logout:
1. Tap the logout icon (→) in the top-right corner of any screen
2. Confirm logout in the dialog
3. You'll be returned to the login screen

---

## Security Notes

⚠️ **Important**: This is a demo login system for educational purposes only.

In a production environment, you should:
- Use secure authentication (JWT, OAuth, etc.)
- Store credentials securely (AsyncStorage with encryption)
- Implement proper session management
- Use HTTPS for all API calls
- Add password complexity requirements
- Implement rate limiting and account lockout
- Use biometric authentication (Face ID, Touch ID)

---

## Troubleshooting

### Can't Login
- Ensure you're using the correct credentials:
  - Username: `agent` or `sales`
  - Password: `1234`
- Try using the quick-fill buttons instead of manual entry
- Check for typos (credentials are case-sensitive)

### Wrong Screen After Login
- Agent users start at Dashboard
- Sales users start at Payment/Marketplace
- You can navigate to other tabs using the bottom navigation

### Logout Not Working
- Make sure to confirm the logout dialog
- If stuck, force close and reopen the app

---

## Development Notes

The login system uses a global variable to store the current user:
```typescript
global.currentUser = {
  username: 'agent',
  password: '1234',
  role: 'agent',
  name: 'Agent User',
};
```

For production, replace this with:
- AsyncStorage for persistent login
- Context API or Redux for state management
- Secure token storage
- Backend authentication API

---

## Next Steps

After logging in:

**As Agent**:
1. Navigate to "Top Up" tab
2. Scan an RFID card
3. Enter amount and holder name
4. Confirm top-up

**As Salesperson**:
1. Navigate to "Payment" tab
2. Scan customer's RFID card
3. Browse products by category
4. Add items to cart
5. Review and process payment

---

**Team ID**: bright_sandracp_isaac
