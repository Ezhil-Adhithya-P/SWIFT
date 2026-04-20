// ============================================
// SWIFT OTP Verification Server
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const server = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 3000;
const MODE = process.env.MODE || 'demo';

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

// OTP config
const OTP_LENGTH = 6;
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

// Generate a random numeric OTP
function generateOTP(length = OTP_LENGTH) {
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += Math.floor(Math.random() * 10).toString();
    }
    return otp;
}

// Send OTP via Twilio (live mode only)
async function sendSMS(phoneNumber, otp) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    // Fast2SMS used mobileNumber, but Twilio expects the full phoneNumber with country code e.g. +91XXXXXXXXXX
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
// SYSTEM DATABASE (Mocked in-memory for MVP)
// ============================================

const db = {
    collegeFiatBalance: 12500, // Total actual fiat mapped to tokens
    students: {
        '21CS101': { rollNo: '21CS101', phone: process.env.VERIFIED_RECIPIENT_NUMBER, balance: 500, transactions: [] },
        '21IT105': { rollNo: '21IT105', phone: '+910000000000', balance: 1000, transactions: [] },
    },
    vendors: {
        '1': {
            id: '1', name: 'Campus Canteen', accumulatedBalance: 1450, bankAccount: 'SBI-XXXX-1234',
            products: [
                { id: '1', name: 'Veg Sandwich', internalId: 'ITM-001', stock: 15, isActive: true, price: 40 },
                { id: '2', name: 'Cold Coffee', internalId: 'ITM-002', stock: 20, isActive: true, price: 30 },
            ],
            transactions: []
        },
        '2': {
            id: '2', name: 'Stationery Shop', accumulatedBalance: 820, bankAccount: 'HDFC-XXXX-4567',
            products: [
                { id: '4', name: 'A4 Paper Rim', internalId: 'ITM-004', stock: 5, isActive: true, price: 200 },
                { id: '5', name: 'Blue Pen', internalId: 'ITM-005', stock: 50, isActive: true, price: 25 },
            ],
            transactions: []
        }
    },
    studentTopupHistory: [], // Admin sees this
};

// ============================================
// API Routes (Integration Endpoints)
// ============================================

// --- 1. STUDENT WALLET APIs ---
app.get('/api/student/:rollNo', (req, res) => {
    const student = db.students[req.params.rollNo];
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
    res.json({ success: true, student });
});

app.post('/api/student/topup', (req, res) => {
    const { rollNo, amount } = req.body;
    const student = db.students[rollNo];
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
    
    // Fiat physically transfers to college, Digital proxy is minted
    db.collegeFiatBalance += parseFloat(amount);
    student.balance += parseFloat(amount);
    
    const txn = { id: `TUP-${Date.now()}`, rollNo, amount: parseFloat(amount), date: new Date().toISOString(), type: 'TOP_UP', title: 'College Gateway Top-up' };
    student.transactions.unshift(txn);
    db.studentTopupHistory.unshift(txn);

    res.json({ success: true, balance: student.balance, transaction: txn });
});

// --- 2. KIOSK APIs ---
app.get('/api/kiosk/stores', (req, res) => {
    const stores = Object.values(db.vendors).map(v => ({ id: v.id, name: v.name }));
    res.json({ success: true, stores });
});

app.get('/api/kiosk/store/:storeId/products', (req, res) => {
    const vendor = db.vendors[req.params.storeId];
    if (!vendor) return res.status(404).json({ success: false, message: 'Store not found.' });
    res.json({ success: true, products: vendor.products.filter(p => p.isActive) });
});

app.post('/api/kiosk/checkout', (req, res) => {
    const { rollNo, storeId, amount, cart } = req.body;
    const student = db.students[rollNo];
    const vendor = db.vendors[storeId];

    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found.' });
    if (student.balance < amount) return res.status(400).json({ success: false, message: 'Insufficient College Wallet balance. Top-up required.' });

    // Deduct student, credit vendor
    student.balance -= amount;
    vendor.accumulatedBalance += amount;

    // Adjust vendor stock
    cart.forEach(cartItem => {
        const prod = vendor.products.find(p => p.id === cartItem.id);
        if (prod) prod.stock -= cartItem.quantity;
    });

    const itemsStr = cart.map(i => `${i.quantity}x ${i.name}`).join(', ');
    const date = new Date().toISOString();

    const studentTxn = { id: `TXN-${Date.now()}`, amount: amount, date: date, type: 'PURCHASE', title: `Paid at ${vendor.name}`, items: itemsStr };
    student.transactions.unshift(studentTxn);

    const vendorTxn = { id: `TXN-${Date.now()}`, rollNo, amount, date: new Date().toLocaleString(), items: itemsStr };
    vendor.transactions.unshift(vendorTxn);

    res.json({ success: true, message: `Payment of ₹${amount} successful.`, vendorName: vendor.name });
});

// --- 3. VENDOR ADMIN APIs ---
app.get('/api/vendor/:storeId', (req, res) => {
    const vendor = db.vendors[req.params.storeId];
    if (!vendor) return res.status(404).json({ success: false, message: 'Store not found.' });
    res.json({ success: true, vendor });
});

app.post('/api/vendor/:storeId/product', (req, res) => {
    const vendor = db.vendors[req.params.storeId];
    // Simple add logic for simulation
    const newProduct = { ...req.body, id: Date.now().toString(), isActive: true };
    vendor.products.push(newProduct);
    res.json({ success: true, vendor });
});

