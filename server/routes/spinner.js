const express = require('express');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const SpinHistory = require('../models/SpinHistory');
const auth = require('../middleware/auth');

const router = express.Router();

// Wheel segments — display values (visual) vs actual max win ₹5
const WHEEL_SEGMENTS = [
  { display: '₹0-10', actualMax: 2, color: '#FF6B35' },
  { display: '₹5', actualMax: 1, color: '#FFD700' },
  { display: '₹10', actualMax: 3, color: '#FF4D4D' },
  { display: '₹500', actualMax: 5, color: '#00C851' },
  { display: 'Nothing', actualMax: 0, color: '#999999' },
  { display: '₹20', actualMax: 2, color: '#FF6B35' },
  { display: '₹30', actualMax: 4, color: '#FFD700' },
  { display: '₹50', actualMax: 5, color: '#FF4D4D' }
];

// POST /api/spinner/spin
router.post('/spin', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const today = new Date().toDateString();
    const lastSpinDay = user.lastSpinDate ? user.lastSpinDate.toDateString() : null;

    // Reset daily spin count
    if (lastSpinDay !== today) {
      user.spinsUsed = 0;
    }

    // Check spin eligibility
    let isFreeTrialSpin = false;
    if (user.freeTrialSpins > 0) {
      // Use free trial spin
      isFreeTrialSpin = true;
      user.freeTrialSpins -= 1;
    } else if (user.spinsUsed >= 1) {
      return res.status(400).json({ 
        error: 'No spins remaining today. Come back tomorrow!',
        nextSpinAt: getNextMidnight()
      });
    }

    // Determine wheel result
    // Weighted random — "Nothing" has higher probability, max actual win is ₹5
    const weights = [15, 20, 10, 2, 30, 12, 8, 3]; // heavily weighted toward nothing/low
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    let segmentIndex = 0;

    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        segmentIndex = i;
        break;
      }
    }

    const segment = WHEEL_SEGMENTS[segmentIndex];
    // Actual reward is 0 to actualMax (capped at ₹5)
    const actualReward = segment.actualMax > 0 ? Math.min(5, Math.floor(Math.random() * (segment.actualMax + 1))) : 0;

    // Update user
    if (!isFreeTrialSpin) {
      user.spinsUsed += 1;
    }
    user.lastSpinDate = new Date();
    
    if (actualReward > 0) {
      user.balance += actualReward;
    }
    
    await user.save();

    // Record spin
    const spin = await new SpinHistory({
      userId: user._id,
      reward: actualReward,
      displayReward: segment.display,
      rewardType: actualReward > 0 ? 'cash' : 'nothing',
      isFreeTrialSpin
    }).save();

    // Record transaction if won
    if (actualReward > 0) {
      await new Transaction({
        userId: user._id,
        type: 'spin_reward',
        amount: actualReward,
        balanceAfter: user.balance,
        status: 'completed',
        description: `Spin reward: ${segment.display} (actual ₹${actualReward})`
      }).save();
    }

    res.json({
      success: true,
      segmentIndex,
      displayReward: segment.display,
      actualReward,
      balance: user.balance,
      freeTrialSpinsLeft: user.freeTrialSpins,
      dailySpinsUsed: user.spinsUsed,
      canSpinAgain: user.freeTrialSpins > 0 || user.spinsUsed < 1
    });
  } catch (error) {
    console.error('Spin error:', error);
    res.status(500).json({ error: 'Spin failed' });
  }
});

// GET /api/spinner/status
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const today = new Date().toDateString();
    const lastSpinDay = user.lastSpinDate ? user.lastSpinDate.toDateString() : null;

    let dailySpinsUsed = user.spinsUsed;
    if (lastSpinDay !== today) {
      dailySpinsUsed = 0;
    }

    res.json({
      segments: WHEEL_SEGMENTS.map(s => ({ display: s.display, color: s.color })),
      freeTrialSpinsLeft: user.freeTrialSpins,
      dailySpinsUsed,
      canSpin: user.freeTrialSpins > 0 || dailySpinsUsed < 1,
      nextSpinAt: dailySpinsUsed >= 1 && user.freeTrialSpins <= 0 ? getNextMidnight() : null
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/spinner/history
router.get('/history', auth, async (req, res) => {
  try {
    const history = await SpinHistory.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

function getNextMidnight() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.toISOString();
}

module.exports = router;
