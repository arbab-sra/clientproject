const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', [
  body('username').trim().isLength({ min: 3, max: 20 }).withMessage('Username must be 3-20 characters'),
  body('email').isEmail().withMessage('Invalid email'),
  body('phone').trim().isLength({ min: 10, max: 15 }).withMessage('Invalid phone number'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, phone, password, referralCode } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ $or: [{ email }, { phone }, { username }] });
    if (existingUser) {
      let field = existingUser.email === email ? 'Email' : existingUser.phone === phone ? 'Phone' : 'Username';
      return res.status(400).json({ error: `${field} already registered` });
    }

    // Find referrer if referral code provided
    let referrer = null;
    if (referralCode) {
      referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
      // Don't error if code is invalid, just ignore it
    }

    const SystemSettings = require('../models/SystemSettings');
    const settings = await SystemSettings.findOne() || { SIGNUP_BONUS: 15 };
    const signupBonus = settings.SIGNUP_BONUS;

    const user = new User({
      username,
      email,
      phone,
      password,
      balance: signupBonus,
      referredBy: referrer ? referrer._id : null
    });

    await user.save();

    // Record signup bonus transaction
    await new Transaction({
      userId: user._id,
      type: 'signup_bonus',
      amount: signupBonus,
      balanceAfter: signupBonus,
      status: 'completed',
      description: `Welcome bonus of ₹${signupBonus}`
    }).save();

    // Update referrer count
    if (referrer) {
      referrer.referralCount += 1;
      await referrer.save();
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        balance: user.balance,
        uid: user.uid,
        referralCode: user.referralCode,
        vipLevel: user.vipLevel,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').exists().withMessage('Password required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        balance: user.balance,
        uid: user.uid,
        referralCode: user.referralCode,
        referralCount: user.referralCount,
        referralEarnings: user.referralEarnings,
        vipLevel: user.vipLevel,
        avatar: user.avatar,
        totalDeposit: user.totalDeposit,
        totalWithdraw: user.totalWithdraw,
        language: user.language,
        notifications: user.notifications,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/auth/settings — Update user settings
router.put('/settings', auth, async (req, res) => {
  try {
    const { language, notifications } = req.body;
    const updates = {};
    if (language !== undefined) updates.language = language;
    if (notifications !== undefined) updates.notifications = notifications;

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
