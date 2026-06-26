'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { toast } from '@/components/ui/toaster';
import { saveAuth } from '@/lib/auth';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    setForm({ name: user.name, email: user.email || '' });
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await authApi.me();
      setUser(updated);
      saveAuth(localStorage.getItem('coxbeach_token')!, updated);
      toast('Profile updated!', 'success');
    } catch (e: unknown) { toast(e instanceof Error ? e.message : 'Failed', 'error'); }
    finally { setLoading(false); }
  };

  if (!user) return null;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <div className="bg-white border rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center text-2xl font-bold text-brand-700">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-gray-500 text-sm">{user.phone}</p>
            <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded">{user.role}</span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone (cannot change)</label>
            <input value={user.phone} disabled className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-500" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-brand-600 text-white py-2 rounded-lg font-semibold hover:bg-brand-700 transition">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
