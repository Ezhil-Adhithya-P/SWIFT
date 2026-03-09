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
// API Routes
// ============================================

// POST /api/send-otp
// Body: { phoneNumber: "+91XXXXXXXXXX" }
app.post('/api/send-otp', async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber || phoneNumber.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required.',
            });
        }

        // Simple phone validation (at least 10 digits)
        const cleaned = phoneNumber.replace(/\D/g, '');
        if (cleaned.length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid phone number (at least 10 digits).',
            });
        }

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

        const cleaned = phoneNumber.replace(/\D/g, '');
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
