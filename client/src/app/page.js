'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { gamesAPI, activityAPI } from '@/services/api';
import { FiRefreshCw } from 'react-icons/fi';
import { motion } from 'framer-motion';

const BANNERS = [
  { id: 1, title: 'WINSTREAK BONUS', subtitle: 'Up to ₹10,000', gradient: 'from-red-500 via-orange-500 to-yellow-500' },
  { id: 2, title: 'FIRST DEPOSIT', subtitle: 'Get 100% Bonus', gradient: 'from-purple-600 via-pink-500 to-red-500' },
  { id: 3, title: 'REFER & EARN', subtitle: '₹500 Per Referral', gradient: 'from-green-500 via-teal-500 to-cyan-500' },
];

const CATEGORIES = [
  { id: 'all', label: '🎮 Lobby', icon: '🎮' },
  { id: 'lottery', label: '🎰 Lottery', icon: '🎰' },
  { id: 'mini', label: '🎲 Mini Games', icon: '🎲' },
];

const LOTTERY_GAMES = [
  { id: 'wingo', name: 'Win Go', color: 'from-green-400 to-emerald-600', emoji: '🎯', tag: 'HOT' },
  { id: 'k3', name: 'K3 Dice', color: 'from-yellow-400 to-orange-500', emoji: '🎲', tag: 'POPULAR' },
  { id: '5d', name: '5D Lottery', color: 'from-blue-400 to-indigo-600', emoji: '🔢', tag: '' },
  { id: 'racing', name: 'Moto Racing', color: 'from-red-500 to-pink-600', emoji: '🏍️', tag: 'NEW' },
];

const MINI_GAMES = [
  { id: 'mines', name: 'Mines', emoji: '💎', desc: 'Free to Play!', color: 'from-purple-500 to-violet-700' },
  { id: 'aviator', name: 'Aviator', emoji: '✈️', desc: 'Cash Out!', color: 'from-red-600 to-rose-800' },
];

