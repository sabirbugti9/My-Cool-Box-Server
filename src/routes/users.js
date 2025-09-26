import express from 'express';
import { body, validationResult } from 'express-validator';
import upload from '../utils/upload.js';

import {
    registerUser,
    loginUser,

    resetPassword,

    sendOTPThroughPhoneNumber,
    verifyPhoneOTP,
    deleteAccount,
    undoDeleteAccount,
    updateProfile
} from '../controllers/userController.js';

import { auth } from "../middleware/auth.js";
const router = express.Router();

// Register or get user by device ID
router.post('/register', async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    await registerUser(req, res);
});
router.post('/send-otp', sendOTPThroughPhoneNumber);
router.post('/verify-otp', verifyPhoneOTP);

router.post('/login', async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    await loginUser(req, res);
});

router.post('/reset-password', resetPassword);
router.put('/active_account', auth, undoDeleteAccount);
router.delete('/delete_account', auth, deleteAccount);
router.put('/profile', auth, upload.single('profilePicture'), updateProfile);




export default router;