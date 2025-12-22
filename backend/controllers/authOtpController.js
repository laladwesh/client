import asyncHandler from 'express-async-handler';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import dotenv from 'dotenv';
dotenv.config();

// Configure transporter via env variables
function createTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;

  if (!user || !pass) {
    console.warn('SMTP credentials not found in env (SMTP_USER/SMTP_PASS). OTP emails will fail.');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: user && pass ? { user, pass } : undefined,
  });
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/auth/otp/send
const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }
  const emailNorm = String(email).trim().toLowerCase();

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + (5 * 60 * 1000)); // 5 minutes
  // upsert OTP in DB
  await Otp.findOneAndUpdate(
    { email: emailNorm },
    { code, expiresAt },
    { upsert: true, new: true }
  );

  // send mail
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: emailNorm,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${code}. It expires in 5 minutes.`,
      html: `<p>Your OTP code is: <strong>${code}</strong></p><p>It expires in 5 minutes.</p>`
    });

    return res.json({ ok: true, message: 'OTP sent' });
  } catch (err) {
    console.error('Failed to send OTP email', err);
    // Even if email sending fails, keep the OTP in DB so devs can verify manually
    res.status(500);
    throw new Error('Failed to send OTP email');
  }
});

// POST /api/auth/otp/verify
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    res.status(400);
    throw new Error('Email and code are required');
  }
  // find OTP in DB
  const emailNorm = String(email).trim().toLowerCase();
  const entry = await Otp.findOne({ email: emailNorm, code });
  if (!entry) {
    res.status(400);
    throw new Error('No OTP requested for this email or invalid code');
  }
  if (new Date() > entry.expiresAt) {
    // remove expired OTP
    await Otp.deleteOne({ _id: entry._id });
    res.status(400);
    throw new Error('OTP expired');
  }

  // valid OTP -> check if user exists
  let user = await User.findOne({ email: emailNorm });
  if (user) {
    // existing user - issue regular token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    // cleanup - remove used OTP
    await Otp.deleteOne({ _id: entry._id });
    return res.json({ token, user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role } });
  }

  // new user - do NOT create yet. issue a short-lived temp token so frontend can collect name and create account.
  // delete OTP so it can't be reused
  await Otp.deleteOne({ _id: entry._id });
  const tempToken = jwt.sign({ email: emailNorm, temp: true }, process.env.JWT_SECRET, { expiresIn: '5m' });
  return res.json({ needsName: true, tempToken });
});

// POST /api/auth/otp/create-user
const createUserFromTemp = asyncHandler(async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    res.status(401);
    throw new Error('Missing temp token');
  }
  const token = auth.split(' ')[1];
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    res.status(401);
    throw new Error('Invalid or expired temp token');
  }
  if (!payload?.temp || !payload?.email) {
    res.status(401);
    throw new Error('Invalid temp token payload');
  }

  const { name } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Name is required');
  }

  const email = String(payload.email).trim().toLowerCase();
  // Ensure user doesn't exist (race)
  let user = await User.findOne({ email });
  if (user) {
    res.status(400);
    throw new Error('User already exists');
  }

  user = await User.create({ name, email });
  const fullToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  return res.json({ token: fullToken, user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role } });
});

export { sendOtp, verifyOtp, createUserFromTemp };