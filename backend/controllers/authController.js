import { OAuth2Client } from 'google-auth-library';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback'
);

// GET /api/auth/google - Redirect to Google OAuth
const googleRedirect = (req, res) => {
  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email']
  });
  res.redirect(url);
};

// GET /api/auth/google/callback - Handle Google callback
const googleCallback = asyncHandler(async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.redirect('http://localhost:3000/sign-up?error=no_code');
  }

  try {
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);
    
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ googleId });
    
    if (!user) {
      user = await User.create({ 
        googleId, 
        name, 
        email, 
        avatar: picture 
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    // Redirect to frontend with token
    res.redirect(`http://localhost:3000/sign-up?token=${token}&user=${encodeURIComponent(JSON.stringify({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role
    }))}`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect('http://localhost:3000/sign-up?error=auth_failed');
  }
});

// POST /api/auth/google
const googleAuth = asyncHandler(async (req, res) => {
  const { credential, googleId, email, name, avatar } = req.body;
  
  // Handle direct user info (from useGoogleLogin with access token)
  if (googleId && email && name) {
    console.log('Direct user info received:', { googleId, email, name });
    
    let user = await User.findOne({ googleId });
    
    if (!user) {
      user = await User.create({ 
        googleId, 
        name, 
        email, 
        avatar 
      });
      console.log('New user created:', user);
    } else {
      console.log('Existing user found:', user);
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    return res.json({ 
      token, 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role
      }
    });
  }
  
  // Handle credential token (from GoogleLogin component)
  if (!credential) {
    res.status(400);
    throw new Error('Google credential or user info is required');
  }

  try {
    const ticket = await client.verifyIdToken({ 
      idToken: credential, 
      audience: process.env.GOOGLE_CLIENT_ID 
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    console.log('Google user from credential:', { googleId, email, name });

    let user = await User.findOne({ googleId });
    
    if (!user) {
      user = await User.create({ 
        googleId, 
        name, 
        email, 
        avatar: picture 
      });
      console.log('New user created:', user);
    } else {
      console.log('Existing user found:', user);
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({ 
      token, 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401);
    throw new Error('Invalid Google credential');
  }
});

export { googleAuth, googleRedirect, googleCallback };
