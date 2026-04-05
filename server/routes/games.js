const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const GameResult = require('../models/GameResult');
const auth = require('../middleware/auth');

const router = express.Router();

// Game definitions
const GAMES = [
  {
    id: 'wingo', name: 'Win Go', category: 'lottery',
    description: 'Predict the color: Red, Green, or Violet. Win up to 4.5x!',
    isFree: false, image: '/games/wingo.png',
    multipliers: { color: 2, violet: 4.5, number: 9 }, tag: 'HOT'
  },
  {
    id: 'k3', name: 'K3 Dice', category: 'lottery',
    description: 'Predict Big or Small, Odd or Even. Classic dice game!',
    isFree: false, image: '/games/k3.png',
    multipliers: { bigSmall: 2, exact: 6 }, tag: 'POPULAR'
  },
  {
    id: '5d', name: '5D Lottery', category: 'lottery',
    description: 'Pick numbers for 5 positions. Match to win big!',
    isFree: false, image: '/games/5d.png',
    multipliers: { single: 9.5, all: 100000 }, tag: ''
  },
  {
    id: 'mines', name: 'Mines', category: 'mini',
    description: 'Reveal gems, avoid mines! Cash out anytime.',
    isFree: false, image: '/games/mines.png',
    multipliers: { base: 1.2, max: 50 }, tag: ''
  },
  {
    id: 'aviator', name: 'Aviator', category: 'mini',
    description: 'Watch the multiplier fly! Cash out before crash.',
    isFree: false, image: '/games/aviator.png',
    multipliers: { min: 1, max: 100 }, tag: ''
  },
  {
    id: 'racing', name: 'Moto Racing', category: 'mini',
    description: 'Pick your racer and win! Fast-paced betting action.',
    isFree: false, image: '/games/racing.png',
    multipliers: { win: 3.5 }, tag: 'NEW'
  }
];

// GET /api/games — List all games
router.get('/', async (req, res) => {
  let games = GAMES;
  const { category } = req.query;
  if (category) {
    games = games.filter(g => g.category === category);
  }
  const SystemSettings = require('../models/SystemSettings');
  const settings = await SystemSettings.findOne() || { MIN_PLAY_BALANCE: 100 };
  const minPlayBalance = settings.MIN_PLAY_BALANCE;
  res.json({ games, minPlayBalance });
});

// GET /api/games/:gameId — Get game details
router.get('/:gameId', async (req, res) => {
  const game = GAMES.find(g => g.id === req.params.gameId);
  if (!game) return res.status(404).json({ error: 'Game not found' });
  const SystemSettings = require('../models/SystemSettings');
  const settings = await SystemSettings.findOne() || { MIN_PLAY_BALANCE: 100 };
  const minPlayBalance = settings.MIN_PLAY_BALANCE;
  res.json({ game, minPlayBalance });
});

// POST /api/games/play — Play a game
router.post('/play', auth, [
  body('gameId').isIn(GAMES.map(g => g.id)).withMessage('Invalid game'),
  body('betAmount').isFloat({ min: 1 }).withMessage('Minimum bet is ₹1'),
  body('choice').notEmpty().withMessage('Choice is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { gameId, betAmount, choice } = req.body;
    const game = GAMES.find(g => g.id === gameId);
    const user = await User.findById(req.userId);

    // Check minimum balance to play (skip for mines/aviator — they run client-side)
    const SystemSettings = require('../models/SystemSettings');
    const settings = await SystemSettings.findOne() || { MIN_PLAY_BALANCE: 100, WIN_PROBABILITY: 40 };
    const minPlayBalance = settings.MIN_PLAY_BALANCE;
    if (!['mines', 'aviator'].includes(gameId) && user.balance < minPlayBalance) {
      return res.status(400).json({ 
        error: `Minimum balance of ₹${minPlayBalance} required to play. Please deposit first.`,
        minPlayBalance
      });
    }

    if (user.balance < betAmount) {
      return res.status(400).json({ error: 'Insufficient balance for this bet' });
    }

    // Deduct bet
    user.balance -= betAmount;
    user.totalBet += betAmount;

    // Generate game result using WIN_PROBABILITY
    const winProbability = settings.WIN_PROBABILITY;
    const result = generateGameResult(gameId, choice, betAmount, winProbability);

    if (result.outcome === 'win') {
      user.balance += result.winAmount;
      user.totalWin += result.winAmount;
    }

    await user.save();

    // Save game result
    const gameResult = await new GameResult({
      userId: user._id,
      gameType: gameId,
      gameName: game.name,
      betAmount,
      outcome: result.outcome,
      winAmount: result.winAmount,
      multiplier: result.multiplier,
      gameData: result.gameData,
      period: generatePeriod()
    }).save();

    // Save transactions
    await new Transaction({
      userId: user._id,
      type: 'bet',
      amount: -betAmount,
      balanceAfter: user.balance,
      status: 'completed',
      description: `Bet ₹${betAmount} on ${game.name}`
    }).save();

    if (result.outcome === 'win') {
      await new Transaction({
        userId: user._id,
        type: 'win',
        amount: result.winAmount,
        balanceAfter: user.balance,
        status: 'completed',
        description: `Won ₹${result.winAmount} in ${game.name}`
      }).save();
    }

    res.json({
      success: true,
      result: {
        outcome: result.outcome,
        winAmount: result.winAmount,
        multiplier: result.multiplier,
        gameData: result.gameData,
        period: gameResult.period
      },
      balance: user.balance
    });
  } catch (error) {
    console.error('Game play error:', error);
    res.status(500).json({ error: 'Game error' });
  }
});

