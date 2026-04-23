// ============================================
// SWIFT API Server with MySQL DB Integration
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');

const app = express();
const server = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 3000;
const MODE = process.env.MODE || 'live';

// Socket.IO connection handler
io.on('connection', (socket) => {
    console.log(`📡 Phone connected to Local Socket: ${socket.id}`);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory OTP store: { phoneNumber: { otp, expiresAt } }
const otpStore = new Map();

// Nodemailer config for Forgot Password
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'test@gmail.com',
        pass: process.env.EMAIL_PASS || 'password'
    }
});

// OTP config
const OTP_LENGTH = 6;
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

function generateOTP(length = OTP_LENGTH) {
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += Math.floor(Math.random() * 10).toString();
    }
    return otp;
}

async function sendSMS(phoneNumber, otp) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    const client = require('twilio')(accountSid, authToken);
    console.log(`\n📞 Attempting to send SMS to: ${phoneNumber} via Twilio`);

    const message = await client.messages.create({
        body: `Your SWIFT verification code is: ${otp}. Valid for 5 minutes.`,
        from: twilioPhone,
        to: phoneNumber,
    });

    console.log(`✅ SMS sent via Twilio to ${phoneNumber} (SID: ${message.sid})`);
    return message.sid;
}

// ============================================
// MYSQL DATABASE INITIALIZATION
// ============================================
let db;

