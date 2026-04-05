'use client';
import { useState, useEffect, useRef, use, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { gamesAPI } from '@/services/api';
import AuthGuard from '@/components/AuthGuard';
import Header from '@/components/Header';
import { motion, AnimatePresence } from 'framer-motion';

const GAME_CONFIGS = {
  wingo: {
    name: 'Win Go',
    emoji: '🎯',
    gradient: 'from-green-400 to-emerald-600',
    description: 'Predict the color or number. Green/Red pays 2x, Violet pays 4.5x, Number pays 9x!',
    timer: 60,
  },
  k3: {
    name: 'K3 Dice',
    emoji: '🎲',
    gradient: 'from-yellow-400 to-orange-500',
    description: 'Predict Big (≥11) or Small (<11), Odd or Even. Pays 2x!',
    timer: 60,
  },
  '5d': {
    name: '5D Lottery',
    emoji: '🔢',
    gradient: 'from-blue-400 to-indigo-600',
    description: 'Pick a number (0-9) for each of 5 positions. More matches = bigger wins!',
    timer: 300,
  },
  mines: {
    name: 'Mines',
    emoji: '💎',
    gradient: 'from-purple-500 to-violet-700',
    description: 'Reveal gems on a 5x5 grid. Avoid mines! Cash out anytime.',
    timer: null,
  },
  aviator: {
    name: 'Aviator',
    emoji: '✈️',
    gradient: 'from-red-600 to-rose-800',
    description: 'Watch the plane fly! Cash out before it crashes!',
    timer: null,
  },
  racing: {
    name: 'Moto Racing',
    emoji: '🏍️',
    gradient: 'from-red-500 to-pink-600',
    description: 'Pick your racer. If they win, you get 3.5x your bet!',
    timer: 30,
  },
};

const MIN_PLAY_BALANCE = 100;

// ==================== ANIMATION COMPONENTS ====================

// WinGo: Spinning ball animation
function WinGoAnimation({ gameData, outcome }) {
  const [phase, setPhase] = useState('spinning');
  const colorMap = { red: '#EF4444', green: '#22C55E', violet: '#8B5CF6' };

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('slowing'), 1500);
    const t2 = setTimeout(() => setPhase('result'), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-dark rounded-2xl p-6 text-center relative overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle, ${colorMap[gameData?.resultColor] || '#fff'}, transparent)` }} />
      
      {/* Spinning wheel */}
      <div className="relative w-32 h-32 mx-auto mb-4">
        <motion.div
          className="w-full h-full rounded-full border-4 border-white/20 relative"
          style={{ background: `conic-gradient(#EF4444 0deg 120deg, #22C55E 120deg 240deg, #8B5CF6 240deg 360deg)` }}
          animate={{ rotate: phase === 'spinning' ? 1800 : phase === 'slowing' ? 2520 : 2520 }}
          transition={{ duration: phase === 'spinning' ? 1.5 : 1, ease: phase === 'spinning' ? 'linear' : 'easeOut' }}
        >
          {/* Pointer */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 shadow-lg z-10" />
        </motion.div>
      </div>

      {/* Result reveal */}
      <AnimatePresence>
        {phase === 'result' && (
          <motion.div initial={{ scale: 0, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', damping: 10 }}>
            <div
              className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl font-extrabold text-white shadow-2xl border-4 border-white/30"
              style={{ backgroundColor: colorMap[gameData?.resultColor] }}
            >
              {gameData?.resultNumber}
            </div>
            <p className="text-white/80 text-sm mt-3 capitalize font-bold">{gameData?.resultColor} • {gameData?.resultNumber}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {phase !== 'result' && (
        <p className="text-white/60 text-sm animate-pulse">
          {phase === 'spinning' ? '🎰 Spinning...' : '⏳ Slowing down...'}
        </p>
      )}
    </motion.div>
  );
}

// K3 Dice: Rolling dice animation  
function DiceAnimation({ gameData }) {
  const [rolling, setRolling] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

  useEffect(() => {
    const t1 = setTimeout(() => setRolling(false), 2000);
    const t2 = setTimeout(() => setShowResult(true), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-br from-amber-900 to-amber-700 rounded-2xl p-6 text-center"
    >
      <p className="text-amber-200 text-xs mb-4 font-semibold">🎲 Rolling Dice...</p>
      
      {/* Dice container */}
      <div className="flex justify-center gap-4 mb-4">
        {(gameData?.dice || [1, 1, 1]).map((val, i) => (
          <motion.div
            key={i}
            className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-xl relative"
            animate={rolling ? {
              rotateX: [0, 360, 720, 1080],
              rotateY: [0, 180, 360, 540],
              y: [0, -30, 0, -20, 0],
            } : { rotateX: 0, rotateY: 0, y: 0 }}
            transition={rolling ? {
              duration: 2,
              delay: i * 0.15,
              ease: 'easeOut',
            } : { duration: 0.3 }}
            style={{ perspective: '200px' }}
          >
            {rolling ? (
              <motion.span
                className="text-3xl"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.15, repeat: Infinity }}
              >
                {diceFaces[Math.floor(Math.random() * 6)]}
              </motion.span>
            ) : (
              <motion.span
                className="text-3xl"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.2, type: 'spring' }}
              >
                {diceFaces[val - 1]}
              </motion.span>
            )}
          </motion.div>
        ))}
      </div>

      {/* Result info */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-1"
          >
            <p className="text-white text-lg font-extrabold">
              Dice: {gameData?.dice?.join(' + ')} = {gameData?.sum}
            </p>
            <div className="flex justify-center gap-2 mt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${gameData?.sum >= 11 ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                {gameData?.sum >= 11 ? '📈 BIG' : '📉 SMALL'}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${gameData?.sum % 2 !== 0 ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-white'}`}>
                {gameData?.sum % 2 !== 0 ? '🔵 ODD' : '🟢 EVEN'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// 5D Lottery: Slot machine reveal
function LotteryAnimation({ gameData }) {
  const [revealedPositions, setRevealedPositions] = useState([]);
  const results = gameData?.result || [0, 0, 0];
  const userPicks = gameData?.choice?.number?.split('') || [];

  useEffect(() => {
    results.forEach((_, i) => {
      setTimeout(() => setRevealedPositions(prev => [...prev, i]), 500 + i * 400);
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-br from-indigo-900 to-blue-800 rounded-2xl p-6 text-center"
    >
      <p className="text-blue-200 text-xs mb-4 font-semibold">🔢 Drawing Numbers...</p>
      
      <div className="flex justify-center gap-2 mb-4">
        {results.map((num, i) => (
          <div key={i} className="relative">
            <motion.div
              className="w-12 h-16 bg-white/10 rounded-lg border-2 border-white/20 flex items-center justify-center overflow-hidden"
            >
              {revealedPositions.includes(i) ? (
                <motion.div
                  initial={{ y: -40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: 'spring', damping: 8 }}
                  className={`text-2xl font-extrabold ${userPicks[i] === num ? 'text-green-400' : 'text-white'}`}
                >
                  {num}
                </motion.div>
              ) : (
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 0.15, repeat: Infinity }}
                  className="text-white/40 text-lg"
                >
                  ?
                </motion.div>
              )}
            </motion.div>
            {revealedPositions.includes(i) && userPicks[i] === num && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
              >
                <span className="text-white text-[10px]">✓</span>
              </motion.div>
            )}
            <p className="text-white/40 text-[10px] mt-1">P{i + 1}</p>
          </div>
        ))}
      </div>

      {revealedPositions.length === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-white text-sm font-bold">
            {gameData?.matches > 0 
              ? `🎉 Matched! (Double Payout)` 
              : 'Better luck next time!'}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

// Aviator: Airplane flying animation with crash
function AviatorGameUI({ betAmount, user, onResult, onBalanceUpdate }) {
  const [phase, setPhase] = useState('idle'); // idle, flying, crashed, cashedOut
  const [multiplier, setMultiplier] = useState(1.0);
  const [planeY, setPlaneY] = useState(0);
  const [trail, setTrail] = useState([]);
  const [playCount, setPlayCount] = useState(0);
  const intervalRef = useRef(null);
  const crashAtRef = useRef(1);

  const startFlight = () => {
    if (user.balance < MIN_PLAY_BALANCE) return;
    if (user.balance < betAmount) return;
    
    setPlayCount(prev => prev + 1);
    setPhase('flying');
    setMultiplier(1.0);
    setPlaneY(0);
    setTrail([]);
    
    // 80% chance to crash between 1 and 4 seconds (12 to 50 ticks)
    // 20% chance to crash between 4 and 8 seconds (50 to 100 ticks) - "rarely beyond 4 sec"
    let targetTicks;
    if (Math.random() < 0.20) {
      targetTicks = Math.floor(Math.random() * (100 - 50 + 1)) + 50; 
    } else {
      targetTicks = Math.floor(Math.random() * (50 - 12 + 1)) + 12;
    }
    
    let targetCrashMult = 1.0;
    for(let i=0; i<targetTicks; i++){
      targetCrashMult += 0.02 + i * 0.001;
    }
    crashAtRef.current = parseFloat(targetCrashMult.toFixed(2));
    
    let currentMult = 1.0;
    let step = 0;
    intervalRef.current = setInterval(() => {
      currentMult = parseFloat((currentMult + 0.02 + step * 0.001).toFixed(2));
      step++;
      const y = Math.min(80, (currentMult - 1) * 30);
      
      setMultiplier(currentMult);
      setPlaneY(y);
      setTrail(prev => [...prev.slice(-40), { x: step * 2, y }]);
      
      if (currentMult >= crashAtRef.current) {
        clearInterval(intervalRef.current);
        setPhase('crashed');
        // Auto-play with loss since didn't cash out in time
        gamesAPI.play({
          gameId: 'aviator',
          betAmount,
          choice: { outcome: 'lose', crashPoint: crashAtRef.current, cashoutAt: null }
        }).then(res => {
          onResult(res.data.result);
          onBalanceUpdate(res.data.balance);
        }).catch(() => {});
      }
    }, 80);
  };

  const cashOut = async () => {
    if (phase !== 'flying') return;
    clearInterval(intervalRef.current);
    setPhase('cashedOut');
    try {
      const res = await gamesAPI.play({
        gameId: 'aviator',
        betAmount,
        choice: { outcome: 'win', cashoutAt: multiplier, crashPoint: crashAtRef.current }
      });
      onResult(res.data.result);
      onBalanceUpdate(res.data.balance);
    } catch {}
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div>
      {/* Flight display */}
      <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-4 relative overflow-hidden h-52">
        {/* Stars */}
        {[...Array(15)].map((_, i) => (
          <div key={i} className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
            style={{ left: `${(i * 37) % 100}%`, top: `${(i * 23) % 60}%`, animationDelay: `${i * 0.3}s` }} />
        ))}
        
        {/* Trail line */}
        {trail.length > 1 && (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 160" preserveAspectRatio="none">
            <path
              d={trail.map((p, i) => `${i === 0 ? 'M' : 'L'} ${Math.min(p.x, 280)} ${150 - p.y * 1.5}`).join(' ')}
              fill="none"
              stroke={phase === 'crashed' ? '#EF4444' : '#22C55E'}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d={trail.map((p, i) => `${i === 0 ? 'M' : 'L'} ${Math.min(p.x, 280)} ${150 - p.y * 1.5}`).join(' ') + ` L ${Math.min(trail[trail.length-1]?.x || 0, 280)} 160 L ${trail[0]?.x || 0} 160 Z`}
              fill={phase === 'crashed' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)'}
            />
          </svg>
        )}
        
        {/* Airplane */}
        {phase !== 'idle' && (
          <motion.div
            className="absolute text-3xl"
            style={{
              left: `${Math.min(20 + (trail.length * 1.5), 75)}%`,
              bottom: `${10 + planeY}%`,
            }}
            animate={phase === 'crashed' ? {
              rotate: [0, 45, 90, 180],
              y: [0, 20, 80, 150],
              opacity: [1, 1, 0.5, 0],
              scale: [1, 1.2, 0.8, 0.3],
            } : {
              rotate: [-10, -15, -10],
            }}
            transition={phase === 'crashed' ? { duration: 1 } : { duration: 1, repeat: Infinity }}
          >
            ✈️
          </motion.div>
        )}

        {/* Crash explosion */}
        {phase === 'crashed' && (
          <motion.div
            className="absolute text-5xl"
            style={{ left: `${Math.min(20 + (trail.length * 1.5), 75)}%`, bottom: `${10 + planeY}%` }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: [0, 2, 3], opacity: [1, 1, 0] }}
            transition={{ duration: 1 }}
          >
            💥
          </motion.div>
        )}

        {/* Multiplier display */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
          <motion.p
            className={`text-4xl font-extrabold font-mono ${
              phase === 'crashed' ? 'text-red-500' : phase === 'cashedOut' ? 'text-green-400' : 'text-white'
            }`}
            animate={phase === 'flying' ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            {multiplier.toFixed(2)}x
          </motion.p>
          <p className={`text-xs font-bold mt-1 ${
            phase === 'crashed' ? 'text-red-400' : phase === 'cashedOut' ? 'text-green-300' : 'text-white/50'
          }`}>
            {phase === 'idle' && 'Place bet & start'}
            {phase === 'flying' && '🔥 FLYING...'}
            {phase === 'crashed' && '💥 CRASHED!'}
            {phase === 'cashedOut' && `✅ Cashed Out! Won ₹${Math.floor(betAmount * multiplier)}`}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        <button
          onClick={startFlight}
          disabled={phase === 'flying'}
          className="py-3.5 bg-blue-500 text-white font-bold rounded-xl disabled:opacity-40 text-sm transition-all hover:bg-blue-600"
        >
          {phase === 'idle' ? `🛫 Start (₹${betAmount})` : phase === 'flying' ? '✈️ Flying...' : '🔄 Play Again'}
        </button>
        <button
          onClick={cashOut}
          disabled={phase !== 'flying'}
          className="py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl disabled:opacity-40 text-sm transition-all"
        >
          💰 Cash Out ({multiplier.toFixed(2)}x)
        </button>
      </div>
    </div>
  );
}

// Racing: Animated race
function RacingAnimation({ gameData, outcome }) {
  const [raceProgress, setRaceProgress] = useState([0, 0, 0, 0]);
  const [finished, setFinished] = useState(false);
  const racerEmojis = ['🏍️', '🏎️', '🚗', '🛵'];
  const racerNames = ['Racer 1', 'Racer 2', 'Racer 3', 'Racer 4'];
  const winnerIdx = racerNames.indexOf(gameData?.winner);

  useEffect(() => {
    let step = 0;
    const speeds = racerNames.map((_, i) => {
      if (i === winnerIdx) return 0.8 + Math.random() * 0.4;
      return 0.3 + Math.random() * 0.6;
    });

    const interval = setInterval(() => {
      step++;
      setRaceProgress(prev => prev.map((p, i) => {
        const newP = p + speeds[i] + Math.random() * 1.5;
        return Math.min(newP, i === winnerIdx ? 100 : Math.min(newP, 85 + Math.random() * 10));
      }));
      
      if (step > 30) {
        clearInterval(interval);
        setRaceProgress(prev => prev.map((p, i) => i === winnerIdx ? 100 : Math.min(p, 90)));
        setTimeout(() => setFinished(true), 300);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-4"
    >
      <p className="text-white/60 text-xs mb-3 font-semibold text-center">
        {finished ? '🏁 Race Finished!' : '🏁 Race in progress...'}
      </p>
      
      {racerNames.map((name, i) => (
        <div key={i} className="mb-2.5 last:mb-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white/50 text-[10px] w-14">{name}</span>
            {finished && i === winnerIdx && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-yellow-400 text-[10px]">🏆 WINNER</motion.span>
            )}
          </div>
          <div className="bg-gray-700/50 rounded-full h-8 relative overflow-hidden">
            {/* Track lanes */}
            <div className="absolute inset-0 flex items-center">
              {[...Array(10)].map((_, j) => (
                <div key={j} className="w-[10%] h-full border-r border-white/5" />
              ))}
            </div>
            {/* Racer */}
            <motion.div
              className="absolute top-0 h-full flex items-center"
              style={{ left: `${Math.min(raceProgress[i], 92)}%` }}
              animate={{ y: [0, -2, 0, 2, 0] }}
              transition={{ duration: 0.2, repeat: Infinity }}
            >
              <span className="text-xl">{racerEmojis[i]}</span>
            </motion.div>
            {/* Finish line */}
            <div className="absolute right-0 top-0 h-full w-1 bg-white/30" />
          </div>
        </div>
      ))}

      {finished && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-center mt-3 font-bold text-sm ${
            gameData?.choice === gameData?.winner ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {gameData?.choice === gameData?.winner
            ? `🎉 Your racer ${gameData?.winner} won!`
            : `😞 Winner: ${gameData?.winner}. You picked: ${gameData?.choice}`
          }
        </motion.p>
      )}
    </motion.div>
  );
}

// Mines: 50 tiles (25 gems 💎 + 25 bombs 💣), shuffled randomly
// Each gem = +25% of bet, bomb = lose everything
function MinesGameUI({ betAmount, user, onResult, onBalanceUpdate }) {
  const TOTAL_TILES = 50;
  const GEMS_COUNT = 25;
  const BOMBS_COUNT = 25;
  const GEM_BONUS_PERCENT = 25;

  const [tileMap, setTileMap] = useState([]); // 'gem' or 'bomb' for each tile
  const [revealed, setRevealed] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [hitBomb, setHitBomb] = useState(false);
  const [bombTile, setBombTile] = useState(-1);
  const [gemsFound, setGemsFound] = useState(0);
  const [winnings, setWinnings] = useState(0);
  const [showAllBombs, setShowAllBombs] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resultMsg, setResultMsg] = useState(null);

  // Create shuffled grid: 25 gems + 25 bombs
  const initGame = () => {
    if (user.balance < MIN_PLAY_BALANCE) return;
    if (user.balance < betAmount) return;

    const tiles = [
      ...Array(GEMS_COUNT).fill('gem'),
      ...Array(BOMBS_COUNT).fill('bomb'),
    ];
    // Fisher-Yates shuffle
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
    setTileMap(tiles);
    setRevealed([]);
    setGameStarted(true);
    setGameOver(false);
    setHitBomb(false);
    setBombTile(-1);
    setGemsFound(0);
    setWinnings(0);
    setShowAllBombs(false);
    setResultMsg(null);
  };

  const revealTile = (idx) => {
    if (revealed.includes(idx) || gameOver || saving) return;

    const newRevealed = [...revealed, idx];
    setRevealed(newRevealed);

    if (tileMap[idx] === 'bomb') {
      // Hit a bomb! Lose everything
      setHitBomb(true);
      setBombTile(idx);
      setGameOver(true);
      setWinnings(0);
      // Show all bombs after a short delay
      setTimeout(() => setShowAllBombs(true), 500);
      // Record loss on server
      setSaving(true);
      gamesAPI.play({
        gameId: 'mines',
        betAmount,
        choice: { mines: BOMBS_COUNT, revealed: newRevealed, outcome: 'lose', gemsFound: gemsFound }
      }).then(res => {
        onResult(res.data.result);
        onBalanceUpdate(res.data.balance);
        setResultMsg({ type: 'lose', amount: betAmount });
      }).catch((err) => {
        setResultMsg({ type: 'lose', amount: betAmount });
      }).finally(() => setSaving(false));
    } else {
      // Found a gem! +25% of bet
      const newGems = gemsFound + 1;
      const bonusPerGem = Math.floor(betAmount * GEM_BONUS_PERCENT / 100);
      const newWinnings = bonusPerGem * newGems;
      setGemsFound(newGems);
      setWinnings(newWinnings);

      // If all gems found, auto cash out
      if (newGems === GEMS_COUNT) {
        setGameOver(true);
        cashOutWithAmount(newWinnings, newRevealed, newGems);
      }
    }
  };

  const cashOutWithAmount = async (amount, revealedTiles, gemsCount) => {
    const finalGems = gemsCount || gemsFound;
    setSaving(true);
    try {
      const res = await gamesAPI.play({
        gameId: 'mines',
        betAmount,
        choice: { mines: BOMBS_COUNT, revealed: revealedTiles || revealed, outcome: 'win', gemsFound: finalGems, winAmount: amount }
      });
      onResult(res.data.result);
      onBalanceUpdate(res.data.balance);
      setResultMsg({ type: 'win', amount: res.data.result.winAmount || amount });
    } catch {
      setResultMsg({ type: 'win', amount: amount });
    }
    setGameOver(true);
    setSaving(false);
    setTimeout(() => setShowAllBombs(true), 300);
  };

  const handleCashOut = () => {
    if (gemsFound === 0 || gameOver || saving) return;
    cashOutWithAmount(winnings, revealed);
  };

  const bonusPerGem = Math.floor(betAmount * GEM_BONUS_PERCENT / 100);
  const nextGemWorth = bonusPerGem;

  return (
    <div>
      {/* Game info header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-dark text-sm font-semibold">💎 25 Gems — 💣 25 Bombs</p>
        <span className="text-gray-400 text-[10px]">Each gem = +₹{bonusPerGem}</span>
      </div>

      {!gameStarted ? (
        <div className="text-center">
          <div className="bg-purple-50 rounded-2xl p-6 mb-3">
            <p className="text-5xl mb-3">💎</p>
            <p className="text-purple-800 font-bold text-lg">Mines Game</p>
            <p className="text-purple-600 text-xs mt-1 mb-4">50 tiles: 25 gems & 25 bombs — all shuffled!</p>
            <div className="bg-white rounded-xl p-3 text-left space-y-1.5">
              <p className="text-dark text-xs"><span className="font-bold text-green-600">💎 Gem:</span> +25% of your ₹{betAmount} bet = +₹{bonusPerGem} each</p>
              <p className="text-dark text-xs"><span className="font-bold text-red-500">💣 Bomb:</span> Lose your entire bet instantly!</p>
              <p className="text-dark text-xs"><span className="font-bold text-blue-500">💰 Cash Out:</span> Keep winnings anytime</p>
            </div>
          </div>
          <button
            onClick={initGame}
            disabled={user.balance < MIN_PLAY_BALANCE || user.balance < betAmount}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold rounded-xl shadow-lg text-sm disabled:opacity-40"
          >
            💎 Start Game — Bet ₹{betAmount}
          </button>
        </div>
      ) : (
        <>
          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-green-50 rounded-xl px-3 py-2 text-center">
              <p className="text-green-800 text-lg font-extrabold">{gemsFound}</p>
              <p className="text-green-500 text-[10px]">💎 Found</p>
            </div>
            <div className="bg-amber-50 rounded-xl px-3 py-2 text-center">
              <p className="text-amber-800 text-lg font-extrabold">₹{winnings}</p>
              <p className="text-amber-500 text-[10px]">Winnings</p>
            </div>
            <div className="bg-purple-50 rounded-xl px-3 py-2 text-center">
              <p className="text-purple-800 text-lg font-extrabold">₹{betAmount}</p>
              <p className="text-purple-500 text-[10px]">Your Bet</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="bg-gray-100 rounded-full h-2 mb-3 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(gemsFound / GEMS_COUNT) * 100}%` }}
              transition={{ type: 'spring', damping: 15 }}
            />
          </div>

          {/* 5x10 Grid */}
          <div className="grid grid-cols-10 gap-0.5">
            {tileMap.map((type, i) => {
              const isRevealed = revealed.includes(i);
              const isTheBomb = i === bombTile;
              const isBombRevealed = showAllBombs && type === 'bomb' && !isRevealed;

              return (
                <motion.button
                  key={i}
                  onClick={() => revealTile(i)}
                  disabled={isRevealed || gameOver}
                  className={`aspect-square rounded-lg text-sm font-bold transition-all relative overflow-hidden flex items-center justify-center ${
                    isTheBomb
                      ? 'bg-red-500 border-2 border-red-600 shadow-lg'
                      : isRevealed && type === 'gem'
                        ? 'bg-green-100 border-2 border-green-300'
                        : isBombRevealed
                          ? 'bg-red-50 border border-red-200'
                          : isRevealed
                            ? 'bg-gray-200'
                            : 'bg-gradient-to-br from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300 active:scale-90 border border-purple-300 shadow-sm'
                  }`}
                  whileTap={!isRevealed && !gameOver ? { scale: 0.85 } : {}}
                >
                  {/* The clicked bomb */}
                  {isTheBomb && (
                    <motion.div
                      initial={{ scale: 0, rotate: 0 }}
                      animate={{ scale: [0, 1.5, 1], rotate: [0, 20, -20, 0] }}
                      transition={{ duration: 0.4 }}
                      className="text-xl"
                    >
                      💥
                    </motion.div>
                  )}

                  {/* Revealed gem */}
                  {isRevealed && type === 'gem' && !isTheBomb && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', damping: 8 }}
                      className="text-lg"
                    >
                      💎
                    </motion.div>
                  )}

                  {/* Show remaining bombs after game over */}
                  {isBombRevealed && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 0.6, scale: 1 }}
                      className="text-sm"
                    >
                      💣
                    </motion.div>
                  )}

                  {/* Hidden tile */}
                  {!isRevealed && !isBombRevealed && (
                    <span className="text-purple-400 text-xs">?</span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Next gem info */}
          {!gameOver && gemsFound < GEMS_COUNT && (
            <p className="text-center text-gray-400 text-[10px] mt-2">
              Next gem: +₹{nextGemWorth} • Total if found: ₹{winnings + nextGemWorth}
            </p>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <button
              onClick={handleCashOut}
              disabled={gemsFound === 0 || gameOver || saving}
              className="py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl disabled:opacity-40 text-sm shadow-lg"
            >
              {saving ? '⏳ Saving...' : `💰 Cash Out ₹${winnings}`}
            </button>
            <button
              onClick={initGame}
              disabled={!gameOver || saving}
              className="py-3.5 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold rounded-xl disabled:opacity-40 text-sm shadow-lg"
            >
              🔄 Restart
            </button>
          </div>

          {/* Result message */}
          <AnimatePresence>
            {resultMsg && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                className={`mt-3 rounded-xl p-4 text-center ${
                  resultMsg.type === 'win'
                    ? 'bg-green-50 border-2 border-green-200'
                    : 'bg-red-50 border-2 border-red-200'
                }`}
              >
                <span className="text-3xl block">
                  {resultMsg.type === 'win' ? '🎉' : '💥'}
                </span>
                <p className={`font-extrabold text-lg mt-1 ${
                  resultMsg.type === 'win' ? 'text-green-600' : 'text-red-500'
                }`}>
                  {resultMsg.type === 'win'
                    ? `You Won ₹${resultMsg.amount}!`
                    : `BOOM! Lost ₹${resultMsg.amount}`
                  }
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  {resultMsg.type === 'win'
                    ? `Found ${gemsFound} gems before cashing out`
                    : `Found ${gemsFound} gems before hitting a bomb`
                  }
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

// ==================== MAIN GAME COMPONENT ====================

function GameContent({ gameId }) {
  const config = GAME_CONFIGS[gameId];
  const { user, updateUser } = useAuth();

  const [betAmount, setBetAmount] = useState(10);
  const [customBet, setCustomBet] = useState('');
  const [choice, setChoice] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [result, setResult] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animData, setAnimData] = useState(null);
  const [timer, setTimer] = useState(config?.timer || 60);
  const [history, setHistory] = useState([]);

  const insufficientBalance = user.balance < MIN_PLAY_BALANCE;

  // Only fetch history on mount — not on every user/balance update
  useEffect(() => {
    gamesAPI.getHistory({ gameType: gameId }).then(res => setHistory(res.data.results || [])).catch(() => {});
  }, [gameId]);

  useEffect(() => {
    if (!config?.timer) return;
    const interval = setInterval(() => {
      setTimer(prev => prev <= 1 ? config.timer : prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [config]);

  if (!config) {
    return <div className="min-h-screen bg-gray-bg flex items-center justify-center"><p className="text-gray-500">Game not found</p></div>;
  }

  const handleCustomBet = (val) => {
    const num = parseInt(val);
    if (!isNaN(num) && num >= 1) setBetAmount(num);
    setCustomBet(val);
  };

  const handlePlay = async () => {
    if (!choice || playing) return;
    if (insufficientBalance) {
      setResult({ error: `Minimum balance of ₹${MIN_PLAY_BALANCE} required. Please deposit first.` });
      return;
    }
    if (user.balance < betAmount) {
      setResult({ error: 'Insufficient balance for this bet.' });
      return;
    }

    setPlaying(true);
    setResult(null);
    setShowAnimation(false);

    try {
      const res = await gamesAPI.play({ gameId, betAmount, choice });
      
      // Show animation first
      setAnimData(res.data.result);
      setShowAnimation(true);

      // Wait for animation then show result
      const animDuration = gameId === 'wingo' ? 3000 : gameId === 'k3' ? 2800 : gameId === '5d' ? 3500 : gameId === 'racing' ? 3500 : 2000;
      await new Promise(r => setTimeout(r, animDuration));

      // Keep animation visible instead of hiding it so user sees final state
      setResult(res.data.result);
      setChoice(null);

      // Update balance and history after showing result
      setTimeout(() => {
        updateUser({ balance: res.data.balance });
        gamesAPI.getHistory({ gameType: gameId }).then(r => setHistory(r.data.results || [])).catch(() => {});
      }, 100);
    } catch (err) {
      setResult({ error: err.response?.data?.error || 'Game error' });
    }
    setPlaying(false);
  };

  // Aviator & Mines handle their own play logic via custom components
  const handleSubGameResult = (gameResult) => {
    setResult(gameResult);
    gamesAPI.getHistory({ gameType: gameId }).then(r => setHistory(r.data.results || [])).catch(() => {});
  };
  const handleBalanceUpdate = (newBalance) => {
    updateUser({ balance: newBalance });
  };

  return (
    <div className="min-h-screen bg-gray-bg pb-20">
      {/* Game Header */}
      <div className={`bg-gradient-to-r ${config.gradient} pb-6`}>
        <Header title={config.name} className="!bg-transparent [&_h1]:text-white [&_button]:text-white [&_svg]:text-white" />
        <div className="px-4 mt-2 flex items-center gap-3">
          <span className="text-4xl">{config.emoji}</span>
          <div>
            <p className="text-white/80 text-xs">{config.description}</p>
            {config.timer && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-white/60 text-xs">Next round:</span>
                <span className="bg-white/20 text-white font-mono font-bold px-3 py-1 rounded-lg text-sm">
                  {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="px-4 mt-3">
          <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center justify-between">
            <span className="text-white text-xs">Balance: ₹{user.balance.toFixed(2)}</span>
            <span className="text-white/60 text-[10px]">Min balance: ₹{MIN_PLAY_BALANCE}</span>
          </div>
          {insufficientBalance && (
            <div className="mt-2 bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-2.5 flex items-center justify-between">
              <span className="text-white text-xs">⚠️ Need ₹{MIN_PLAY_BALANCE} to play</span>
              <a href="/deposit" className="text-yellow-300 text-xs font-bold underline">Deposit Now</a>
            </div>
          )}
        </div>
      </div>

      {/* Bet Amount - for all games */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-dark text-sm font-semibold mb-2">Bet Amount</p>
          <div className="grid grid-cols-5 gap-2">
            {[10, 50, 100, 200, 500].map(amt => (
              <button
                key={amt}
                onClick={() => { setBetAmount(amt); setCustomBet(''); }}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  betAmount === amt && !customBet
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md'
                    : 'bg-gray-100 text-dark hover:bg-gray-200'
                }`}
              >
                ₹{amt}
              </button>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              placeholder="Custom amount"
              value={customBet}
              onChange={(e) => handleCustomBet(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-50 rounded-xl text-sm text-dark placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary/30"
              min="1"
            />
            <span className="text-gray-400 text-xs">Bet: ₹{betAmount}</span>
          </div>
        </div>
      </div>

      {/* Animation Area */}
      <AnimatePresence mode="wait">
        {showAnimation && animData && (
          <motion.div
            key={playCount}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 mt-3"
          >
            {gameId === 'wingo' && <WinGoAnimation gameData={animData.gameData} outcome={animData.outcome} />}
            {gameId === 'k3' && <DiceAnimation gameData={animData.gameData} />}
            {gameId === '5d' && <LotteryAnimation gameData={animData.gameData} />}
            {gameId === 'racing' && <RacingAnimation gameData={animData.gameData} outcome={animData.outcome} />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game-specific UI */}
      <div className="px-4 mt-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          
          {/* WIN GO */}
          {gameId === 'wingo' && (
            <div>
              <p className="text-dark text-sm font-semibold mb-3">Pick Color</p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { value: 'green', label: '🟢 Green', color: 'bg-green-500' },
                  { value: 'violet', label: '🟣 Violet', color: 'bg-purple-500' },
                  { value: 'red', label: '🔴 Red', color: 'bg-red-500' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setChoice({ type: 'color', value: opt.value })}
                    className={`py-3.5 rounded-xl font-bold text-sm text-white transition-all ${opt.color} ${
                      choice?.value === opt.value ? 'ring-2 ring-dark shadow-lg scale-105' : 'opacity-80 hover:opacity-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-dark text-sm font-semibold mb-2">Or Pick Number (Double payout)</p>
              <div className="grid grid-cols-5 gap-1.5">
                {[0,1,2,3,4,5,6,7,8,9].map(n => (
                  <button
                    key={n}
                    onClick={() => setChoice({ type: 'number', value: n })}
                    className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                      choice?.type === 'number' && choice?.value === n
                        ? 'bg-dark text-white shadow-lg'
                        : 'bg-gray-100 text-dark hover:bg-gray-200'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* K3 DICE */}
          {gameId === 'k3' && (
            <div>
              <p className="text-dark text-sm font-semibold mb-3">Predict the Dice</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: 'bigSmall', value: 'big', label: '📈 Big (≥11)', color: 'bg-red-500' },
                  { type: 'bigSmall', value: 'small', label: '📉 Small (<11)', color: 'bg-green-500' },
                  { type: 'oddEven', value: 'odd', label: '🔵 Odd', color: 'bg-blue-500' },
                  { type: 'oddEven', value: 'even', label: '🟢 Even', color: 'bg-emerald-500' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setChoice({ type: opt.type, value: opt.value })}
                    className={`py-4 rounded-xl font-bold text-sm text-white transition-all ${opt.color} ${
                      choice?.value === opt.value ? 'ring-2 ring-dark shadow-lg scale-105' : 'opacity-80 hover:opacity-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 5D LOTTERY */}
          {gameId === '5d' && (
            <div>
              <p className="text-dark text-sm font-semibold mb-3">Guess the 3-Digit Number (000-999)</p>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <input
                  type="text"
                  maxLength="3"
                  placeholder="000"
                  value={choice?.number || ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setChoice({ type: 'number', number: val });
                  }}
                  className="w-full text-center text-3xl font-mono font-bold tracking-[0.5em] py-3 rounded-lg border-2 border-gray-200 focus:border-primary outline-none"
                />
                <p className="text-gray-400 text-xs text-center mt-2 leading-relaxed">
                  <strong className="text-primary mt-1 block">Match ANY digit to Double your bet! (2x)</strong>
                </p>
              </div>
            </div>
          )}

          {/* MINES - Full interactive component */}
          {gameId === 'mines' && (
            <MinesGameUI
              betAmount={betAmount}
              user={user}
              onResult={handleSubGameResult}
              onBalanceUpdate={handleBalanceUpdate}
            />
          )}

          {/* AVIATOR - Full interactive component */}
          {gameId === 'aviator' && (
            <AviatorGameUI
              betAmount={betAmount}
              user={user}
              onResult={handleSubGameResult}
              onBalanceUpdate={handleBalanceUpdate}
            />
          )}

          {/* RACING */}
          {gameId === 'racing' && (
            <div>
              <p className="text-dark text-sm font-semibold mb-3">Pick Your Racer 🏁</p>
              <div className="grid grid-cols-2 gap-2">
                {['Racer 1', 'Racer 2', 'Racer 3', 'Racer 4'].map((racer, i) => (
                  <button
                    key={racer}
                    onClick={() => setChoice({ racer })}
                    className={`py-4 rounded-xl font-bold text-sm transition-all ${
                      choice?.racer === racer
                        ? 'bg-gradient-to-r from-primary to-secondary text-white ring-2 ring-dark shadow-lg'
                        : 'bg-gray-100 text-dark hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{['🏍️', '🏎️', '🚗', '🛵'][i]}</span>
                    {racer}
                  </button>
                ))}
              </div>
              <p className="text-gray-400 text-[10px] text-center mt-2">🏆 Winner pays 2x (Double)</p>
            </div>
          )}
        </div>
      </div>

      {/* Play Button (not for mines/aviator - they handle it internally) */}
      {!['mines', 'aviator'].includes(gameId) && (
        <div className="px-4 mt-4">
          <button
            onClick={handlePlay}
            disabled={!choice || (gameId === '5d' && choice?.number?.length !== 3) || playing || insufficientBalance}
            className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-lg shadow-primary/30 disabled:opacity-50 transition-all text-sm"
          >
            {playing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Playing...
              </span>
            ) : (
              `🎮 Place Bet — ₹${betAmount}`
            )}
          </button>
        </div>
      )}

      {/* Result Display */}
      <AnimatePresence>
        {result && !result.error && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="px-4 mt-4"
          >
            <div className={`rounded-2xl p-5 text-center ${result.outcome === 'win' ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
              <motion.span
                className="text-5xl block"
                initial={{ rotate: 0 }}
                animate={{ rotate: result.outcome === 'win' ? [0, -10, 10, 0] : 0 }}
                transition={{ duration: 0.5 }}
              >
                {result.outcome === 'win' ? '🎉' : '😞'}
              </motion.span>
              <p className={`text-xl font-extrabold mt-2 ${result.outcome === 'win' ? 'text-green-600' : 'text-red-500'}`}>
                {result.outcome === 'win' ? `You Won ₹${result.winAmount}!` : 'You Lost!'}
              </p>
              {result.outcome === 'win' && (
                <p className="text-green-500 text-sm mt-1">Multiplier: {result.multiplier}x</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {result?.error && (
        <div className="px-4 mt-4">
          <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm text-center">{result.error}</div>
        </div>
      )}

      {/* Game History */}
      <div className="px-4 mt-4 mb-4">
        <h3 className="text-dark font-bold text-sm mb-2">Game History</h3>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          {history.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No games played yet</p>
          ) : (
            history.slice(0, 10).map((item, idx) => (
              <div key={idx} className={`flex items-center justify-between px-4 py-3 ${idx < history.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <div>
                  <p className="text-dark text-sm font-medium">Period: {item.period}</p>
                  <p className="text-gray-400 text-[10px]">{new Date(item.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${item.outcome === 'win' ? 'text-green-500' : 'text-red-500'}`}>
                    {item.outcome === 'win' ? `+₹${item.winAmount}` : `-₹${item.betAmount}`}
                  </p>
                  <p className="text-gray-400 text-[10px]">Bet: ₹{item.betAmount}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function GamePage({ params }) {
  const resolvedParams = use(params);
  const gameId = resolvedParams?.gameId;

  if (!gameId || !GAME_CONFIGS[gameId]) {
    return <div className="min-h-screen bg-gray-bg flex items-center justify-center"><p className="text-gray-500">Game not found</p></div>;
  }

  return (
    <AuthGuard>
      <GameContent gameId={gameId} />
    </AuthGuard>
  );
}
