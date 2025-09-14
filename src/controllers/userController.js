// Backend remains the same as provided in the previous message
import { prisma } from "../server.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import twilio from "twilio";
let otpStore = {};
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);

export const registerUser = async (req, res) => {
    try {
        const { email, password, phoneNumber, fullName } = req.body;
        // Validation
        if (!email || !password || !phoneNumber) {
            return res.status(400).json({ error: 'Email, password, and phoneNumber are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }
        const existingUserByPhone = await prisma.user.findUnique({
            where: { phoneNumber }
        });
        if (existingUserByPhone) {
            return res.status(400).json({ error: 'User already exists with this phone number' });
        }
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                phoneNumber: phoneNumber,
                name: fullName,
            }
        });
        // Generate token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
        );
        // Return user data (excluding password)
        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                phoneNumber: user.phoneNumber,
                ban: false,
                createdAt: user.createdAt
            },
            token
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const loginUser = async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;
        // Validation
        if (!phoneNumber || !password) {
            return res.status(400).json({ error: 'Phone number and password are required' });
        }
        // Find user
        const user = await prisma.user.findUnique({
            where: { phoneNumber }
        });
        // Always return the same error message to prevent user enumeration
        if (!user) {
            // Simulate password verification to prevent timing attacks
            await bcrypt.compare(password, '$2a$12$fakeHashForTimingAttackPrevention');
            return res.status(400).json({ error: 'Invalid phone number or password' });
        }
        // Check if user is banned
        if (user.ban) {
            return res.status(403).json({ error: 'Your account has been banned' });
        }
        if (user.deletedAt) {
            return res.status(400).json({ error: 'Your account has been deleted' });
        }
        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid phoneNumber or password' });
        }
        // Generate token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
        );
        // Return user data (excluding password)
        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                phoneNumber: user.phoneNumber,
                ban: user.ban,
                name: user.name,
                createdAt: user.createdAt
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const sendOTPThroughPhoneNumber = async (req, res) => {
    const { phoneNumber, type } = req.body;
    if (!phoneNumber || !type) {
        return res.status(400).json({ error: "Phone number and type required" });
    }
    if (!['signup', 'reset'].includes(type)) {
        return res.status(400).json({ error: "Invalid type" });
    }
    const existingUser = await prisma.user.findUnique({
        where: { phoneNumber }
    });
    if (type === 'signup' && existingUser) {
        return res.status(400).json({ error: 'Phone already registered' });
    }
    if (type === 'reset' && !existingUser) {
        return res.status(400).json({ error: 'Phone not registered' });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    // Store OTP against phone number (with country code)
    otpStore[phoneNumber] = { otp, expiresAt };
    try {
        // Send SMS via Twilio
        const message = await twilioClient.messages.create({
            body: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
            from: "+15005550006",
            to: "+923239968789",
        });
        console.log("OTP sent successfully. SID:", message);
        res.status(200).json({
            message: "OTP sent successfully",
            sid: message.sid
        });
    } catch (error) {
        console.error("Twilio error:", error);
        res.status(500).json({ error: "Failed to send OTP" });
    }
};

export const verifyPhoneOTP = async (req, res) => {
    const { phoneNumber, otp } = req.body;
    if (!phoneNumber || !otp) {
        return res.status(400).json({ error: "Phone number and OTP required" });
    }
    const storedData = otpStore[phoneNumber];
    if (!storedData) {
        return res.status(400).json({ error: "OTP not found or expired" });
    }
    if (Date.now() > storedData.expiresAt) {
        delete otpStore[phoneNumber];
        return res.status(400).json({ error: "OTP expired" });
    }
    if (storedData.otp === otp) {
        delete otpStore[phoneNumber]; // OTP used successfully
        return res.status(200).json({ message: "OTP verified successfully" });
    } else {
        return res.status(400).json({ error: "Invalid OTP" });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { phoneNumber, newPassword } = req.body;
        if (!phoneNumber || !newPassword) {
            return res.status(400).json({ error: "Phone number and new password required" });
        }
        const user = await prisma.user.findUnique({ where: { phoneNumber } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { phoneNumber },
            data: { password: hashedPassword },
        });
        return res.json({ message: "Password reset successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
}

export const deleteAccount = async (req, res) => {
    try {
        const userId = req.userId;
        // Validate user exists
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Check if already deleted
        if (user.deletedAt) {
            return res.status(400).json({ error: 'Account already deleted' });
        }
        // Soft delete user
        await prisma.user.update({
            where: { id: parseInt(userId) },
            data: { deletedAt: new Date() },
        });
        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete account' });
    }
};

export const undoDeleteAccount = async (req, res) => {
    try {
        const { userId } = req.params;
        // Validate user exists
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (!user.deletedAt) {
            return res.status(400).json({ error: 'Account is not deleted' });
        }
        await prisma.user.update({
            where: { id: parseInt(userId) },
            data: { deletedAt: null },
        });
        res.status(200).json({ message: 'Account restored successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to undo account deletion' });
    }
};