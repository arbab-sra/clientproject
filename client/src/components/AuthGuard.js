'use client';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-bg flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-bg flex flex-col items-center justify-center px-6">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-sm w-full">
          <span className="text-5xl block mb-3">🔒</span>
          <h2 className="text-dark text-xl font-bold">Login Required</h2>
          <p className="text-gray-400 text-sm mt-2">Please sign in to access this page</p>
          <Link
            href="/login"
            className="mt-5 block w-full py-3.5 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-lg shadow-primary/30 text-center"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="mt-2 block w-full py-3.5 border-2 border-gray-200 text-dark font-semibold rounded-xl text-center text-sm hover:border-primary transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
