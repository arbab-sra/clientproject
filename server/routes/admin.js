const express = require('express');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error verifying admin' });
  }
};

// Apply auth and isAdmin to all admin routes
router.use(auth, isAdmin);

// GET /api/admin/transactions/pending
router.get('/transactions/pending', async (req, res) => {
  try {
    const { type } = req.query; // 'deposit' or 'withdraw'
    const query = { status: 'pending' };
    if (type) query.type = type;

    const transactions = await Transaction.find(query)
      .populate('userId', 'username email phone uid')
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    console.error('Fetch pending error:', error);
    res.status(500).json({ error: 'Failed to fetch pending transactions' });
  }
});

// POST /api/admin/transactions/approve/:id
router.post('/transactions/approve/:id', async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id).populate('userId');
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });
    if (tx.status !== 'pending') return res.status(400).json({ error: 'Transaction is already handled' });

    const user = tx.userId;

    if (tx.type === 'deposit') {
      // Approve deposit: Credit the user's balance
      user.balance += tx.amount;
      user.totalDeposit += tx.amount;
      await user.save();

      // Distribute referral bonus if applicable
      if (user.referredBy) {
        const SystemSettings = require('../models/SystemSettings');
        const settings = await SystemSettings.findOne() || { REFERRAL_PERCENT: 20, REFERRAL_FIXED_BONUS: 100 };
        const referralPercent = settings.REFERRAL_PERCENT;
        const referralFixed = settings.REFERRAL_FIXED_BONUS;
        const percentBonus = Math.floor(tx.amount * referralPercent / 100);
        const totalReferralBonus = percentBonus + referralFixed;

        const referrer = await User.findById(user.referredBy);
        if (referrer) {
          referrer.balance += totalReferralBonus;
          referrer.referralEarnings += totalReferralBonus;
          await referrer.save();

          await new Transaction({
            userId: referrer._id,
            type: 'referral_bonus',
            amount: totalReferralBonus,
            balanceAfter: referrer.balance,
            status: 'completed',
            description: `Referral bonus for approved deposit by ${user.username}`
          }).save();
        }
      }
    } 
    else if (tx.type === 'withdraw') {
      // Approve withdrawal: Deduct balance here safely.
      if (user.balance < tx.amount) {
        return res.status(400).json({ error: 'User does not have enough balance to cover this withdrawal anymore!' });
      }
      user.balance -= tx.amount;
      user.totalWithdraw += tx.amount;
      await user.save();
    }

    tx.status = 'completed';
    tx.balanceAfter = user.balance; // Update accurate balance snapshot
    await tx.save();

    res.json({ success: true, message: `Transaction approved`, transaction: tx });
  } catch (error) {
    console.error('Approve error:', error);
    res.status(500).json({ error: 'Failed to approve transaction' });
  }
});

// POST /api/admin/transactions/reject/:id
router.post('/transactions/reject/:id', async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id).populate('userId');
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });
    if (tx.status !== 'pending') return res.status(400).json({ error: 'Transaction is already handled' });

    const user = tx.userId;

    if (tx.type === 'deposit') {
      // Reject deposit: Do nothing to balance since it was never credited.
    } 
    else if (tx.type === 'withdraw') {
      // Reject withdrawal: Do nothing to balance since it was never deducted!
    }

    tx.status = 'failed';
    tx.balanceAfter = user.balance;
    await tx.save();

    res.json({ success: true, message: `Transaction rejected`, transaction: tx });
  } catch (error) {
    console.error('Reject error:', error);
    res.status(500).json({ error: 'Failed to reject transaction' });
  }
});

// GET /api/admin/settings
router.get('/settings', async (req, res) => {
  try {
    const SystemSettings = require('../models/SystemSettings');
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await new SystemSettings({}).save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/admin/settings
router.put('/settings', async (req, res) => {
  try {
    const SystemSettings = require('../models/SystemSettings');
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings({});
    }
    
    // Update fields
    const updates = req.body;
    Object.keys(updates).forEach(key => {
      settings[key] = updates[key];
    });

    await settings.save();
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {

  try {
    const users = await User.find({ role: 'user' })
      .select('username email balance totalDeposit totalWithdraw totalBet totalWin createdAt')
      .sort({ createdAt: -1 });
      console.log(users.length)
    res.json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Failed to fetch users metrics' });
  }
});

module.exports = router;