// GET /api/games/history/me
router.get('/history/me', auth, async (req, res) => {
  try {
    const { gameType, page = 1, limit = 20 } = req.query;
    const query = { userId: req.userId };
    if (gameType) query.gameType = gameType;

    const results = await GameResult.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await GameResult.countDocuments(query);

    res.json({
      results,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ GAME RESULT GENERATORS ============
// All games now use WIN_PROBABILITY to determine win/loss first,
// then generate appropriate game data to match the outcome.

function generateGameResult(gameId, choice, betAmount, winProbability) {
  // First decide: does the user win or lose?
  const willWin = Math.random() * 100 < winProbability;

  switch (gameId) {
    case 'wingo': return playWinGo(choice, betAmount, willWin);
    case 'k3': return playK3(choice, betAmount, willWin);
    case '5d': return play5D(choice, betAmount, willWin);
    case 'mines': return playMines(choice, betAmount, willWin);
    case 'aviator': return playAviator(choice, betAmount, willWin);
    case 'racing': return playRacing(choice, betAmount, willWin);
    default: return { outcome: 'lose', winAmount: 0, multiplier: 0, gameData: {} };
  }
}

function playWinGo(choice, betAmount, willWin) {
  const allColors = ['red', 'green', 'violet'];
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const colorMap = { 0: 'red', 1: 'green', 2: 'red', 3: 'green', 4: 'red', 5: 'violet', 6: 'red', 7: 'green', 8: 'red', 9: 'green' };

  let resultNumber, resultColor, multiplier = 0, outcome = 'lose', winAmount = 0;

  if (willWin) {
    if (choice.type === 'color') {
      // Pick a number that matches the chosen color
      const matchingNumbers = numbers.filter(n => colorMap[n] === choice.value);
      resultNumber = matchingNumbers[Math.floor(Math.random() * matchingNumbers.length)];
      resultColor = choice.value;
      multiplier = 2;
      outcome = 'win';
      winAmount = Math.floor(betAmount * multiplier);
    } else if (choice.type === 'number') {
      resultNumber = choice.value;
      resultColor = colorMap[resultNumber];
      multiplier = 2;
      outcome = 'win';
      winAmount = Math.floor(betAmount * multiplier);
    }
  } else {
    // Generate result that doesn't match
    if (choice.type === 'color') {
      const otherColors = allColors.filter(c => c !== choice.value);
      const targetColor = otherColors[Math.floor(Math.random() * otherColors.length)];
      const matchingNumbers = numbers.filter(n => colorMap[n] === targetColor);
      resultNumber = matchingNumbers[Math.floor(Math.random() * matchingNumbers.length)];
      resultColor = targetColor;
    } else if (choice.type === 'number') {
      const otherNumbers = numbers.filter(n => n !== choice.value);
      resultNumber = otherNumbers[Math.floor(Math.random() * otherNumbers.length)];
      resultColor = colorMap[resultNumber];
    } else {
      resultNumber = Math.floor(Math.random() * 10);
      resultColor = colorMap[resultNumber];
    }
  }

  return {
    outcome, winAmount, multiplier,
    gameData: { resultColor, resultNumber, choice }
  };
}

function playK3(choice, betAmount, willWin) {
  let dice, sum, multiplier = 0, outcome = 'lose', winAmount = 0;

  if (willWin) {
    if (choice.type === 'bigSmall') {
      // Generate dice that match the prediction
      do {
        dice = [rand(1,6), rand(1,6), rand(1,6)];
        sum = dice[0] + dice[1] + dice[2];
      } while ((choice.value === 'big' && sum < 11) || (choice.value === 'small' && sum >= 11));
      multiplier = 2;
      outcome = 'win';
      winAmount = Math.floor(betAmount * multiplier);
    } else if (choice.type === 'oddEven') {
      do {
        dice = [rand(1,6), rand(1,6), rand(1,6)];
        sum = dice[0] + dice[1] + dice[2];
      } while ((choice.value === 'odd' && sum % 2 === 0) || (choice.value === 'even' && sum % 2 !== 0));
      multiplier = 2;
      outcome = 'win';
      winAmount = Math.floor(betAmount * multiplier);
    }
  } else {
    // Generate dice that DON'T match
    if (choice.type === 'bigSmall') {
      do {
        dice = [rand(1,6), rand(1,6), rand(1,6)];
        sum = dice[0] + dice[1] + dice[2];
      } while ((choice.value === 'big' && sum >= 11) || (choice.value === 'small' && sum < 11));
    } else if (choice.type === 'oddEven') {
      do {
        dice = [rand(1,6), rand(1,6), rand(1,6)];
        sum = dice[0] + dice[1] + dice[2];
      } while ((choice.value === 'odd' && sum % 2 !== 0) || (choice.value === 'even' && sum % 2 === 0));
    } else {
      dice = [rand(1,6), rand(1,6), rand(1,6)];
      sum = dice[0] + dice[1] + dice[2];
    }
  }

  return {
    outcome, winAmount, multiplier,
    gameData: { dice, sum, isBig: sum >= 11, choice }
  };
}

function play5D(choice, betAmount, willWin) {
  let resultStr = "";
  const userNum = choice.number || "000"; // Should be a string of length 3
  
  if (willWin) {
    // Determine how many digits to match for a win
    const rand = Math.random();
    if (rand < 0.1) {
      resultStr = userNum; // 10% chance to match all 3
    } else {
      // 90% chance to match some digits
      const resultArr = [
        Math.floor(Math.random() * 10).toString(),
        Math.floor(Math.random() * 10).toString(),
        Math.floor(Math.random() * 10).toString(),
      ];
      // Pick 1 or 2 positions to match
      const matchPositions = [0, 1, 2].sort(() => Math.random() - 0.5).slice(0, Math.random() < 0.5 ? 1 : 2);
      matchPositions.forEach(p => { resultArr[p] = userNum[p]; });
      resultStr = resultArr.join('');
    }
  } else {
    // Generate non-matching result
    const resultArr = ['', '', ''];
    for (let i = 0; i < 3; i++) {
        let n;
        do { n = Math.floor(Math.random() * 10).toString(); } while (n === userNum[i]);
        resultArr[i] = n;
    }
    resultStr = resultArr.join('');
  }

  // Calculate Matches and Winnings
  let matches = 0;
  if (userNum[0] === resultStr[0]) matches++;
  if (userNum[1] === resultStr[1]) matches++;
  if (userNum[2] === resultStr[2]) matches++;

  let outcome = matches > 0 ? 'win' : 'lose';
  let multiplier = matches > 0 ? 2 : 0;
  let winAmount = betAmount * multiplier;

  return {
    outcome, winAmount, multiplier,
    gameData: { result: resultStr.split(''), matches, choice }
  };
}

function playMines(choice, betAmount, willWin) {
  const revealed = choice.revealed || [];
  const gemsFound = choice.gemsFound || 0;
  const clientOutcome = choice.outcome; // 'win' or 'lose' from frontend
  const clientWinAmount = choice.winAmount || 0;
  
  // New 50-tile game: Frontend shuffles 25 gems + 25 bombs
  // Each gem found = +25% of bet amount
  // Bomb = lose everything
  
  if (clientOutcome === 'win') {
    // User cashed out successfully
    const gemBonusPercent = 25;
    const bonusPerGem = Math.floor(betAmount * gemBonusPercent / 100);
    const winAmount = bonusPerGem * gemsFound;
    return {
      outcome: 'win',
      winAmount: winAmount,
      multiplier: parseFloat((gemsFound * 0.25).toFixed(2)),
      gameData: { gemsFound, totalTiles: 50, gems: 25, bombs: 25 }
    };
  } else {
    // User hit a bomb — lose the bet
    return {
      outcome: 'lose',
      winAmount: 0,
      multiplier: 0,
      gameData: { gemsFound, totalTiles: 50, gems: 25, bombs: 25, hitBomb: true }
    };
  }
}

function playAviator(choice, betAmount, willWin) {
  const clientOutcome = choice.outcome;
  const cashoutAt = choice.cashoutAt || null;
  const crashPoint = choice.crashPoint || 1.0;

  if (clientOutcome === 'win') {
    return {
      outcome: 'win',
      winAmount: Math.floor(betAmount * cashoutAt),
      multiplier: cashoutAt,
      gameData: { crashPoint, cashoutAt }
    };
  } else {
    return {
      outcome: 'lose',
      winAmount: 0,
      multiplier: 0,
      gameData: { crashPoint, cashoutAt }
    };
  }
}

function playRacing(choice, betAmount, willWin) {
  const racers = ['Racer 1', 'Racer 2', 'Racer 3', 'Racer 4'];

  if (willWin) {
    const winner = choice.racer;
    const positions = [winner, ...racers.filter(r => r !== winner).sort(() => Math.random() - 0.5)];
    const multiplier = 2;
    return {
      outcome: 'win', winAmount: Math.floor(betAmount * multiplier), multiplier,
      gameData: { winner, positions, choice: choice.racer }
    };
  } else {
    const otherRacers = racers.filter(r => r !== choice.racer);
    const winner = otherRacers[Math.floor(Math.random() * otherRacers.length)];
    const positions = [winner, ...racers.filter(r => r !== winner).sort(() => Math.random() - 0.5)];
    return {
      outcome: 'lose', winAmount: 0, multiplier: 0,
      gameData: { winner, positions, choice: choice.racer }
    };
  }
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePeriod() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `${dateStr}${seq}`;
}

module.exports = router;
