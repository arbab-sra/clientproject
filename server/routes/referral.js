const express = require('express');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/referral/info — Get user's referral info
router.get('/info', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('referralCode referralCount referralEarnings');
    const SystemSettings = require('../models/SystemSettings');
    const settings = await SystemSettings.findOne() || { REFERRAL_PERCENT: 20, REFERRAL_FIXED_BONUS: 100 };
    const referralPercent = settings.REFERRAL_PERCENT;
    const referralFixed = settings.REFERRAL_FIXED_BONUS;

    // Get list of referred users
    const referredUsers = await User.find({ referredBy: req.userId })
      .select('username uid createdAt totalDeposit')
      .sort({ createdAt: -1 })
      .limit(50);

    // Get referral transactions
    const referralTransactions = await Transaction.find({
      userId: req.userId,
      type: 'referral_bonus'
    }).sort({ createdAt: -1 }).limit(20);

    res.json({
      referralCode: user.referralCode,
      referralCount: user.referralCount,
      referralEarnings: user.referralEarnings,
      referralPercent,
      referralFixed,
      referredUsers: referredUsers.map(u => ({
        username: u.username,
        uid: u.uid,
        joinedAt: u.createdAt,
        totalDeposit: u.totalDeposit
      })),
      recentEarnings: referralTransactions
    });
  } catch (error) {
    console.error('Referral info error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/referral/validate/:code — Validate a referral code
router.get('/validate/:code', async (req, res) => {
  try {
    const user = await User.findOne({ referralCode: req.params.code.toUpperCase() });
    if (!user) {
      return res.json({ valid: false });
    }
    res.json({
      valid: true,
      referrerName: user.username.slice(0, 3) + '***'
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
