'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { referralAPI } from '@/services/api';
import AuthGuard from '@/components/AuthGuard';
import Header from '@/components/Header';
import { motion } from 'framer-motion';
import { FiCopy, FiShare2, FiUsers, FiDollarSign, FiGift, FiCheckCircle } from 'react-icons/fi';

function ReferralContent() {
  const { user } = useAuth();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    loadInfo();
  }, []);

  const loadInfo = async () => {
    try {
      const res = await referralAPI.getInfo();
      setInfo(res.data);
    } catch {}
    setLoading(false);
  };

  const copyText = (text, type) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  const shareLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/signup?ref=${user.referralCode}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join GameZone!',
          text: `Use my referral code ${user.referralCode} and we both earn rewards! 🎮`,
          url: shareLink,
        });
      } catch {}
    } else {
      copyText(shareLink, 'link');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-bg flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-bg pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-400 to-orange-500 pb-8">
        <Header title="Refer & Earn" className="!bg-transparent [&_h1]:text-white [&_button]:text-white [&_svg]:text-white" />
        <div className="px-5 mt-2">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-3xl">
              🎁
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Invite Friends & Earn</h2>
              <p className="text-white/80 text-xs mt-0.5">
                Get ₹{info?.referralFixed || 100} + {info?.referralPercent || 20}% of every deposit they make!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 -mt-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl p-5 shadow-lg"
        >
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-1.5">
                <FiUsers className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-dark text-xl font-extrabold">{info?.referralCount || 0}</p>
              <p className="text-gray-400 text-[10px]">Total Referrals</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-1.5">
                <FiDollarSign className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-dark text-xl font-extrabold">₹{info?.referralEarnings?.toFixed(0) || 0}</p>
              <p className="text-gray-400 text-[10px]">Total Earnings</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-1.5">
                <FiGift className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-dark text-xl font-extrabold">{info?.referralPercent || 20}%</p>
              <p className="text-gray-400 text-[10px]">Commission</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Referral Code Card */}
      <div className="px-4 mt-3">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-dark text-sm font-semibold mb-3">Your Referral Code</p>
          <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-dark text-2xl font-extrabold tracking-wider">{user.referralCode}</p>
              <p className="text-gray-400 text-[10px] mt-0.5">Share this code with friends</p>
            </div>
            <button
              onClick={() => copyText(user.referralCode, 'code')}
              className="bg-primary/10 text-primary p-3 rounded-xl hover:bg-primary/20 transition-colors relative"
            >
              {copied === 'code' ? <FiCheckCircle className="w-5 h-5 text-green-500" /> : <FiCopy className="w-5 h-5" />}
            </button>
          </div>

          {/* Share Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <button
              onClick={() => copyText(shareLink, 'link')}
              className="py-3 bg-gray-100 rounded-xl text-sm font-semibold text-dark flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
            >
              <FiCopy className="w-4 h-4" />
              {copied === 'link' ? 'Copied!' : 'Copy Link'}
            </button>
            <button
              onClick={handleShare}
              className="py-3 bg-gradient-to-r from-primary to-secondary rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 shadow-md"
            >
              <FiShare2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="px-4 mt-3">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-dark text-sm font-semibold mb-3">How It Works</p>
          <div className="space-y-4">
            {[
              { step: 1, icon: '📤', title: 'Share Your Code', desc: 'Share your referral code with friends' },
              { step: 2, icon: '👤', title: 'Friend Signs Up', desc: 'They join GameZone using your code' },
              { step: 3, icon: '💰', title: 'Friend Deposits', desc: 'When they add money, you earn rewards!' },
              { step: 4, icon: '🎉', title: 'You Earn', desc: `₹${info?.referralFixed || 100} fixed + ${info?.referralPercent || 20}% of their deposit` },
            ].map(item => (
              <div key={item.step} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                  {item.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.icon}</span>
                    <p className="text-dark font-semibold text-sm">{item.title}</p>
                  </div>
                  <p className="text-gray-400 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-3">
        <div className="flex bg-white rounded-xl p-1 shadow-sm">
          {['overview', 'referrals', 'earnings'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                tab === t ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-dark'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 mt-3 mb-4">
        {tab === 'overview' && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="text-center py-4">
              <p className="text-5xl mb-3">🏆</p>
              <p className="text-dark font-bold">Unlimited Earnings!</p>
              <p className="text-gray-400 text-xs mt-1">
                Every time your referral deposits money, you earn ₹{info?.referralFixed || 100} + {info?.referralPercent || 20}% commission. No limits!
              </p>
              <div className="bg-amber-50 rounded-xl p-4 mt-4">
                <p className="text-amber-700 text-sm font-bold">Example</p>
                <p className="text-amber-600 text-xs mt-1">
                  Your friend deposits ₹1000 → You earn ₹{info?.referralFixed || 100} + ₹{Math.floor(1000 * (info?.referralPercent || 20) / 100)} = 
                  <span className="font-extrabold"> ₹{(info?.referralFixed || 100) + Math.floor(1000 * (info?.referralPercent || 20) / 100)}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {tab === 'referrals' && (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            {(!info?.referredUsers || info.referredUsers.length === 0) ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-2">👥</p>
                <p className="text-gray-400 text-sm">No referrals yet</p>
                <p className="text-gray-300 text-xs mt-1">Share your code to start earning!</p>
              </div>
            ) : (
              info.referredUsers.map((u, idx) => (
                <div key={idx} className={`flex items-center justify-between px-4 py-3 ${idx < info.referredUsers.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-sm">
                      👤
                    </div>
                    <div>
                      <p className="text-dark text-sm font-medium">{u.username}</p>
                      <p className="text-gray-400 text-[10px]">Joined {new Date(u.joinedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="text-green-500 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">
                    ₹{u.totalDeposit} deposited
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'earnings' && (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            {(!info?.recentEarnings || info.recentEarnings.length === 0) ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-2">💰</p>
                <p className="text-gray-400 text-sm">No earnings yet</p>
                <p className="text-gray-300 text-xs mt-1">You&apos;ll see commissions here</p>
              </div>
            ) : (
              info.recentEarnings.map((tx, idx) => (
                <div key={idx} className={`flex items-center justify-between px-4 py-3 ${idx < info.recentEarnings.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <div>
                    <p className="text-dark text-sm font-medium">Referral Commission</p>
                    <p className="text-gray-400 text-[10px]">{new Date(tx.createdAt).toLocaleString()}</p>
                    <p className="text-gray-300 text-[10px]">{tx.description}</p>
                  </div>
                  <span className="text-green-600 font-bold text-sm">+₹{tx.amount}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReferralPage() {
  return (
    <AuthGuard>
      <ReferralContent />
    </AuthGuard>
  );
}
