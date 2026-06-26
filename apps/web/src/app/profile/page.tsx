'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { toast } from '@/components/ui/toaster';
import { saveAuth } from '@/lib/auth';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    setForm({ name: user.name, email: user.email || '' });
  }, [user, router]);

  const handleChange = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setDirty(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast('Name cannot be empty', 'error'); return; }
    setLoading(true);
    try {
      const updated = await authApi.updateProfile({ name: form.name.trim(), email: form.email.trim() });
      setUser(updated);
      saveAuth(localStorage.getItem('coxbeach_token')!, updated);
      setDirty(false);
      toast('Profile updated successfully!', 'success');
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Failed to save', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const initials = user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display text-gray-900">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account information</p>
      </div>

      <div className="grid gap-6">
        {/* Profile card */}
        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-center gap-5 mb-6 pb-6 border-b">
            <div className="w-16 h-16 bg-brand-600 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0">
              {initials}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-lg">{user.name}</p>
              <p className="text-gray-500 text-sm">{user.phone}</p>
              <span className="inline-block text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full font-medium mt-1">
                {user.role}
              </span>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                placeholder="Your full name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
              <input
                value={user.phone}
                disabled
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 text-gray-400 text-sm cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">Phone number cannot be changed for security reasons</p>
            </div>
            <button
              type="submit"
              disabled={loading || !dirty}
              className="w-full bg-brand-600 text-white py-2.5 rounded-lg font-semibold hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Quick links */}
        <div className="bg-white border rounded-xl divide-y">
          <Link href="/my-bookings" className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition">
            <div className="flex items-center gap-3">
              <span className="text-xl">📋</span>
              <div>
                <p className="text-sm font-medium text-gray-900">My Bookings</p>
                <p className="text-xs text-gray-400">View your booking history</p>
              </div>
            </div>
            <span className="text-gray-400">→</span>
          </Link>
          {user.role === 'AGENT' && (
            <Link href="/agent/dashboard" className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition">
              <div className="flex items-center gap-3">
                <span className="text-xl">🤝</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">Agent Dashboard</p>
                  <p className="text-xs text-gray-400">Manage your referrals and earnings</p>
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
