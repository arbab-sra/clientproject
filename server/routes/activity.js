const express = require('express');
const router = express.Router();

// Fake user activity feed — generates realistic-looking recent activity
const FAKE_NAMES = [
  'Member***521', 'Player***832', 'Win***143', 'Lucky***667', 'Star***290',
  'Pro***451', 'Gamer***778', 'Ace***156', 'King***934', 'Boss***412',
  'Hero***853', 'Max***267', 'Elite***599', 'Mega***341', 'Gold***728',
  'Silver***115', 'Blaze***496', 'Storm***683', 'Flash***927', 'Rapid***304'
];

const GAMES = ['Win Go', 'K3 Dice', '5D Lottery', 'Mines', 'Aviator', 'Moto Racing'];
const ACTIONS = ['won', 'deposited', 'withdrew', 'won'];

function generateFakeActivity() {
  const activities = [];
  const now = Date.now();

  for (let i = 0; i < 30; i++) {
    const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
    let description = '';
    let amount = 0;
    let type = '';

    if (action === 'won') {
      const game = GAMES[Math.floor(Math.random() * GAMES.length)];
      amount = Math.floor(Math.random() * 5000) + 100;
      description = `Won ₹${amount.toLocaleString()} in ${game}`;
      type = 'win';
    } else if (action === 'deposited') {
      amount = [100, 200, 500, 1000, 2000, 5000][Math.floor(Math.random() * 6)];
      description = `Deposited ₹${amount.toLocaleString()}`;
      type = 'deposit';
    } else if (action === 'withdrew') {
      amount = [500, 1000, 2000, 3000, 5000][Math.floor(Math.random() * 5)];
      description = `Withdrew ₹${amount.toLocaleString()}`;
      type = 'withdraw';
    }

    activities.push({
      id: `act_${i}_${Date.now()}`,
      user: FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)],
      description,
      amount,
      type,
      timestamp: new Date(now - Math.floor(Math.random() * 3600000)).toISOString()
    });
  }

  return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// GET /api/activity/feed
router.get('/feed', (req, res) => {
  res.json({ activities: generateFakeActivity() });
});

module.exports = router;
