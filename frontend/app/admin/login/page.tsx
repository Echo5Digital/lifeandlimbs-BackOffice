'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/login`,
        { email, password },
        { withCredentials: true }
      );
      if (res.data.token) {
        localStorage.setItem('adminToken', res.data.token);
      }
      router.push('/admin/dashboard');
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : 'Login failed. Check your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `
    w-full h-11 px-3 border border-[#E5E7EB] rounded-[9px] text-base
    focus:outline-none focus:ring-2 focus:ring-[#1A6B3A] focus:border-transparent bg-white
  `;

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#1A6B3A]">Life and Limbs</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">Admin Portal</p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-[14px] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#374151] mb-4">Sign In</h2>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#374151] mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lifeandlimbs.org"
                className={inputClass}
                required
                autoComplete="email"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#374151] mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-[9px] text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#1A6B3A] text-white rounded-[9px] text-base font-semibold hover:bg-[#155c30] disabled:opacity-60 transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
