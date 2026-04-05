const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const router = express.Router();



// GET /api/wallet/balance
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('balance totalDeposit totalWithdraw totalBet totalWin');
    const SystemSettings = require('../models/SystemSettings');
    const settings = await SystemSettings.findOne() || {};

    res.json({
      balance: user.balance,
      totalDeposit: user.totalDeposit,
      totalWithdraw: user.totalWithdraw,
      totalBet: user.totalBet,
      totalWin: user.totalWin,
      withdrawable: Math.max(0, user.balance - (user.totalBet < user.totalDeposit ? user.totalDeposit - user.totalBet : 0)),
      deposit_qr: settings.DEPOSIT_QR_IMAGE || '',
      min_deposit: settings.MIN_DEPOSIT || 20,
      max_deposit: settings.MAX_DEPOSIT || 10000,
      upi_id: settings.UPI_ID || ''
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/wallet/deposit
router.post('/deposit', auth, [
  body('amount').isFloat().withMessage('Amount must be a valid number'),
  body('utr').isLength({ min: 12, max: 12 }).withMessage('Must provide a valid 12-digit UTR/Reference Number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { amount, utr, method } = req.body;
    const user = await User.findById(req.userId);

    const SystemSettings = require('../models/SystemSettings');
    const settings = await SystemSettings.findOne() || { MIN_DEPOSIT: 20, MAX_DEPOSIT: 10000 };
    if (amount < settings.MIN_DEPOSIT || amount > settings.MAX_DEPOSIT) {
      return res.status(400).json({ error: `Deposit must be ₹${settings.MIN_DEPOSIT} - ₹${settings.MAX_DEPOSIT}` });
    }

    // Create a pending deposit transaction
    const transaction = await new Transaction({
      userId: user._id,
      type: 'deposit',
      amount: amount,
      balanceAfter: user.balance, // Balance does not increase yet in a pending status
      status: 'pending',
      method: method || 'upi',
      description: `Pending Manual Deposit. UTR: ${utr}`,
      accountDetails: utr // Storing UTR in accountDetails for easy lookup
    }).save();

    res.json({
      success: true,
      message: 'Deposit request submitted successfully! Pending admin verification.',
      transaction: transaction
    });
  } catch (error) {
    console.error('Manual deposit error:', error);
    res.status(500).json({ error: 'Failed to submit deposit request' });
  }
});

// POST /api/wallet/withdraw
router.post('/withdraw', auth, [
  body('amount').isFloat().withMessage('Amount must be a valid number'),
  body('method').isIn(['upi', 'bank_card', 'usdt']).withMessage('Invalid withdrawal method'),
  body('accountDetails').notEmpty().withMessage('Account details required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, method, accountDetails } = req.body;
    const user = await User.findById(req.userId);

    const SystemSettings = require('../models/SystemSettings');
    const settings = await SystemSettings.findOne() || { MIN_WITHDRAW: 200, MAX_WITHDRAW: 5000 };
    if (amount < settings.MIN_WITHDRAW || amount > settings.MAX_WITHDRAW) {
      return res.status(400).json({ error: `Withdrawal must be ₹${settings.MIN_WITHDRAW} - ₹${settings.MAX_WITHDRAW}` });
    }

    if (user.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Check if user has bet enough to withdraw
    const requiredBet = user.totalDeposit;
    if (user.totalBet < requiredBet) {
      return res.status(400).json({
        error: `Need to bet ₹${(requiredBet - user.totalBet).toFixed(2)} more to withdraw`,
        requiredBet: requiredBet,
        currentBet: user.totalBet
      });
    }

    // User balance is NO LONGER reduced here per the new requirement!
    // It stays the same until the admin explicitly approves it.

    const transaction = await new Transaction({
      userId: user._id,
      type: 'withdraw',
      amount: amount,
      balanceAfter: user.balance,
      status: 'pending',
      method: method,
      accountDetails: accountDetails,
      description: `Withdrawal to ${method.toUpperCase()} - ${accountDetails}`
    }).save();

    res.json({
      success: true,
      message: `Withdrawal is pending. Successful withdrawal between 1 to 2 working days`,
      balance: user.balance,
      transaction: transaction
    });
  } catch (error) {
    console.error('Withdraw error:', error);
    res.status(500).json({ error: 'Withdrawal failed' });
  }
});

// GET /api/wallet/transactions
router.get('/transactions', auth, async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;
    const query = { userId: req.userId };
    if (type) query.type = type;

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
