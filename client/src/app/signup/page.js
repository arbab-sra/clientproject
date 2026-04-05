'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { referralAPI } from '@/services/api';
import { motion } from 'framer-motion';

function SignupForm() {
  const [form, setForm] = useState({ username: '', email: '', phone: '', password: '', confirmPassword: '', referralCode: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [refValid, setRefValid] = useState(null);
  const [refName, setRefName] = useState('');
  const { signup } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Auto-fill referral code from URL
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setForm(prev => ({ ...prev, referralCode: ref }));
      validateCode(ref);
    }
  }, [searchParams]);

  const validateCode = async (code) => {
    if (!code || code.length < 4) { setRefValid(null); return; }
    try {
      const res = await referralAPI.validateCode(code);
      setRefValid(res.data.valid);
      setRefName(res.data.referrerName || '');
    } catch {
      setRefValid(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === 'referralCode') {
      validateCode(e.target.value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      await signup({
        username: form.username,
        email: form.email,
        phone: form.phone,
        password: form.password,
        referralCode: form.referralCode || undefined
      });
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Signup failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-secondary to-amber-500 flex flex-col">
      {/* Header */}
      <div className="flex flex-col items-center pt-10 pb-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3"
        >
          <span className="text-3xl">🎮</span>
        </motion.div>
        <h1 className="text-white text-2xl font-extrabold">Join GAMEZONE</h1>
        <p className="text-white/70 text-sm mt-1">Get ₹15 Free Signup Bonus! 🎉</p>
      </div>

      {/* Form */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex-1 bg-white rounded-t-[32px] px-6 pt-6"
      >
        <h2 className="text-dark text-xl font-bold">Create Account</h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="text-dark text-xs font-semibold block mb-1">Username</label>
            <input name="username" value={form.username} onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-bg rounded-xl text-dark text-sm placeholder-gray-400 focus:ring-2 focus:ring-primary/30 outline-none transition-all"
              placeholder="Choose a username" required />
          </div>

          <div>
            <label className="text-dark text-xs font-semibold block mb-1">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-bg rounded-xl text-dark text-sm placeholder-gray-400 focus:ring-2 focus:ring-primary/30 outline-none transition-all"
              placeholder="your@email.com" required />
          </div>

          <div>
            <label className="text-dark text-xs font-semibold block mb-1">Phone Number</label>
            <input name="phone" type="tel" value={form.phone} onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-bg rounded-xl text-dark text-sm placeholder-gray-400 focus:ring-2 focus:ring-primary/30 outline-none transition-all"
              placeholder="Enter phone number" required />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-dark text-xs font-semibold block mb-1">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-bg rounded-xl text-dark text-sm placeholder-gray-400 focus:ring-2 focus:ring-primary/30 outline-none transition-all"
                placeholder="Min 6 chars" required />
            </div>
            <div>
              <label className="text-dark text-xs font-semibold block mb-1">Confirm</label>
              <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-bg rounded-xl text-dark text-sm placeholder-gray-400 focus:ring-2 focus:ring-primary/30 outline-none transition-all"
                placeholder="Repeat" required />
            </div>
          </div>

          {/* Referral Code */}
          <div>
            <label className="text-dark text-xs font-semibold block mb-1">
              Referral Code <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <input name="referralCode" value={form.referralCode} onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-bg rounded-xl text-dark text-sm placeholder-gray-400 focus:ring-2 outline-none transition-all uppercase ${
                  refValid === true ? 'ring-2 ring-green-300 bg-green-50' :
                  refValid === false ? 'ring-2 ring-red-300 bg-red-50' :
                  'focus:ring-primary/30'
                }`}
                placeholder="Enter referral code (if any)" />
              {refValid === true && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-xs font-bold">
                  ✓ Invited by {refName}
                </span>
              )}
              {refValid === false && form.referralCode && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-xs">
                  ✕ Invalid code
                </span>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2 mt-1">
            <input type="checkbox" required className="mt-1 accent-primary" />
            <span className="text-gray-400 text-xs">I agree to the Terms of Service and Privacy Policy</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl transition-all disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up & Get ₹15 Free'}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-4 pb-8">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-primary" />}>
      <SignupForm />
    </Suspense>
  );
}
