'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { walletAPI, activityAPI } from '@/services/api';
import AuthGuard from '@/components/AuthGuard';
import Header from '@/components/Header';
import { motion } from 'framer-motion';

function ActivityContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('feed');
  const [transactions, setTransactions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    if (activeTab === 'feed') {
      activityAPI.getFeed().then(res => {
        setActivities(res.data.activities || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      walletAPI.getTransactions({ type: activeTab === 'all' ? undefined : activeTab }).then(res => {
        setTransactions(res.data.transactions || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [user, activeTab]);

  const tabs = [
    { id: 'feed', label: '🔴 Live Feed' },
    { id: 'all', label: 'All' },
    { id: 'deposit', label: 'Deposit' },
    { id: 'withdraw', label: 'Withdraw' },
    { id: 'bet', label: 'Bets' },
    { id: 'win', label: 'Wins' },
  ];

  const getTypeColor = (type) => {
    switch(type) {
      case 'deposit': case 'signup_bonus': case 'win': case 'spin_reward': return 'text-green-500';
      case 'withdraw': case 'bet': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'deposit': return '💰';
      case 'withdraw': return '🏧';
      case 'bet': return '🎮';
      case 'win': return '🏆';
      case 'spin_reward': return '🎡';
      case 'signup_bonus': return '🎁';
      default: return '📋';
    }
  };

  return (
    <div className="min-h-screen bg-gray-bg pb-20">
      <Header title="Activity" showBack={false} />

      {/* Tabs */}
      <div className="px-4 mt-2">
        <div className="flex gap-1 overflow-x-auto hide-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 px-3 py-2 rounded-full text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md'
                  : 'bg-white text-gray-500 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 mt-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeTab === 'feed' ? (
          <div className="space-y-2">
            {activities.map((act, idx) => (
              <motion.div
                key={act.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-xl p-3 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm">
                    {act.type === 'win' ? '🏆' : act.type === 'deposit' ? '💰' : '🏧'}
                  </div>
                  <div>
                    <p className="text-dark text-xs font-semibold">{act.user}</p>
                    <p className="text-gray-400 text-[10px]">{act.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-bold ${act.type === 'win' ? 'text-green-500' : act.type === 'deposit' ? 'text-blue-500' : 'text-orange-500'}`}>
                    ₹{act.amount?.toLocaleString()}
                  </p>
                  <p className="text-gray-300 text-[9px]">{new Date(act.timestamp).toLocaleTimeString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-4xl block mb-2">📋</span>
                <p className="text-gray-400 text-sm">No transactions found</p>
              </div>
            ) : (
              transactions.map((tx, idx) => (
                <motion.div
                  key={tx._id}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  className="bg-white rounded-xl p-3 shadow-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getTypeIcon(tx.type)}</span>
                    <div>
                      <p className="text-dark text-xs font-semibold capitalize">{tx.type.replace('_', ' ')}</p>
                      <p className="text-gray-400 text-[10px] max-w-[180px] truncate">{tx.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${getTypeColor(tx.type)}`}>
                      {tx.amount >= 0 ? '+' : ''}₹{Math.abs(tx.amount)}
                    </p>
                    <p className="text-gray-300 text-[9px]">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ActivityPage() {
  return (
    <AuthGuard>
      <ActivityContent />
    </AuthGuard>
  );
}
