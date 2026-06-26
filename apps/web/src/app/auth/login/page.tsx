'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { saveAuth } from '@/lib/auth';
import { useAuth } from '@/components/AuthProvider';
import { toast } from '@/components/ui/toaster';

function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const { setUser } = useAuth();
  const redirect = sp.get('redirect') || '/';

  const [mode, setMode] = useState<'phone' | 'password'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.sendOtp(phone);
      setOtpSent(true);
      toast('OTP sent! (Check server logs in sandbox mode)', 'success');
    } catch (e: unknown) { toast(e instanceof Error ? e.message : 'Failed', 'error'); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { token, user } = await authApi.verifyOtp(phone, otp);
      saveAuth(token, user);
      setUser(user);
      toast('Logged in!', 'success');
      router.push(redirect);
    } catch (e: unknown) { toast(e instanceof Error ? e.message : 'Invalid OTP', 'error'); }
    finally { setLoading(false); }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { token, user } = await authApi.login(phone, password);
      saveAuth(token, user);
      setUser(user);
      toast('Logged in!', 'success');
      router.push(redirect);
    } catch (e: unknown) { toast(e instanceof Error ? e.message : 'Login failed', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🏖️</div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome to CoxBeach</h1>
          <p className="text-gray-500 text-sm">Sign in to your account</p>
        </div>

        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setMode('phone')}
            className={`flex-1 py-2 text-sm rounded-md font-medium transition ${mode === 'phone' ? 'bg-white shadow' : 'text-gray-500'}`}
          >
            OTP Login
          </button>
          <button
            onClick={() => setMode('password')}
            className={`flex-1 py-2 text-sm rounded-md font-medium transition ${mode === 'password' ? 'bg-white shadow' : 'text-gray-500'}`}
          >
            Password Login
          </button>
        </div>

        {mode === 'phone' ? (
          !otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+8801XXXXXXXXX"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-brand-600 text-white py-3 rounded-lg font-semibold hover:bg-brand-700 transition disabled:opacity-50">
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-sm text-gray-600 text-center">OTP sent to {phone}</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-digit OTP"
                  maxLength={6}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-brand-600 text-white py-3 rounded-lg font-semibold hover:bg-brand-700 transition disabled:opacity-50">
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button type="button" onClick={() => setOtpSent(false)} className="w-full text-gray-500 text-sm hover:underline">
                ← Change phone number
              </button>
            </form>
          )
        ) : (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+8801XXXXXXXXX" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500" required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-brand-600 text-white py-3 rounded-lg font-semibold hover:bg-brand-700 transition disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-600 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-brand-600 font-medium hover:underline">Register</Link>
        </p>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-700">
          <strong>Demo accounts:</strong><br />
          Admin: +8801700000001 / Admin@123<br />
          Manager: +8801700000002 / Manager@123<br />
          Agent: +8801700000003 / Agent@123
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={null}><LoginForm /></Suspense>;
}