async function initDB() {
    // 1. Establish initial connection without a database to create it
    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: 'pass123'
    });

    await connection.query('CREATE DATABASE IF NOT EXISTS swift_db');
    await connection.end();

    // 2. Connect to the specifically created swift_db database pool
    db = mysql.createPool({
        host: '127.0.0.1',
        user: 'root',
        password: 'pass123',
        database: 'swift_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    // 3. Create all relational tables mapped to your requirements
    await db.query(`
        CREATE TABLE IF NOT EXISTS Students (
            RollNo VARCHAR(50) PRIMARY KEY,
            Name VARCHAR(100),
            YearOfStudy INT,
            Department VARCHAR(100),
            Phone VARCHAR(20),
            Email VARCHAR(100) DEFAULT '',
            Password VARCHAR(100) DEFAULT 'password123',
            WalletBalance DECIMAL(10, 2) DEFAULT 0.0,
            TotalAmountAdded DECIMAL(10, 2) DEFAULT 0.0,
            LatestAmountAdded DECIMAL(10, 2) DEFAULT 0.0
        )
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS Vendors (
            VendorID VARCHAR(50) PRIMARY KEY,
            Name VARCHAR(100),
            BankAccount VARCHAR(100),
            PendingLedgerBalance DECIMAL(10, 2) DEFAULT 0.0
        )
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS Products (
            ProductID VARCHAR(50) PRIMARY KEY,
            VendorID VARCHAR(50),
            Name VARCHAR(100),
            InternalID VARCHAR(50),
            Price DECIMAL(10, 2),
            Stock INT,
            IsActive TINYINT(1) DEFAULT 1,
            FOREIGN KEY (VendorID) REFERENCES Vendors(VendorID)
        )
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS Transactions (
            TransactionID VARCHAR(50) PRIMARY KEY,
            RollNo VARCHAR(50),
            VendorID VARCHAR(50),
            Amount DECIMAL(10, 2),
            Type VARCHAR(50),
            Title VARCHAR(255),
            Items TEXT,
            Timestamp VARCHAR(100)
        )
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS CollegeFiat (
            Id INT PRIMARY KEY,
            Balance DECIMAL(15, 2) DEFAULT 0.0
        )
    `);

    // 4. Seed default Mock Data if tables are completely empty
    const [rows] = await db.query('SELECT COUNT(*) as c FROM Students');
    if (rows[0].c === 0) {
        console.log("🌱 Seeding MySQL database with mock data...");
        await db.query('INSERT IGNORE INTO CollegeFiat (Id, Balance) VALUES (1, 12500)');

        await db.query('INSERT INTO Students (RollNo, Name, YearOfStudy, Department, Phone, WalletBalance, TotalAmountAdded, LatestAmountAdded) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            ['21CS101', 'Test Student 1', 3, 'CSE', process.env.VERIFIED_RECIPIENT_NUMBER || '+910000000000', 500, 500, 500]);
        await db.query('INSERT INTO Students (RollNo, Name, YearOfStudy, Department, Phone, WalletBalance, TotalAmountAdded, LatestAmountAdded) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            ['21IT105', 'Test Student 2', 3, 'IT', '+910000000000', 1000, 1000, 1000]);

        await db.query('INSERT INTO Vendors (VendorID, Name, BankAccount, PendingLedgerBalance) VALUES (?, ?, ?, ?)', ['1', 'Campus Canteen', 'SBI-XXXX-1234', 1450]);
        await db.query('INSERT INTO Vendors (VendorID, Name, BankAccount, PendingLedgerBalance) VALUES (?, ?, ?, ?)', ['2', 'Stationery Shop', 'HDFC-XXXX-4567', 820]);

        await db.query('INSERT INTO Products (ProductID, VendorID, Name, InternalID, Price, Stock, IsActive) VALUES (?, ?, ?, ?, ?, ?, ?)', ['1', '1', 'Veg Sandwich', 'ITM-001', 40, 15, 1]);
        await db.query('INSERT INTO Products (ProductID, VendorID, Name, InternalID, Price, Stock, IsActive) VALUES (?, ?, ?, ?, ?, ?, ?)', ['2', '1', 'Cold Coffee', 'ITM-002', 30, 20, 1]);
        await db.query('INSERT INTO Products (ProductID, VendorID, Name, InternalID, Price, Stock, IsActive) VALUES (?, ?, ?, ?, ?, ?, ?)', ['4', '2', 'A4 Paper Rim', 'ITM-004', 200, 5, 1]);
        await db.query('INSERT INTO Products (ProductID, VendorID, Name, InternalID, Price, Stock, IsActive) VALUES (?, ?, ?, ?, ?, ?, ?)', ['5', '2', 'Blue Pen', 'ITM-005', 25, 50, 1]);
    }
}

// ============================================
// API Routes (MySQL Integration)
// ============================================

// --- 0. STUDENT AUTH APIs ---
app.post('/api/student/login', async (req, res) => {
    try {
        const { rollNo, password } = req.body;
        const [students] = await db.query('SELECT * FROM Students WHERE RollNo = ?', [rollNo]);
        const student = students[0];
        
        if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
        if (student.Password !== password) return res.status(401).json({ success: false, message: 'Invalid password.' });
        
        res.json({ success: true, message: 'Login successful', rollNo: student.RollNo });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/student/forgot-password', async (req, res) => {
    try {
        const { rollNo } = req.body;
        const [students] = await db.query('SELECT * FROM Students WHERE RollNo = ?', [rollNo]);
        const student = students[0];
        
        if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
        
        const otp = generateOTP();
        const expiresAt = Date.now() + OTP_EXPIRY_MS;
        otpStore.set(rollNo, { otp, expiresAt });
        
        // Try sending Email
        if (student.Email) {
            const mailOptions = {
                from: process.env.EMAIL_USER || 'noreply@swift.edu',
                to: student.Email,
                subject: 'SWIFT Wallet - Password Reset OTP',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #6C63FF; border-bottom: 2px solid #eee; padding-bottom: 10px;">SWIFT Security Alert</h2>
                        <p>Hello <b>${student.Name}</b>,</p>
                        <p>We received a request to reset your SWIFT Student Wallet password.</p>
                        <p>Your One-Time Password (OTP) is: <strong style="font-size: 24px; color: #E74C3C;">${otp}</strong></p>
                        <p>This code expires in 5 minutes. Do not share it with anyone.</p>
                    </div>
                `
            };
            try {
                await transporter.sendMail(mailOptions);
                console.log(`✉️ Email OTP sent to ${student.Email}`);
            } catch (err) {
                console.log(`⚠️ Email failed (check credentials). Sent OTP locally: ${otp}`);
            }
        }
        
        // Also send SMS to registered phone via Twilio
        if (student.Phone && MODE === 'live') {
            await sendSMS(student.Phone, otp);
        }
        
        res.json({ success: true, message: 'OTP sent to your registered Email and Phone.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/student/reset-password', async (req, res) => {
    try {
        const { rollNo, otp, newPassword } = req.body;
        
        const stored = otpStore.get(rollNo);
        if (!stored) return res.status(400).json({ success: false, message: 'No OTP requested or expired.' });
        if (Date.now() > stored.expiresAt) {
            otpStore.delete(rollNo);
            return res.status(400).json({ success: false, message: 'OTP expired.' });
        }
        if (stored.otp !== otp.trim()) return res.status(400).json({ success: false, message: 'Invalid OTP.' });
        
        // Valid OTP, reset password
        await db.query('UPDATE Students SET Password = ? WHERE RollNo = ?', [newPassword, rollNo]);
        otpStore.delete(rollNo);
        
        res.json({ success: true, message: 'Password reset successfully! You can now log in.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- KIOSK OTP SYSTEM ---
app.post('/api/send-otp', async (req, res) => {
    try {
        const { phoneNumber } = req.body; // In Kiosk, this is the RollNo
        const [students] = await db.query('SELECT Phone FROM Students WHERE RollNo = ?', [phoneNumber]);
        const student = students[0];
        
        if (!student) return res.status(404).json({ success: false, message: 'Roll number not found in registry.' });

        const otp = generateOTP();
        const expiresAt = Date.now() + OTP_EXPIRY_MS;
        otpStore.set(phoneNumber, { otp, expiresAt });

        console.log(`\n🔑 KIOSK OTP FOR ${phoneNumber}: ${otp}`);

        if (MODE === 'live' && student.Phone) {
            try {
                await sendSMS(student.Phone, otp);
            } catch (err) {
                console.log("⚠️ Twilio failed. Falling back to local console for testing.");
            }
        }

        res.json({ success: true, message: 'OTP sent to registered phone.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Fail to send OTP: ' + err.message });
    }
});

app.post('/api/verify-otp', async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;
        const stored = otpStore.get(phoneNumber);

        if (!stored) return res.status(400).json({ success: false, message: 'OTP expired or not requested.' });
        if (Date.now() > stored.expiresAt) {
            otpStore.delete(phoneNumber);
            return res.status(400).json({ success: false, message: 'OTP has expired.' });
        }

        if (stored.otp === otp.trim()) {
            otpStore.delete(phoneNumber);
            res.json({ success: true, message: 'OTP verified.' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid verification code.' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- 1. STUDENT WALLET APIs ---
app.get('/api/student/:rollNo', async (req, res) => {
    try {
        const [students] = await db.query('SELECT * FROM Students WHERE RollNo = ?', [req.params.rollNo]);
        const student = students[0];
        if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

        const [txns] = await db.query('SELECT * FROM Transactions WHERE RollNo = ? ORDER BY Timestamp DESC', [req.params.rollNo]);

        res.json({
            success: true,
            student: {
                rollNo: student.RollNo,
                name: student.Name,
                department: student.Department,
                yearOfStudy: student.YearOfStudy,
                phone: student.Phone,
                balance: Number(student.WalletBalance),
                totalAmountAdded: Number(student.TotalAmountAdded),
                latestAmountAdded: Number(student.LatestAmountAdded),
                transactions: txns.map(t => ({
                    id: t.TransactionID,
                    amount: Number(t.Amount),
                    date: t.Timestamp,
                    type: t.Type,
                    title: t.Title,
                    items: t.Items
                }))
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/student/topup', async (req, res) => {
    try {
        const { rollNo, amount } = req.body;
        const [students] = await db.query('SELECT * FROM Students WHERE RollNo = ?', [rollNo]);
        if (!students[0]) return res.status(404).json({ success: false, message: 'Student not found.' });

        const topupAmt = parseFloat(amount);

        await db.query('UPDATE CollegeFiat SET Balance = Balance + ? WHERE Id = 1', [topupAmt]);
        await db.query('UPDATE Students SET WalletBalance = WalletBalance + ?, TotalAmountAdded = TotalAmountAdded + ?, LatestAmountAdded = ? WHERE RollNo = ?',
            [topupAmt, topupAmt, topupAmt, rollNo]);

        const txnId = `TUP-${Math.floor(Math.random() * 90000) + 10000}`;
        const timestamp = new Date().toISOString();

        await db.query('INSERT INTO Transactions (TransactionID, RollNo, Amount, Type, Title, Timestamp) VALUES (?, ?, ?, ?, ?, ?)',
            [txnId, rollNo, topupAmt, 'TOP_UP', 'College Gateway Top-up', timestamp]);

        const [updatedStudents] = await db.query('SELECT WalletBalance FROM Students WHERE RollNo = ?', [rollNo]);

        res.json({
            success: true,
            balance: Number(updatedStudents[0].WalletBalance),
            transaction: { id: txnId, amount: topupAmt, date: timestamp, type: 'TOP_UP', title: 'College Gateway Top-up' }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- 2. KIOSK APIs ---
app.get('/api/kiosk/stores', async (req, res) => {
    try {
        const [stores] = await db.query('SELECT VendorID as id, Name as name FROM Vendors');
        res.json({ success: true, stores });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/kiosk/store/:storeId/products', async (req, res) => {
    try {
        const [vendors] = await db.query('SELECT * FROM Vendors WHERE VendorID = ?', [req.params.storeId]);
        if (!vendors[0]) return res.status(404).json({ success: false, message: 'Store not found.' });

        const [products] = await db.query('SELECT ProductID as id, Name as name, InternalID as internalId, Price as price, Stock as stock, IsActive as isActive FROM Products WHERE VendorID = ? AND IsActive = 1', [req.params.storeId]);

        res.json({ success: true, products: products.map(p => ({ ...p, isActive: Boolean(p.isActive) })) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/kiosk/checkout', async (req, res) => {
    try {
        const { rollNo, storeId, amount, cart } = req.body;
        const [students] = await db.query('SELECT * FROM Students WHERE RollNo = ?', [rollNo]);
        const [vendors] = await db.query('SELECT * FROM Vendors WHERE VendorID = ?', [storeId]);

        const student = students[0];
        const vendor = vendors[0];

        if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
        if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found.' });
        if (Number(student.WalletBalance) < amount) return res.status(400).json({ success: false, message: 'Insufficient College Wallet balance. Top-up required.' });

        await db.query('UPDATE Students SET WalletBalance = WalletBalance - ? WHERE RollNo = ?', [amount, rollNo]);
        await db.query('UPDATE Vendors SET PendingLedgerBalance = PendingLedgerBalance + ? WHERE VendorID = ?', [amount, storeId]);

        // Adjust vendor stock
        for (const cartItem of cart) {
            await db.query('UPDATE Products SET Stock = Stock - ? WHERE ProductID = ?', [cartItem.quantity, cartItem.id]);
        }

        const itemsStr = cart.map(i => `${i.name}|${i.quantity}|${i.price}|${i.price * i.quantity}`).join(';;');
        const date = new Date().toISOString();
        const txnId = `TXN-${Math.floor(Math.random() * 90000) + 10000}`;

        await db.query('INSERT INTO Transactions (TransactionID, RollNo, VendorID, Amount, Type, Title, Items, Timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [txnId, rollNo, storeId, amount, 'PURCHASE', `Paid at ${vendor.Name}`, itemsStr, date]);

        res.json({ success: true, message: `Payment of ₹${amount} successful.`, vendorName: vendor.Name });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- 3. VENDOR ADMIN APIs ---
app.post('/api/vendor/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const [vendors] = await db.query('SELECT VendorID, Name FROM Vendors WHERE Username = ? AND Password = ?', [username, password]);
        
        if (vendors[0]) {
            res.json({ success: true, vendorId: vendors[0].VendorID, vendorName: vendors[0].Name });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/vendor/:storeId', async (req, res) => {
    try {
        const [vendors] = await db.query('SELECT * FROM Vendors WHERE VendorID = ?', [req.params.storeId]);
        const vendor = vendors[0];
        if (!vendor) return res.status(404).json({ success: false, message: 'Store not found.' });

        const [products] = await db.query('SELECT ProductID as id, Name as name, InternalID as internalId, Price as price, Stock as stock, IsActive as isActive FROM Products WHERE VendorID = ?', [req.params.storeId]);
        const [txns] = await db.query('SELECT * FROM Transactions WHERE VendorID = ? ORDER BY Timestamp DESC', [req.params.storeId]);

        res.json({
            success: true,
            vendor: {
                id: vendor.VendorID,
                name: vendor.Name,
                accumulatedBalance: Number(vendor.PendingLedgerBalance),
                bankAccount: vendor.BankAccount,
                products: products.map(p => ({ ...p, price: Number(p.price), isActive: Boolean(p.isActive) })),
                transactions: txns.map(t => ({ id: t.TransactionID, rollNo: t.RollNo, amount: Number(t.Amount), date: t.Timestamp, items: t.Items }))
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/vendor/:storeId/product', async (req, res) => {
    try {
        const { name, internalId, price, stock } = req.body;
        const vendorId = req.params.storeId;
        await db.query('INSERT INTO Products (VendorID, Name, InternalID, Price, Stock, IsActive) VALUES (?, ?, ?, ?, ?, 1)',
            [vendorId, name, internalId, price, stock]);
        res.json({ success: true, message: 'Product added successfully to Kiosk!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/vendor/:storeId/product/toggle', async (req, res) => {
    try {
        const { productId } = req.body;
        await db.query('UPDATE Products SET IsActive = CASE WHEN IsActive = 1 THEN 0 ELSE 1 END WHERE ProductID = ?', [productId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- 4. COLLEGE ADMIN APIs ---
app.get('/api/admin/dashboard', async (req, res) => {
    try {
        const [fiats] = await db.query('SELECT Balance FROM CollegeFiat WHERE Id = 1');
        const fiat = fiats[0];
        
        const [vendors] = await db.query('SELECT VendorID as id, Name as name, BankAccount as bankAccount, PendingLedgerBalance as accumulatedBalance FROM Vendors');
        const totalPendingPayout = vendors.reduce((acc, v) => acc + Number(v.accumulatedBalance), 0);
        
        const [students] = await db.query('SELECT RollNo as rollNo, Name as name, Phone as phone, WalletBalance as balance FROM Students');
        const [volumeResult] = await db.query('SELECT SUM(Amount) as totalVolume FROM Transactions');
        
        // Detailed Top-up history
        const [topups] = await db.query("SELECT TransactionID as id, RollNo as rollNo, Amount as amount, Timestamp as date FROM Transactions WHERE Type = 'TOP_UP' ORDER BY Timestamp DESC");
        
        res.json({
            success: true,
            collegeFiatBalance: fiat ? Number(fiat.Balance) : 0,
            totalPendingPayout,
            totalVolume: volumeResult[0]?.totalVolume || 0,
            studentCount: students.length,
            vendorBalances: vendors.map(v => ({ ...v, balance: Number(v.accumulatedBalance) })),
            students: students.map(s => ({ ...s, balance: Number(s.balance) })),
            topupHistory: topups.map(t => ({ ...t, amount: Number(t.amount) }))
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/admin/settle', async (req, res) => {
    try {
        await db.query('UPDATE Vendors SET PendingLedgerBalance = 0');
        res.json({ success: true, message: 'Midnight batch settlement complete. Database reset.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- NEW PRIVILEGED ADMIN APIs FOR CREATION ---
app.post('/api/admin/student', async (req, res) => {
    try {
        const { rollNo, name, phone, balance } = req.body;
        await db.query('INSERT INTO Students (RollNo, Name, Phone, WalletBalance) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE WalletBalance = WalletBalance + ?',
            [rollNo, name, phone, balance || 0, balance || 0]);
        res.json({ success: true, message: 'Student wallet provisioned successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/admin/shop', async (req, res) => {
    try {
        const { name, username, password, bankAccount } = req.body;
        await db.query('INSERT INTO Vendors (Name, Username, Password, BankAccount) VALUES (?, ?, ?, ?)',
            [name, username, password, bankAccount]);
        res.json({ success: true, message: 'New shop commissioned successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/admin/vendor', async (req, res) => {
    try {
        const { vendorId, name, bankAccount } = req.body;
        await db.query('INSERT INTO Vendors (VendorID, Name, BankAccount) VALUES (?, ?, ?)',
            [vendorId, name, bankAccount]);
        res.json({ success: true, message: 'Vendor created successfully in MySQL!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/send-otp
app.post('/api/send-otp', async (req, res) => {
    try {
        let { phoneNumber } = req.body;

        if (!phoneNumber || phoneNumber.trim() === '') {
            return res.status(400).json({ success: false, message: 'Phone number is required.' });
        }
        phoneNumber = String(phoneNumber);

        if (phoneNumber.startsWith('21')) {
            const [students] = await db.query('SELECT Phone FROM Students WHERE RollNo = ?', [phoneNumber]);
            if (!students[0]) {
                return res.status(404).json({ success: false, message: 'Roll Number not found in database.' });
            }
            phoneNumber = students[0].Phone;
        }

        const cleaned = phoneNumber.replace(/\D/g, '');
        const otp = generateOTP();
        const expiresAt = Date.now() + OTP_EXPIRY_MS;

        otpStore.set(cleaned, { otp, expiresAt });
        console.log(`[${MODE.toUpperCase()}] OTP for ${phoneNumber}: ${otp}`);

        if (MODE === 'live') {
            await sendSMS(phoneNumber, otp);
            return res.json({ success: true, message: 'OTP sent successfully via MySQL + Twilio.' });
        } else {
            return res.json({ success: true, message: 'OTP generated (Demo)', otp: otp });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to send OTP.' });
    }
});

// POST /api/verify-otp
app.post('/api/verify-otp', async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;
        if (!phoneNumber || !otp) return res.status(400).json({ success: false, message: 'Required.' });

        let cleaned = phoneNumber.replace(/\D/g, '');
        if (phoneNumber.startsWith('21')) {
            const [students] = await db.query('SELECT Phone FROM Students WHERE RollNo = ?', [phoneNumber]);
            if (students[0]) cleaned = students[0].Phone.replace(/\D/g, '');
        }

        const stored = otpStore.get(cleaned);
        if (!stored) return res.json({ success: false, message: 'No OTP found.' });
        if (Date.now() > stored.expiresAt) {
            otpStore.delete(cleaned);
            return res.json({ success: false, message: 'OTP expired.' });
        }

        if (stored.otp === otp.trim()) {
            otpStore.delete(cleaned);
            return res.json({ success: true, message: 'OTP verified successfully via MySQL Engine!' });
        } else {
            return res.json({ success: false, message: 'Invalid OTP.' });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Verification failed.' });
    }
});

// Serve frontend routing fallback
app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        next();
    }
});

// Initialize DB and Start Server
initDB().then(() => {
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`\n🚀 SWIFT Server running strictly on MySQL Architecture!`);
        console.log(`💻 URL: http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error("Failed to initialize MySQL database:", err);
});
