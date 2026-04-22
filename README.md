#ennoda code daaw
poda potta

# SWIFT: Student Wallet Interactive Financial Terminal

SWIFT is a completely integrated, end-to-end digital ecosystem simulating a college cashless economy. It uses a centralized Node.js Bank API and four separate front-end clients to process Twilio-secured 2FA transactions between students and vendors.

---

## 🛠️ Pre-requisites to run locally
Before pulling the code, ensure your computer has the following globally installed:
1. **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
2. **NPM** (Usually bundles with Node.js)
3. **Expo Go** App installed on your physical Android or iPhone device

---

## 🚀 Step 1: Core Setup & Dependencies
When you clone this repository, you must install the dependencies for **all five** working nodes before starting the servers. Open your terminal and run block by block:

```bash
# 1. Setup the Central API Server
cd SWIFT
npm install

# 2. Setup the Campus Kiosk
cd swift-kiosk
npm install

# 3. Setup the College Admin Board
cd ../swift-admin
npm install

# 4. Setup the Vendor Admin Console
cd ../swift-vendor
npm install

# 5. Setup the Student Mobile App
cd ../swift-wallet
npm install
```

---

## 🔑 Step 2: Environment Configuration
The backend requires Twilio to securely send OTP SMS. Create a `.env` file inside the root **SWIFT/** folder and add the following:

```env
PORT=3000
MODE=live

# Twilio Credentials (Get from Twilio Console)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_sender_number

# Testing Configuration 
# Add your physical mobile number to test the Roll Number logic natively
VERIFIED_RECIPIENT_NUMBER=+91XXXXXXXXXX
```

> **IMPORTANT:** In `swift-wallet/src/context/WalletContext.js`, update `const API_URL = 'http://192.168.x.x:3000/api';` to explicitly match your computer's current IPv4 Local network ID so the phone emulator can find the API!

---

## 🟢 Step 3: Run the Ecosystem (Start 4 Terminals)
Because this is a microservices-style project, you must spin up all systems simultaneously. Open 4 separate terminal windows in VS Code (`Terminal -> New Terminal`):

**Terminal 1 (Backend Core API Engine):**
```bash
cd SWIFT
node server.js
```

**Terminal 2 (The Campus Kiosk):**
```bash
cd SWIFT/swift-kiosk
npm run dev
```

**Terminal 3 (The Dashboards - Vendor/Admin):**
*Note: Vite will automatically map Vendor to 5174 and Admin to 5175 if launched sequentially.*
```bash
cd SWIFT/swift-admin
npm run dev

# (Optional: Open Terminal 5 for Vendor Dashboard)
# cd SWIFT/swift-vendor
# npm run dev
```

**Terminal 4 (Student Mobile React Native App):**
```bash
cd SWIFT/swift-wallet
npx expo start -c
```
*(Scan the generated QR code with the Expo Go app on your physical mobile phone).*

---

## 🧪 Step 4: The Live Walkthrough Test
Once everything is running perfectly on your system:
1. Open the Admin web apps on your browser.
2. In the Mobile App, hit **+"Top Up"**. Watch the money officially hit the `College Admin Dashboard`.
3. Open the **Kiosk web app**, put a Sandwich in your cart, and click Checkout.
4. When asked for Authentication, log in using Roll Number: **`21CS101`**.
5. Wait for the actual Twilio SMS to hit your phone, and type the 6 digits in!
6. Instantly watch your Mobile App's balance mathematically decline, and watch the Vendor Dashboard officially register the cash revenue!
