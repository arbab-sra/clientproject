'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/services/api';
import AuthGuard from '@/components/AuthGuard';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronRight, FiLogOut, FiBell, FiGift, FiBarChart2, FiGlobe, FiSettings, FiMessageCircle, FiInfo, FiHelpCircle, FiVolume2, FiUsers, FiCopy, FiChevronDown } from 'react-icons/fi';

function AccountContent() {
  const { user, logout, updateUser } = useAuth();
  const [langOpen, setLangOpen] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(user?.notifications !== false);
  const [copied, setCopied] = useState(false);

  const handleLanguageChange = async (lang) => {
    setLangOpen(false);
    try {
      await authAPI.updateSettings({ language: lang });
      updateUser({ language: lang });
    } catch {}
  };

  const handleNotifToggle = async () => {
    const newVal = !notifEnabled;
    setNotifEnabled(newVal);
    try {
      await authAPI.updateSettings({ notifications: newVal });
      updateUser({ notifications: newVal });
    } catch {}
  };

  const copyReferralCode = () => {
    if (user.referralCode) {
      navigator.clipboard?.writeText(user.referralCode).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const menuItems = [
    {
      icon: FiBell, label: 'Notification',
      rightElement: (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleNotifToggle(); }}
          className={`w-11 h-6 rounded-full relative transition-colors ${notifEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
        >
          <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${notifEnabled ? 'left-5.5' : 'left-0.5'}`}
            style={{ left: notifEnabled ? '22px' : '2px' }} />
        </button>
      ),
      href: '#'
    },
    { icon: FiGift, label: 'Gifts', href: '#' },
    { icon: FiBarChart2, label: 'Game Statistics', href: '/activity' },
    {
      icon: FiGlobe, label: 'Language',
      rightElement: (
        <div className="relative">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLangOpen(!langOpen); }}
            className="flex items-center gap-1 text-gray-400 text-xs"
          >
            {user.language || 'English'}
            <FiChevronDown className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {langOpen && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute right-0 top-7 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden min-w-[120px]"
              >
                {['English'].map(lang => (
                  <button
                    key={lang}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLanguageChange(lang); }}
                    className={`w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50 transition-colors ${
                      (user.language || 'English') === lang ? 'text-primary font-bold bg-primary/5' : 'text-dark'
                    }`}
                  >
                    {lang === 'English' && '🇬🇧 '}{lang}
                    {(user.language || 'English') === lang && ' ✓'}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ),
      href: '#'
    },
  ];

  const serviceItems = [
    { icon: FiSettings, label: 'Settings', href: '/settings' },
    { icon: FiMessageCircle, label: 'Feedback', href: '/feedback' },
    { icon: FiVolume2, label: 'Announcement', href: '/announcement' },
    { icon: FiHelpCircle, label: 'Customer Service', href: '/customer-service' },
    { icon: FiInfo, label: "Beginner's Guide", href: '/beginners-guide' },
    { icon: FiInfo, label: 'About Us', href: '/about' },
  ];

  return (
    <div className="min-h-screen bg-gray-bg" onClick={() => { if (langOpen) setLangOpen(false); }}>
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-primary to-secondary pt-8 pb-20 px-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-10 mb-5" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl border-2 border-white/30">
            😎
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-white font-bold text-lg">{user.username}</h2>
              <span className="bg-amber-400 text-xs px-2 py-0.5 rounded-full font-bold text-dark">
                VIP{user.vipLevel}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-white/60 text-xs bg-white/10 px-2 py-0.5 rounded-full">
                UID | {user.uid}
              </span>
            </div>
            <p className="text-white/50 text-[10px] mt-1">
              Last login: {new Date(user.lastLogin || user.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="px-4 -mt-12 relative z-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl p-5 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs">Total balance</p>
              <p className="text-dark text-2xl font-extrabold mt-0.5">₹{user.balance?.toFixed(2)}</p>
            </div>
            <Link href="/deposit" className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white text-sm font-bold rounded-full shadow-md">
              Enter Wallet
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-4 mt-5 gap-2">
            {[
              { icon: '💰', label: 'ARWallet', href: '#' },
              { icon: '💳', label: 'Deposit', href: '/deposit' },
              { icon: '🏧', label: 'Withdraw', href: '/withdraw' },
              { icon: '👑', label: 'VIP', href: '#' },
            ].map(item => (
              <Link key={item.label} href={item.href} className="flex flex-col items-center gap-1 py-2 hover:bg-gray-50 rounded-xl transition-colors">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-dark text-[10px] font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Referral Card */}
      <div className="px-4 mt-3">
        <Link href="/referral">
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-4 flex items-center justify-between relative overflow-hidden shadow-md">
            <div className="flex items-center gap-3 relative z-10">
              <FiUsers className="w-8 h-8 text-white" />
              <div>
                <p className="text-white font-bold text-sm">Refer & Earn</p>
                <p className="text-white/80 text-[10px]">Get ₹100 + 20% per referral deposit</p>
              </div>
            </div>
            <div className="flex items-center gap-2 relative z-10">
              <div className="bg-white/20 rounded-lg px-3 py-1.5">
                <p className="text-white text-[10px]">Your Code</p>
                <p className="text-white font-bold text-sm">{user.referralCode || 'Loading...'}</p>
              </div>
              <button
                onClick={(e) => { e.preventDefault(); copyReferralCode(); }}
                className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition-colors"
              >
                <FiCopy className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="absolute -right-6 -bottom-6 text-7xl opacity-10">👥</div>
            {copied && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-1 right-4 bg-green-500 text-white text-[10px] px-2 py-1 rounded-full font-bold"
              >
                Copied!
              </motion.div>
            )}
          </div>
        </Link>
      </div>

      {/* History Grid */}
      <div className="px-4 mt-3">
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: '🎮', title: 'Game History', subtitle: 'My game history', href: '/activity' },
            { icon: '📋', title: 'Transaction', subtitle: 'My transaction history', href: '/activity' },
            { icon: '💰', title: 'Deposit', subtitle: 'My deposit history', href: '/deposit' },
            { icon: '🏧', title: 'Withdraw', subtitle: 'My withdraw history', href: '/withdraw' },
          ].map(item => (
            <Link key={item.title} href={item.href} className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="text-dark text-sm font-semibold">{item.title}</p>
                <p className="text-gray-400 text-[10px]">{item.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 mt-3">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          {menuItems.map((item, idx) => (
            <div key={item.label} className={`flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors ${idx < menuItems.length - 1 ? 'border-b border-gray-50' : ''}`}>
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-gray-400" />
                <span className="text-dark text-sm font-medium">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.rightElement || (
                  <>
                    {item.value && <span className="text-gray-400 text-xs">{item.value}</span>}
                    <FiChevronRight className="w-4 h-4 text-gray-300" />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service Center */}
      <div className="px-4 mt-3 mb-4">
        <p className="text-gray-400 text-xs font-semibold mb-2 px-1">Service center</p>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="grid grid-cols-3 gap-4">
            {serviceItems.map(item => (
              <Link href={item.href} key={item.label} className="flex flex-col items-center gap-1.5 py-2 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-dark text-[10px] font-medium text-center">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="px-4 mb-20">
        <button
          onClick={logout}
          className="w-full py-3.5 bg-white rounded-2xl text-primary font-semibold text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-shadow"
        >
          <FiLogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <AuthGuard>
      <AccountContent />
    </AuthGuard>
  );
}
