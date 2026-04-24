# SWIFT: Smart Wallet for Instant Fund Transfer

An unified ecosystem for college kiosks, providing seamless digital payments, vendor inventory management and administrative oversight.

##  Ecosystem Components

*   **swift-wallet**: Mobile app for students to manage balance, view transaction history and get insights about their transactions.
*   **swift-kiosk**: Web-app interface for students to browse and purchase items.
*   **swift-vendor**: Management portal for shop owners to track sales and update inventory.
*   **swift-admin**: Centralized dashboard for college administration to provision wallets and settle payments.
*   **backend (server.js)**: Robust Node.js + MySQL engine handling all transactional logic and OTP verification.

##  Tech Stack

*   **Frontend**: React.js (For kiosk, vendor and admin web-apps), React Native (for student wallet mobile app)
*   **Backend**: Node.js, ExpressJS
*   **Database**: MySQL (for the maintainance of structured records across the ecosystem)
*   **Authentication**: OTP-based Identity Verification (using Twilio)

##  Setup

1. Configure MySQL database using the provided schema.
2. Set up `.env` with Twilio credentials and DB details.
3. Start the backend: `node server.js`
4. Run frontend modules: `npm run dev` or `npx expo start`

---
© 2026 SWIFT Ecosystem
