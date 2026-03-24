'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { name, email, password });
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
      <div className="max-w-md w-full p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-zinc-800">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="text-white w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h2>
          <p className="text-gray-500 dark:text-zinc-400 mt-2">Start your learning journey today</p>
        </div>

        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 p-3 rounded-xl dark:border-red-900/50 dark:text-red-400 border border-red-100">{error}</div>}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:bg-zinc-950 dark:text-white transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:bg-zinc-950 dark:text-white transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:bg-zinc-950 dark:text-white transition-all"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors focus:ring-4 focus:ring-blue-600/20 mt-2"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-zinc-400">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:text-blue-700 dark:hover:text-blue-500 font-medium transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
