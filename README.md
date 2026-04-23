# SWIFT: Student Wallet Interactive Financial Terminal 🚀

SWIFT is a completely integrated, end-to-end digital ecosystem simulating a college cashless economy. It uses a centralized Node.js Bank API powered by **MySQL** and four separate front-end clients to process secure transactions between students and vendors.

---

## ✨ Latest Features (Updated Apr 2026)

*   **🔒 Secure Multi-Student Auth:** Production-ready login system with Roll Number/Password validation and OTP-based password recovery (via Email/SMS).
*   **📊 Analytics Hub:** Premium dashboard featuring dynamic Line, Bar, and Pie charts to visualize spending trends, top-up history, and distribution.
*   **📱 Redesigned Mobile Experience:** 
    *   Time-based personalized greetings (Morning/Afternoon/Evening).
    *   Refined Transaction receipts with short, readable IDs.
    *   Seamless QR-based Top-Up gateway with auto-redirection.
*   **🗄️ Persistent Database:** Fully transitioned from mock JSON data to a robust MySQL backend for real-world consistency.

---

## 🛠️ Pre-requisites to run locally

Before pulling the code, ensure your computer has the following globally installed:
1.  **Node.js** (v18.0.0 or higher)
2.  **MySQL Server** (Running on port 3306)
3.  **Expo Go** App installed on your physical mobile device.

---

## 🚀 Step 1: Core Setup & Dependencies

When you clone this repository, you must install dependencies for all nodes:

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

## 🗄️ Step 2: Database Setup

1.  Open **MySQL Workbench**.
2.  Run the initialization queries found in `server.js` (or ask Antigravity to verify your schema).
3.  Use the `seed_db.js` script to populate the system with realistic data if needed.
4.  Use `wipe_db.js` to reset the application to a fresh state.

---

## 🔑 Step 3: Environment Configuration

Create a `.env` file inside the root **SWIFT/** folder:

```env
PORT=3000
MODE=live

# MySQL Config
DB_HOST=127.0.0.1
DB_USER=root
DB_PASS=pass123
DB_NAME=swift_db

# Twilio Credentials (Get from Twilio Console)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_sender_number

# Testing Configuration 
VERIFIED_RECIPIENT_NUMBER=+91XXXXXXXXXX
```

> **IMPORTANT:** In `swift-wallet/src/context/WalletContext.js`, update `const API_URL` to explicitly match your computer's current IPv4 Local network ID (e.g., `192.168.x.x`).

---

## 🟢 Step 4: Run the Ecosystem

Open 4-5 separate terminal windows:

*   **Backend API:** `cd SWIFT && node server.js`
*   **Campus Kiosk:** `cd SWIFT/swift-kiosk && npm run dev`
*   **Admin Dashboard:** `cd SWIFT/swift-admin && npm run dev`
*   **Vendor Dashboard:** `cd SWIFT/swift-vendor && npm run dev`
*   **Mobile App:** `cd SWIFT/swift-wallet && npx expo start -c`

---

## 🤖 Working with Antigravity (AI Assistant)

This project is built with the help of **Antigravity**, a powerful AI coding assistant.

### 👥 For Teammates:
If you are new to this repository or want to create a new feature branch:
1.  **Ask for Environment Setup:** You can ask Antigravity: *"I just cloned the repo, can you help me set up my local environment and MySQL database?"*
2.  **Create New Branches:** Tell Antigravity: *"I want to work on a new feature for the Vendor app. Please create a branch named 'vendor-updates' and prepare the workspace."*
3.  **Debug & UI Polish:** Simply describe the UI you want or the error you see, and Antigravity will handle the code implementation.

---

## 🧪 Walkthrough Test
1.  Open Admin web app.
2.  In the Mobile App, hit **+"Add Amount"**. Scan the QR and watch the balance update.
3.  Check the **Analytics** tab to see your spending trends.
4.  Go to the **Kiosk**, buy an item, and verify the transaction in your **History** with its new short ID!
