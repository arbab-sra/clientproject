'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { walletAPI } from '@/services/api';
import AuthGuard from '@/components/AuthGuard';
import Header from '@/components/Header';
import { motion } from 'framer-motion';
import Link from 'next/link';

const WITHDRAW_METHODS = [
  { id: 'bank_card', label: 'BANK CARD', icon: '🏦' },
  { id: 'upi', label: 'UPI', icon: '📱', active: true },
  { id: 'usdt', label: 'USDT', icon: '🪙' },
];

function WithdrawContent() {
  const { user, updateUser } = useAuth();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('upi');
  const [accountDetails, setAccountDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [walletInfo, setWalletInfo] = useState(null);
  const [history, setHistory] = useState([]);

  const fetchHistory = () => {
    walletAPI.getTransactions({ type: 'withdraw' }).then(res => setHistory(res.data.transactions)).catch(() => {});
  };

  useEffect(() => {
    if (user) {
      walletAPI.getBalance().then(res => setWalletInfo(res.data)).catch(() => {});
      fetchHistory();
    }
  }, [user]);

  const handleWithdraw = async () => {
    const withdrawAmount = parseFloat(amount);
    if (!withdrawAmount || withdrawAmount < 200 || withdrawAmount > 5000) {
      setError('Amount must be ₹200 - ₹5,000');
      return;
    }
    if (!accountDetails.trim()) {
      setError('Please enter your UPI ID or account details');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await walletAPI.withdraw({ amount: withdrawAmount, method, accountDetails });
      updateUser({ balance: res.data.balance });
      setSuccess(res.data.message || 'Withdrawal is pending. Successful withdrawal between 1 to 2 working days');
      setAmount('');
      setAccountDetails('');
      fetchHistory();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.error || 'Withdrawal failed');
    }
    setLoading(false);
  };

  const withdrawable = walletInfo?.withdrawable || 0;
  const requiredBet = Math.max(0, (user.totalDeposit || 0) - (user.totalBet || 0));

  return (
    <div className="min-h-screen bg-gray-bg pb-20">
      <Header title="Withdraw" rightContent={<Link href="/activity" className="text-primary text-xs font-medium">Withdrawal history</Link>} />

      {/* Balance Card */}
      <div className="px-4 mt-2">
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8" />
          <p className="text-white/70 text-xs font-medium">💰 Available balance</p>
          <p className="text-white text-3xl font-extrabold mt-1">₹{user.balance?.toFixed(2)}</p>
          <div className="flex gap-1 mt-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="w-8 h-1 rounded-full bg-white/20" />)}
          </div>
        </div>
      </div>

      {/* Payment Provider */}
      <div className="px-4 mt-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-lg font-bold text-white">A</div>
            <div>
              <p className="text-dark font-bold text-sm">ARPay</p>
              <p className="text-gray-400 text-[10px]">Supports UPI for fast payment</p>
            </div>
          </div>
        </div>
      </div>

      {/* Method Tabs */}
      <div className="px-4 mt-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="grid grid-cols-3 gap-2">
            {WITHDRAW_METHODS.map(m => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all ${
                  method === m.id
                    ? 'border-primary bg-primary/5'
                    : 'border-transparent hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">{m.icon}</span>
                <span className="text-[10px] font-medium text-dark">{m.label}</span>
              </button>
            ))}
          </div>

          {/* Account Details */}
          <div className="mt-4">
            <label className="text-dark text-xs font-semibold block mb-1.5">
              {method === 'upi' ? 'UPI ID' : method === 'bank_card' ? 'Account Number' : 'USDT Address'}
            </label>
            <input
              type="text"
              value={accountDetails}
              onChange={(e) => setAccountDetails(e.target.value)}
              placeholder={method === 'upi' ? 'Enter UPI ID (e.g., name@upi)' : 'Enter account details'}
              className="w-full px-4 py-3.5 bg-gray-bg rounded-xl text-dark text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Amount */}
      <div className="px-4 mt-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold text-lg">₹</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full pl-10 pr-16 py-3.5 bg-gray-bg rounded-xl text-dark text-lg font-bold outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
            <button
              onClick={() => setAmount(Math.min(user.balance, 5000).toString())}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-primary text-xs font-bold border border-primary/30 px-3 py-1 rounded-full hover:bg-primary/5 transition-colors"
            >
              All
            </button>
          </div>
          <p className="text-orange-500 text-[10px] mt-2">Please enter the withdrawal amount (₹200 - ₹5,000)</p>

          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Withdrawable balance</span>
              <span className="text-primary font-semibold">₹{withdrawable.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Withdrawal amount received</span>
              <span className="text-dark font-semibold">₹{amount ? parseFloat(amount).toFixed(2) : '0.00'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="px-4 mt-4">
        {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-3">{error}</div>}
        {success && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-green-50 text-green-600 px-4 py-3 rounded-xl text-sm mb-3 font-medium">
            ✅ {success}
          </motion.div>
        )}
        <button
          onClick={handleWithdraw}
          disabled={loading || !amount}
          className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-lg shadow-primary/30 disabled:opacity-50 transition-all"
        >
          {loading ? 'Processing...' : 'Withdraw'}
        </button>
      </div>

      {/* Bet Requirement Notice */}
      {requiredBet > 0 && (
        <div className="px-4 mt-3 mb-4">
          <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex items-start gap-2">
            <span className="text-orange-500">◆</span>
            <span className="text-orange-600 text-xs">Need to bet ₹{requiredBet.toFixed(2)} to be able to withdraw</span>
          </div>
        </div>
      )}

      {/* History Section */}
      <div className="px-4 mt-6 mb-8">
        <h3 className="text-dark font-bold mb-3 flex items-center justify-between">
          <span>Recent Withdrawals</span>
          <button onClick={fetchHistory} className="text-xs text-primary font-medium p-1 cursor-pointer hover:bg-primary/10 rounded-lg">Refresh</button>
        </h3>
        <div className="space-y-3">
          {history.length > 0 ? history.map((tx) => (
            <div key={tx._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-dark font-bold text-sm">₹{tx.amount?.toFixed(2)}</p>
                <p className="text-gray-400 text-xs mt-0.5">{new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString()}</p>
                <p className="text-gray-500 text-[10px] mt-1">{tx.method?.toUpperCase()} • {tx.accountDetails || 'Stored Account'}</p>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                  tx.status === 'completed' ? 'bg-green-100 text-green-700' :
                  tx.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {tx.status?.toUpperCase() || 'UNKNOWN'}
                </span>
              </div>
            </div>
          )) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              No recent withdrawals found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WithdrawPage() {
  return (
    <AuthGuard>
      <WithdrawContent />
    </AuthGuard>
  );
}
