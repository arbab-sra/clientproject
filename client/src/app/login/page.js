'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-secondary to-amber-500 flex flex-col">
      {/* Header */}
      <div className="flex flex-col items-center pt-16 pb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-4"
        >
          <span className="text-4xl">🎮</span>
        </motion.div>
        <h1 className="text-white text-3xl font-extrabold tracking-wide">GAMEZONE</h1>
        <p className="text-white/70 text-sm mt-1">Play & Win Real Cash</p>
      </div>

      {/* Form */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex-1 bg-white rounded-t-[32px] px-6 pt-8"
      >
        <h2 className="text-dark text-2xl font-bold">Welcome Back!</h2>
        <p className="text-gray-400 text-sm mt-1">Sign in to continue playing</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="text-dark text-sm font-semibold block mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 bg-gray-bg rounded-xl border-none outline-none text-dark text-sm placeholder-gray-400 focus:ring-2 focus:ring-primary/30 transition-all"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="text-dark text-sm font-semibold block mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 bg-gray-bg rounded-xl border-none outline-none text-dark text-sm placeholder-gray-400 focus:ring-2 focus:ring-primary/30 transition-all"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl transition-all disabled:opacity-50 mt-4"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary font-semibold hover:underline">
            Sign Up
          </Link>
        </p>

        <div className="mt-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-xs">Demo Login</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <button
          onClick={() => { setEmail('demo@gamezone.com'); setPassword('demo123'); }}
          className="w-full mt-3 py-3 border-2 border-dashed border-gray-200 text-gray-500 font-medium rounded-xl text-sm hover:border-primary hover:text-primary transition-colors mb-8"
        >
          Use Demo Account
        </button>
      </motion.div>
    </div>
  );
}
