import express from 'express';
import { googleAuth, googleRedirect, googleCallback } from '../controllers/authController.js';

const router = express.Router();

router.get('/google', googleRedirect);
router.get('/google/callback', googleCallback);
router.post('/google', googleAuth);

export default router;
