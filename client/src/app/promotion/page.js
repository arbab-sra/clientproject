'use client';
import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import Link from 'next/link';
import Header from '@/components/Header';
import { motion } from 'framer-motion';

const PROMOTIONS = [
  {
    title: 'First Deposit Bonus',
    description: 'Get 100% bonus on your first deposit up to ₹10,000!',
    gradient: 'from-purple-600 to-pink-500',
    emoji: '💰',
    tag: 'NEW USER',
  },
  {
    title: 'Refer & Earn',
    description: 'Invite friends and earn ₹500 for each referral!',
    gradient: 'from-green-500 to-teal-500',
    emoji: '👥',
    tag: 'HOT',
  },
  {
    title: 'Daily Login Reward',
    description: 'Login daily to earn free spins and bonus cash!',
    gradient: 'from-blue-500 to-indigo-600',
    emoji: '📅',
    tag: 'DAILY',
  },
  {
    title: 'Win Streak Bonus',
    description: 'Win 5 games in a row and get up to ₹10,000 bonus!',
    gradient: 'from-red-500 to-orange-500',
    emoji: '🔥',
    tag: 'BONUS',
  },
  {
    title: 'VIP Cashback',
    description: 'VIP members get up to 5% cashback on all bets!',
    gradient: 'from-amber-500 to-yellow-500',
    emoji: '👑',
    tag: 'VIP',
  },
  {
    title: 'Weekend Special',
    description: 'Double rewards on all games every weekend!',
    gradient: 'from-cyan-500 to-blue-500',
    emoji: '🎉',
    tag: 'WEEKEND',
  },
];

function PromotionContent() {
  return (
    <div className="min-h-screen bg-gray-bg pb-20">
      <Header title="Promotions" showBack={false} />

      {/* Hero Banner */}
      <div className="px-4 mt-2">
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-5 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdjJoLTYweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg==')] opacity-30" />
          <span className="text-4xl block mb-2">🎁</span>
          <h2 className="text-white text-xl font-extrabold">Get ₹500 Free!</h2>
          <p className="text-white/70 text-xs mt-1">Complete tasks and earn rewards daily</p>
          <Link href="/spinner" className="inline-block mt-3 px-6 py-2.5 bg-white text-primary font-bold rounded-full text-sm shadow-lg hover:shadow-xl transition-all">
            Claim Now →
          </Link>
        </div>
      </div>

      {/* Promotions Grid */}
      <div className="px-4 mt-4 space-y-3 mb-4">
        {PROMOTIONS.map((promo, idx) => (
          <motion.div
            key={idx}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: idx * 0.1 }}
            className={`bg-gradient-to-r ${promo.gradient} rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden shadow-md`}
          >
            <span className="text-4xl shrink-0">{promo.emoji}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold text-sm">{promo.title}</h3>
                <span className="bg-white/20 text-white text-[8px] px-2 py-0.5 rounded-full font-bold">
                  {promo.tag}
                </span>
              </div>
              <p className="text-white/70 text-xs mt-1">{promo.description}</p>
            </div>
            <div className="absolute -right-6 -bottom-6 text-7xl opacity-10">{promo.emoji}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function PromotionPage() {
  return (
    <AuthGuard>
      <PromotionContent />
    </AuthGuard>
  );
}