export default function HomePage() {
  const { user } = useAuth();
  const [activeBanner, setActiveBanner] = useState(0);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner(prev => (prev + 1) % BANNERS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    activityAPI.getFeed().then(res => setActivities(res.data.activities?.slice(0, 5) || [])).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-bg">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-primary to-secondary px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-white font-bold text-sm">GZ</span>
          </div>
          <span className="text-white font-bold text-lg tracking-wider">GAMEZONE</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/promotion" className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
            🎁 Bonus
          </Link>
        </div>
      </div>

      {/* Banner Carousel */}
      <div className="px-4 pt-3">
        <div className="relative h-36 rounded-2xl overflow-hidden">
          {BANNERS.map((banner, idx) => (
            <motion.div
              key={banner.id}
              className={`absolute inset-0 bg-gradient-to-r ${banner.gradient} rounded-2xl p-5 flex flex-col justify-center`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: idx === activeBanner ? 1 : 0, x: idx === activeBanner ? 0 : 50 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-white/80 text-xs font-medium">GAMEZONE.COM</span>
              <h2 className="text-white text-2xl font-extrabold mt-1">{banner.title}</h2>
              <p className="text-white/90 text-sm mt-0.5">{banner.subtitle}</p>
              <div className="flex gap-1.5 mt-3">
                {BANNERS.map((_, i) => (
                  <div key={i} className={`h-1 rounded-full transition-all ${i === activeBanner ? 'w-6 bg-white' : 'w-2 bg-white/40'}`} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Wallet Bar */}
      <div className="px-4 mt-3">
        <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-gray-400 text-xs">Wallet balance</p>
            <div className="flex items-center gap-2">
              <span className="text-dark text-xl font-bold">₹{user?.balance?.toFixed(2) || '0.00'}</span>
              <FiRefreshCw className="w-4 h-4 text-gray-400 cursor-pointer hover:text-primary transition-colors" />
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/withdraw" className="px-4 py-2 bg-gray-100 text-dark text-xs font-semibold rounded-full hover:bg-gray-200 transition-colors">
              Withdraw
            </Link>
            <Link href="/deposit" className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white text-xs font-semibold rounded-full shadow-md shadow-primary/20 hover:shadow-lg transition-all">
              Deposit
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="px-4 mt-3 grid grid-cols-2 gap-2">
        <Link href="/spinner" className="bg-gradient-to-br from-orange-400 to-amber-600 text-white rounded-2xl p-4 relative overflow-hidden">
          <span className="text-3xl">🎡</span>
          <p className="font-bold text-sm mt-1">Wheel of Fortune</p>
          <p className="text-white/80 text-[10px]">Spin & Win Rewards!</p>
          <div className="absolute -right-3 -bottom-3 text-5xl opacity-20">🎡</div>
        </Link>
        <Link href="/account" className="bg-gradient-to-br from-purple-500 to-indigo-700 text-white rounded-2xl p-4 relative overflow-hidden">
          <span className="text-3xl">👑</span>
          <p className="font-bold text-sm mt-1">VIP Privileges</p>
          <p className="text-white/80 text-[10px]">Exclusive rewards!</p>
          <div className="absolute -right-3 -bottom-3 text-5xl opacity-20">👑</div>
        </Link>
      </div>

      {/* Category Tabs */}
      <div className="px-4 mt-4">
        <div className="flex gap-1 bg-white rounded-full p-1 shadow-sm">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md'
                  : 'text-gray-500 hover:text-dark'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Activity Ticker */}
      {activities.length > 0 && (
        <div className="px-4 mt-3">
          <div className="bg-white rounded-xl p-3 flex items-center gap-2 shadow-sm overflow-hidden">
            <span className="text-green-500 text-xs font-bold shrink-0 animate-pulse">● LIVE</span>
            <div className="overflow-hidden h-5 flex-1">
              <div className="animate-ticker">
                {activities.map((act, i) => (
                  <div key={i} className="h-5 flex items-center text-xs text-gray-600 truncate">
                    <span className="font-semibold text-dark mr-1">{act.user}</span>
                    {act.description}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Games */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-dark text-sm flex items-center gap-1">⭐ Recommended Games</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[...LOTTERY_GAMES.slice(0, 2), ...MINI_GAMES].map((game) => (
            <Link key={game.id} href={`/games/${game.id}`}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`bg-gradient-to-br ${game.color} rounded-2xl p-3 text-center aspect-square flex flex-col items-center justify-center relative overflow-hidden shadow-lg`}
              >
                {game.tag && (
                  <span className="absolute top-1 right-1 bg-red-600 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold">
                    {game.tag}
                  </span>
                )}
                <span className="text-3xl">{game.emoji}</span>
                <p className="text-white font-bold text-xs mt-1">{game.name}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Lottery Section */}
      <div className="px-4 mt-4">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-bold text-dark text-sm">🎰 Lottery</h3>
          <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Fair & Fun</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {LOTTERY_GAMES.map((game) => (
            <Link key={game.id} href={`/games/${game.id}`}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`bg-gradient-to-br ${game.color} rounded-2xl p-4 h-28 flex flex-col justify-between relative overflow-hidden shadow-md`}
              >
                <div>
                  <p className="text-white font-extrabold text-base">{game.name}</p>
                  {game.tag && (
                    <span className="text-white/80 text-[10px] bg-white/20 px-2 py-0.5 rounded-full mt-1 inline-block">
                      {game.tag}
                    </span>
                  )}
                </div>
                <span className="absolute bottom-2 right-3 text-4xl opacity-30">{game.emoji}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Mini Games */}
      <div className="px-4 mt-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-dark text-sm">🎲 Mini Games</h3>
          <Link href="/games" className="text-primary text-xs font-medium">Detail →</Link>
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {MINI_GAMES.map((game) => (
            <Link key={game.id} href={`/games/${game.id}`} className="shrink-0">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`bg-gradient-to-br ${game.color} w-36 h-24 rounded-2xl p-3 flex flex-col justify-between relative overflow-hidden shadow-md`}
              >
                <div>
                  <p className="text-white font-bold text-sm">{game.name}</p>
                  <p className="text-white/70 text-[10px]">{game.desc}</p>
                </div>
                <span className="absolute bottom-1 right-2 text-3xl opacity-30">{game.emoji}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
