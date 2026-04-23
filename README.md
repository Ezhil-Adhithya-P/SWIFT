# SWIFT: Smart Wallet & Integrated Fintech Terminal

A production-ready unified ecosystem for college kiosks, providing seamless digital payments, vendor inventory management, and administrative oversight.

## 🚀 Ecosystem Components

*   **swift-kiosk**: Touchscreen terminal interface for students to browse and purchase items.
*   **swift-wallet**: Mobile application (Expo/React Native) for students to manage balance and view transaction history.
*   **swift-vendor**: Management portal for shop owners to track sales and update inventory.
*   **swift-admin**: Centralized dashboard for college administration to provision wallets and settle payments.
*   **backend (server.js)**: Robust Node.js + MySQL engine handling all transactional logic and OTP verification.

## 🛠️ Tech Stack

*   **Frontend**: React.js (Vite), React Native (Expo)
*   **Backend**: Node.js, Express
*   **Database**: MySQL
*   **Authentication**: OTP-based Identity Verification (Twilio)

## 📦 Setup

1. Configure MySQL database using the provided schema.
2. Set up `.env` with Twilio credentials and DB details.
3. Start the backend: `node server.js`
4. Run frontend modules: `npm run dev` or `npx expo start`

---
© 2026 SWIFT Ecosystem