app.post('/api/vendor/:storeId/product/toggle', (req, res) => {
    const { productId } = req.body;
    const vendor = db.vendors[req.params.storeId];
    const p = vendor.products.find(p => p.id === productId);
    if(p) p.isActive = !p.isActive;
    res.json({ success: true, vendor });
});

// --- 4. COLLEGE ADMIN APIs ---
app.get('/api/admin/dashboard', (req, res) => {
    const totalPendingPayout = Object.values(db.vendors).reduce((acc, v) => acc + v.accumulatedBalance, 0);
    const vendorBalances = Object.values(db.vendors).map(v => ({
        id: v.id, name: v.name, bankAccount: v.bankAccount, accumulatedBalance: v.accumulatedBalance
    }));

    res.json({
        success: true,
        collegeFiatBalance: db.collegeFiatBalance,
        totalPendingPayout,
        vendorBalances,
        topupHistory: db.studentTopupHistory
    });
});

app.post('/api/admin/settle', (req, res) => {
    // Run Midnight Batch Process
    Object.values(db.vendors).forEach(vendor => {
        vendor.accumulatedBalance = 0; // simulating bank transfer logic happening externally
    });
    res.json({ success: true, message: 'Midnight batch settlement complete.' });
});

// POST /api/send-otp
// Body: { phoneNumber: "+91XXXXXXXXXX" }
app.post('/api/send-otp', async (req, res) => {
    try {
        let { phoneNumber } = req.body;

        if (!phoneNumber || phoneNumber.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required.',
            });
        }
        phoneNumber = String(phoneNumber);
        // Hack for Kiosk app checkout: If this is a roll number, map it to the student's registered phone
        if (phoneNumber.startsWith('21')) { // e.g. "21CS101"
            const student = db.students[phoneNumber];
            if (!student) {
                return res.status(404).json({ success: false, message: 'Roll Number not found in database.' });
            }
            phoneNumber = student.phone; // Override the payload with actual phone
        }

        const cleaned = phoneNumber.replace(/\D/g, '');

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = Date.now() + OTP_EXPIRY_MS;

        // Store OTP
        otpStore.set(cleaned, { otp, expiresAt });

        console.log(`[${MODE.toUpperCase()}] OTP for ${phoneNumber}: ${otp}`);

        if (MODE === 'live') {
            // Send via Twilio
            await sendSMS(phoneNumber, otp);
            return res.json({
                success: true,
                message: 'OTP sent successfully to your phone number.',
                mode: 'live',
            });
        } else if (MODE === 'lan') {
            // Send via WebSockets to connected phone
            io.emit('receive_otp', { phoneNumber, otp });
            return res.json({
                success: true,
                message: 'OTP sent to your phone via Local Network.',
                mode: 'lan',
            });
        } else {
            // Demo mode — return OTP in response
            return res.json({
                success: true,
                message: 'OTP generated successfully (Demo Mode).',
                mode: 'demo',
                otp: otp, // Only exposed in demo mode!
            });
        }
    } catch (error) {
        console.error('Error sending OTP:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to send OTP. Please try again.',
        });
    }
});

// POST /api/verify-otp
// Body: { phoneNumber: "+91XXXXXXXXXX", otp: "123456" }
app.post('/api/verify-otp', async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;

        if (!phoneNumber || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Phone number and OTP are required.',
            });
        }
        
        let cleaned = phoneNumber.replace(/\D/g, '');
        // Hack for Kiosk: If the student entered a physical Roll Number instead of a phone number during checkout, resolve it to their phone.
        if (phoneNumber.startsWith('21')) { // Mock hack recognizing roll numbers
            const student = db.students[phoneNumber];
            if (student) {
                cleaned = student.phone.replace(/\D/g, '');
            }
        }
        const stored = otpStore.get(cleaned);

        if (!stored) {
            return res.json({
                success: false,
                message: 'No OTP found for this number. Please request a new one.',
            });
        }

        // Check expiry
        if (Date.now() > stored.expiresAt) {
            otpStore.delete(cleaned);
            return res.json({
                success: false,
                message: 'OTP has expired. Please request a new one.',
            });
        }

        // Verify
        if (stored.otp === otp.trim()) {
            otpStore.delete(cleaned); // One-time use
            return res.json({
                success: true,
                message: 'OTP verified successfully!',
            });
        } else {
            return res.json({
                success: false,
                message: 'Invalid OTP. Please try again.',
            });
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return res.status(500).json({
            success: false,
            message: 'Verification failed. Please try again.',
        });
    }
});

// Serve the custom receiver html
app.get('/receiver', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'receiver.html'));
});

// Serve the frontend (catch-all fallback)
app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && req.path !== '/receiver') {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        next();
    }
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 SWIFT OTP Server running!`);
    console.log(`💻 Laptop URL: http://localhost:${PORT}`);
    
    // Get local network IP for the phone
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    let localIp = 'localhost';
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                localIp = net.address;
            }
        }
    }
    
    if (MODE === 'lan') {
         console.log(`📱 Phone URL (Hotspot Hack): http://${localIp}:${PORT}/receiver`);
    }

    console.log(`📱 Mode: ${MODE.toUpperCase()}`);
    if (MODE === 'demo') {
        console.log(`ℹ️  Demo mode: OTP will be displayed on screen (no SMS sent)\n`);
    } else if (MODE === 'lan') {
        console.log(`📶 LAN mode: Open the Phone URL on your mobile browser over hotspot!\n`);
    } else {
        console.log(`📨 Live mode: OTP will be sent via Twilio SMS\n`);
    }
});
