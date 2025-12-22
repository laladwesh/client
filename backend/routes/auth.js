import express from 'express';
import { googleAuth, googleRedirect, googleCallback } from '../controllers/authController.js';
import { sendOtp, verifyOtp, createUserFromTemp } from '../controllers/authOtpController.js';

const router = express.Router();

router.get('/google', googleRedirect);
router.get('/google/callback', googleCallback);
router.post('/google', googleAuth);
router.post('/otp/send', sendOtp);
router.post('/otp/verify', verifyOtp);
router.post('/otp/create-user', createUserFromTemp);

export default router;
