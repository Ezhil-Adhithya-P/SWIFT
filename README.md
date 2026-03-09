# SWIFT - Smart Wallet for Instant Fund Transfers

> **Fast Payment. Smarter Campus**
> 
> A comprehensive digital payment ecosystem for colleges enabling instant, secure transactions between students, vendors, and administration.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Core Features Deep Dive](#core-features-deep-dive)
- [Security](#security)
- [Future Enhancements](#future-enhancements)
- [Team](#team)
- [License](#license)

---

## 🎯 Project Overview

**SWIFT** is a Design Thinking and Innovation (DTI) project that creates a unified digital payment platform for college campuses. It eliminates the need for physical cash during campus transactions and provides a secure, traceable system for students, vendors, and college administration.

### Problem Statement
- Students carry cash for campus purchases (risky, inconvenient)
- Vendors lack transparent transaction tracking
- College has no unified payment ecosystem
- No audit trail for financial accountability

### Solution
A comprehensive digital wallet system with:
- Instant payments via OTP verification
- Real-time transaction tracking
- Secure settlement process
- Complete audit trail for compliance

---

## ⭐ Key Features

### 1. **Student Wallet Application**
- User registration with roll number & password
- Add funds to wallet (integration with payment gateway)
- Browse available vendors & products
- Add products to shopping cart
- Secure checkout with OTP verification
- Transaction history & spending dashboard
- Real-time wallet balance updates

### 2. **Kiosk Machine Interface**
- Select vendor/store from available options
- Browse products with images, prices & stock availability
- Dynamic shopping cart management
- Wallet-based payment initiation
- OTP generation & verification (core feature)
- Receipt generation (PDF/printed bill)
- Instant transaction confirmation

### 3. **POS (Vendor) Application**
- Vendor login with credentials
- View pending transactions from kiosks
- Verify transaction details
- Release items to students
- Real-time transaction history
- Sales analytics & performance dashboard
- Product inventory management

### 4. **College Admin Panel**
- System-wide dashboard & overview
- User management (students, vendors, admins)
- Real-time settlement processing
- Settlement history & reports
- Transaction verification & reconciliation
- Audit logs & compliance reports
- System configuration & settings

### 5. **OTP Security System** ⭐ (Core Feature)
- Automatic 6-digit OTP generation per transaction
- SMS delivery to registered phone number
- 5-minute OTP expiration window
- 3-attempt limit with automatic lockout
- OTP encryption & hashing in database
- Complete audit trail in MongoDB
- Real-time transaction processing after verification

---

## 🏗️ System Architecture

```
                    ┌─────────────────────┐
                    │  Shared Backend API │
                    │ (FastAPI Port 8000) │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ Student Wallet   │ │  Kiosk Machine   │ │  POS Vendor App  │
│   (Port 3001)    │ │   (Port 3002)    │ │   (Port 3003)    │
│ HTML/CSS/JS      │ │ HTML/CSS/JS      │ │ HTML/CSS/JS      │
└──────────────────┘ └──────────────────┘ └──────────────────┘
        │                      │                      │
        └──────────────────────┼──────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
            ┌──────────────────┐  ┌──────────────────┐
            │  PostgreSQL DB   │  │  MongoDB Logs    │
            │  (Primary Data)  │  │  (OTP/Audit)     │
            └──────────────────┘  └──────────────────┘
                    │
                    ▼
            ┌──────────────────────┐
            │  College Admin Panel │
            │   (Port 3004)        │
            │   HTML/CSS/JS        │
            └──────────────────────┘
```

---

## 💻 Tech Stack

### Frontend
- **HTML5** - Semantic markup & structure
- **CSS3** - Responsive design with Flexbox/Grid
- **JavaScript (ES6+)** - Vanilla JS (no frameworks for simplicity)
- **Fetch API** - HTTP requests to backend

### Backend
- **Python 3.9+** - Core language
- **FastAPI 0.100+** - High-performance async framework
- **Uvicorn 0.23+** - ASGI server
- **Pydantic v2** - Data validation & serialization
- **python-jose 3.3+** - JWT authentication
- **pyotp 2.9+** - OTP generation & verification (CORE)
- **bcrypt** - Password hashing & security
- **SQLAlchemy** - PostgreSQL ORM
- **pymongo** - MongoDB driver

### Databases
- **PostgreSQL 14+** - User data, wallets, products, inventory, settlements
- **MongoDB 6.0+** - OTP logs, transaction logs, audit trails
- **Redis 7.0+** (Optional) - Caching & session management

### Development & Deployment
- **Git** - Version control
- **Docker** (Optional) - Containerization
- **pip** - Python package management

---

## 📁 Project Structure

```
swift-project/
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── dependencies.py
│   │   │
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── wallet.py
│   │   │   ├── otp.py (⭐ CORE OTP LOGIC)
│   │   │   ├── products.py
│   │   │   ├── transactions.py
│   │   │   └── settlements.py
│   │   │
│   │   ├── services/
│   │   │   ├── otp_service.py (⭐ OTP IMPLEMENTATION)
│   │   │   ├── wallet_service.py
│   │   │   ├── transaction_service.py
│   │   │   └── email_sms_service.py
│   │   │
│   │   ├── models/
│   │   │   ├── schemas.py
│   │   │   └── database.py
│   │   │
│   │   └── utils/
│   │       ├── security.py
│   │       ├── validators.py
│   │       └── helpers.py
│   │
│   ├── .env
│   ├── .env.example
│   ├── requirements.txt
│   └── run.py
│
├── frontend/
│   ├── student-wallet/
│   │   ├── index.html
│   │   ├── css/
│   │   │   └── styles.css
│   │   ├── js/
│   │   │   ├── api.js
│   │   │   ├── app.js
│   │   │   └── utils.js
│   │   └── pages/
│   │       ├── login.html
│   │       ├── register.html
│   │       ├── dashboard.html
│   │       └── history.html
│   │
│   ├── kiosk-machine/
│   │   ├── index.html
│   │   ├── css/
│   │   │   └── styles.css
│   │   ├── js/
│   │   │   ├── api.js
│   │   │   ├── cart.js
│   │   │   └── checkout.js
│   │   └── pages/
│   │       ├── store-select.html
│   │       ├── products.html
│   │       ├── cart.html
│   │       └── otp-verify.html
│   │
│   ├── pos-vendor/
│   │   ├── index.html
│   │   ├── css/
│   │   │   └── styles.css
│   │   ├── js/
│   │   │   ├── api.js
│   │   │   └── app.js
│   │   └── pages/
│   │       ├── login.html
│   │       ├── dashboard.html
│   │       ├── verify-transaction.html
│   │       └── analytics.html
│   │
│   └── admin-panel/
│       ├── index.html
│       ├── css/
│       │   └── styles.css
│       ├── js/
│       │   ├── api.js
│       │   └── app.js
│       └── pages/
│           ├── login.html
│           ├── dashboard.html
│           ├── settlements.html
│           └── reports.html
│
├── docker-compose.yml
├── README.md
└── LICENSE
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Python 3.9+
- PostgreSQL 14+
- MongoDB 6.0+
- Git
- Node.js (optional, for frontend tools)

### Step 1: Clone Repository
```bash
git clone https://github.com/Ezhil-Adhithya-P/SWIFT
cd swift-project
```

### Step 2: Setup Backend
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # On Windows: venv\\Scripts\\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials:
# DATABASE_URL=postgresql://user:password@localhost:5432/swift_db
# MONGODB_URL=mongodb://localhost:27017/swift_db
# SECRET_KEY=your-secret-key-here
# ALGORITHM=HS256
```

### Step 3: Initialize Databases
```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE swift_db;
\q

# Run migrations (if using Alembic)
alembic upgrade head

# Initialize MongoDB collections
python -c "from app.database import init_db; init_db()"
```

### Step 4: Run Backend Server
```bash
python run.py
# Backend will be available at: http://localhost:8000
# API Documentation: http://localhost:8000/docs
```

### Step 5: Run Frontend Applications (In Separate Terminals)

**Terminal 2: Student Wallet (Port 3001)**
```bash
cd frontend/student-wallet
python -m http.server 3001
# Access: http://localhost:3001
```

**Terminal 3: Kiosk Machine (Port 3002)**
```bash
cd frontend/kiosk-machine
python -m http.server 3002
# Access: http://localhost:3002
```

**Terminal 4: POS Vendor (Port 3003)**
```bash
cd frontend/pos-vendor
python -m http.server 3003
# Access: http://localhost:3003
```

**Terminal 5: Admin Panel (Port 3004)**
```bash
cd frontend/admin-panel
python -m http.server 3004
# Access: http://localhost:3004
```

---

## 🚀 Usage

### Student Workflow
1. **Register** - Create account with roll number & password
2. **Add Funds** - Top-up wallet through payment gateway
3. **Browse Products** - Select vendor and explore available items
4. **Add to Cart** - Select products and quantities
5. **Checkout** - Initiate payment via college wallet
6. **OTP Verification** - Enter OTP received via SMS
7. **Complete Purchase** - Transaction successful, receive bill
8. **Collect Items** - Take bill to vendor, collect purchased items

### Vendor Workflow
1. **Login** - Access vendor portal with credentials
2. **Manage Products** - Add/edit products with details & images
3. **View Transactions** - See real-time kiosk transactions
4. **Verify & Release** - Confirm transaction, release items to student
5. **Track Analytics** - View sales trends & performance

### Admin Workflow
1. **Monitor Dashboard** - System overview & real-time stats
2. **Verify Transactions** - Cross-check all day's transactions
3. **Process Settlement** - Run midnight settlement batch
4. **Generate Reports** - Create audit & compliance reports
5. **Manage System** - Add users, configure settings

---

## 🔌 API Endpoints

### Authentication
```
POST    /api/auth/register        Register new user
POST    /api/auth/login           Login & get JWT token
POST    /api/auth/logout          Logout user
GET     /api/auth/me              Get current user info
```

### Wallet
```
GET     /api/wallet/balance       Get wallet balance
POST    /api/wallet/topup         Add funds to wallet
GET     /api/wallet/history       Get transaction history
```

### OTP (Core Feature) ⭐
```
POST    /api/otp/generate         Generate OTP for transaction
POST    /api/otp/verify           Verify OTP & process transaction
GET     /api/otp/status           Check OTP status
```

### Products
```
GET     /api/products/list        Get products by vendor
POST    /api/products/create      Create new product (vendor)
PUT     /api/products/{id}        Edit product
DELETE  /api/products/{id}        Delete product
GET     /api/products/search      Search products
```

### Transactions
```
POST    /api/transactions/create  Create transaction
GET     /api/transactions/list    Get user transactions
GET     /api/transactions/{id}    Get transaction details
POST    /api/transactions/{id}/complete  Mark transaction complete
```

### Settlements (Admin)
```
GET     /api/settlements/list     Get all settlements
POST    /api/settlements/process  Process midnight settlement
GET     /api/settlements/{id}     Get settlement details
```

### Analytics
```
GET     /api/analytics/dashboard  System dashboard metrics
GET     /api/analytics/sales      Sales analytics
GET     /api/analytics/revenue    Revenue reports
GET     /api/analytics/users      User statistics
```

---

## 🗄️ Database Schema

### PostgreSQL (Primary Data)

**Users Table**
```
id | roll_number | email | phone | password_hash | user_type | created_at | updated_at
```

**Wallets Table**
```
id | user_id | balance | is_active | created_at | updated_at
```

**Products Table**
```
id | vendor_id | name | price | stock_quantity | is_active | created_at | updated_at
```

**Transactions Table**
```
id | transaction_id | student_id | vendor_id | amount | status | created_at
```

**Transaction Items**
```
id | transaction_id | product_id | quantity | unit_price | total_price
```

**Settlements Table**
```
id | vendor_id | settlement_date | total_amount | status | created_at
```

### MongoDB (Logs & Audit)

**OTP Logs Collection**
```json
{
  "_id": ObjectId,
  "student_id": "STU001",
  "transaction_id": "TXN20240225001",
  "otp_code": "hashed_value",
  "created_at": ISODate,
  "expires_at": ISODate,
  "status": "verified|pending|expired|blocked",
  "attempts": 0,
  "verified_at": ISODate
}
```

**Transaction Logs Collection**
```json
{
  "_id": ObjectId,
  "transaction_id": "TXN20240225001",
  "student_id": "STU001",
  "vendor_id": "VENDOR001",
  "amount": 250.50,
  "items": [...],
  "otp_verified_at": ISODate,
  "status": "completed|failed",
  "created_at": ISODate
}
```

**Audit Logs Collection**
```json
{
  "_id": ObjectId,
  "action": "transaction_completed|user_registered",
  "user_id": "STU001",
  "details": {...},
  "timestamp": ISODate
}
```

---

## 🔐 Core Features Deep Dive

### OTP Generation & Verification (Core Feature) ⭐

The OTP system is the heart of SWIFT's security:

**Flow:**
1. Student initiates payment at kiosk
2. Backend generates 6-digit OTP using pyotp library
3. OTP encrypted and stored in MongoDB with 5-minute TTL
4. SMS sent to registered phone (or simulated in POC)
5. Student enters OTP at kiosk interface
6. Backend verifies OTP against stored value
7. If valid: Transaction processed & marked verified
8. If invalid: Attempt counter incremented (max 3)
9. After verification: Funds transferred, receipt generated

**Security Features:**
- OTP encrypted before storage
- 5-minute expiration window
- 3-attempt limit with automatic lockout
- Transaction ID tied to OTP (cannot reuse)
- Complete audit trail for every attempt
- SMS delivery verification
- Real-time monitoring for suspicious patterns

---

## 🔒 Security

### Authentication
- JWT tokens for API authentication
- Password hashing with bcrypt
- Secure session management
- Token expiration (15 minutes default)

### Data Protection
- OTP encryption & hashing
- SQL injection prevention (SQLAlchemy ORM)
- CORS configured for same-origin requests
- Rate limiting on OTP generation (5/minute per user)
- Input validation with Pydantic

### Transaction Security
- OTP verification before fund transfer
- Transaction ID verification
- Duplicate transaction prevention
- Multi-layer authorization checks

### Audit & Compliance
- Complete transaction logging in MongoDB
- User action audit trail
- Settlement verification & reconciliation
- Timestamp on all records
- Admin-only settlement access

---

## 🚀 Future Enhancements

### Phase 2
- Real SMS gateway integration (Twilio/AWS SNS)
- Email notifications for transactions
- Advanced analytics dashboard
- Biometric authentication (fingerprint/face)
- Multi-language support

### Phase 3
- Blockchain-based settlement verification
- Integration with ERP systems
- RFID/NFC contactless payments
- Mobile app development (React Native/Flutter)
- Advanced fraud detection (ML-based)

### Phase 4
- Cryptocurrency payment option
- Integration with vendor management system
- Dynamic pricing & promotions
- Subscription-based purchases
- International payment support

---

## 📊 Performance Metrics (Expected)

- **OTP Generation:** < 100ms
- **OTP Verification:** < 150ms
- **Transaction Processing:** < 500ms
- **Page Load (Frontend):** < 1s
- **API Response Time:** < 200ms
- **Database Query:** < 50ms

---

## 👥 Team

**Design Thinking and Innovation (DTI) Project**

- **Ezhil Adhithya P.** - Team Lead & Backend Development
- **Adharsh S.** - Frontend Development & UI/UX
- **Mahesh Kumar J. R.** - Database & Security Architecture

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🤝 Contributing

### Code of Conduct
- Be respectful and inclusive
- Follow PEP 8 (Python) and ES6+ (JavaScript) standards
- Write clear, documented code
- Include tests for new features

### Process
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## ❓ FAQ

**Q: How long does OTP verification take?**
A: Typically < 150ms from submission to response.

**Q: Can I use my own payment gateway?**
A: Yes, the wallet top-up endpoint can be configured to use any payment gateway.

**Q: Is the system ACID compliant?**
A: Yes, PostgreSQL ensures ACID compliance for critical transactions.

**Q: How is settlement data secured?**
A: All settlement data is encrypted, logged in MongoDB, and requires admin verification.

**Q: Can the system handle 1000+ concurrent users?**
A: Yes, with proper database optimization and caching (Redis).

**Q: Is the OTP truly secure?**
A: Yes - encrypted storage, 5-minute TTL, 3-attempt limit, complete audit trail.

---

## 🐛 Bug Reports & Feature Requests

Please open issues on GitHub for bug reports or feature requests.

---

## 📞 Support & Contact

- **Documentation:** See project wiki for detailed guides
- **Issues:** Report issues on GitHub

---

**Last Updated:** February 2024  
**Version:** 1.0.0  
**Status:** Active Development

---

Made with ❤️ by the Team Tech Wizards
