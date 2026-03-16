# MQTT Topics Documentation  EdgeWallet

## 1. MQTT Broker

The system communicates through the following MQTT broker:

```
mqtt://157.173.101.159:1883
```

Each group uses a unique **Team ID** to avoid conflicts with other teams.

```
Team ID: K2z2mI
```

All MQTT topics follow this structure:

```
rfid/<team_id>/card/<action>
```

Example:

```
rfid/K2z2mI/card/status
```

---

# 2. MQTT Topics Used

| Topic                      | Publisher             | Subscriber | Description                               |
| -------------------------- | --------------------- | ---------- | ----------------------------------------- |
| `rfid/K2z2mI/card/status`  | RFID system / Backend | Mobile App | Sends card status and balance information |
| `rfid/K2z2mI/card/balance` | Backend               | Mobile App | Sends updated wallet balance              |
| `rfid/K2z2mI/card/topup`   | Mobile App            | Backend    | Requests wallet top-up                    |
| `rfid/K2z2mI/card/pay`     | Mobile App            | Backend    | Requests payment from wallet              |

---

# 3. Message Formats

All MQTT messages are sent using **JSON format**.

---

## 3.1 Card Status Message

Topic:

```
rfid/K2z2mI/card/status
```

Payload example:

```json
{
  "uid": "A1B2C3D4",
  "balance": 1500,
  "status": "active"
}
```

Fields:

| Field   | Description                           |
| ------- | ------------------------------------- |
| uid     | RFID card unique identifier           |
| balance | Current wallet balance                |
| status  | Card state (active, blocked, unknown) |

---

## 3.2 Card Balance Message

Topic:

```
rfid/K2z2mI/card/balance
```

Payload example:

```json
{
  "uid": "A1B2C3D4",
  "balance": 1700
}
```

Fields:

| Field   | Description                 |
| ------- | --------------------------- |
| uid     | RFID card unique identifier |
| balance | Updated wallet balance      |

---

## 3.3 Wallet Top-Up Request

Topic:

```
rfid/K2z2mI/card/topup
```

Payload example:

```json
{
  "uid": "A1B2C3D4",
  "amount": 500
}
```

Fields:

| Field  | Description                 |
| ------ | --------------------------- |
| uid    | RFID card unique identifier |
| amount | Amount to add to wallet     |

---

## 3.4 Payment Request

Topic:

```
rfid/K2z2mI/card/pay
```

Payload example:

```json
{
  "uid": "A1B2C3D4",
  "amount": 200
}
```

Fields:

| Field  | Description                 |
| ------ | --------------------------- |
| uid    | RFID card unique identifier |
| amount | Payment amount              |

---

# 4. System Communication Flow

### Card Scan Process

1. RFID card is scanned.
2. The system publishes card information to:

```
rfid/K2z2mI/card/status
```

3. The mobile application receives the card UID and balance.

---

### Wallet Top-Up Process

1. Agent requests a top-up using the mobile application.
2. Mobile app publishes a message to:

```
rfid/K2z2mI/card/topup
```

3. Backend processes the request.
4. Backend updates the database.
5. Backend publishes updated balance to:

```
rfid/K2z2mI/card/balance
```

---

### Payment Process

1. Salesperson initiates payment.
2. Mobile app publishes a message to:

```
rfid/K2z2mI/card/pay
```

3. Backend verifies wallet balance.
4. If sufficient funds exist:

   * balance is deducted
   * transaction is stored
5. Backend sends updated balance using:

```
rfid/K2z2mI/card/balance
```

---

# 5. Subscribed Topics in the Mobile Application

The mobile application subscribes to the following topics:

```
rfid/K2z2mI/card/status
rfid/K2z2mI/card/balance
```

These topics allow the app to receive:

* card status
* updated wallet balance
* transaction updates

---

# 6. Summary

The EdgeWallet system uses MQTT topics to enable real-time communication between:

* RFID card readers
* Mobile applications
* Backend services

Using a **team-specific topic namespace (`K2z2mI`)** prevents message conflicts between different groups working on the same MQTT broker.
