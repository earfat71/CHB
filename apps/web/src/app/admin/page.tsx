'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi, KPIs, PlatformConfig } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { formatBDT } from '@/lib/utils';
import { toast } from '@/components/ui/toaster';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [configs, setConfigs] = useState<PlatformConfig[]>([]);
  const [editingConfig, setEditingConfig] = useState<string | null>(null);
  const [configValue, setConfigValue] = useState('');
  const [tab, setTab] = useState<'overview' | 'config' | 'users' | 'bookings' | 'reviews' | 'hotels'>('overview');

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') { router.push('/'); return; }
    adminApi.kpis().then(setKpis).catch(console.error);
    adminApi.config().then(setConfigs).catch(console.error);
  }, [user]);

  const handleSaveConfig = async (key: string) => {
    try {
      await adminApi.updateConfig(key, configValue);
      setConfigs((prev) => prev.map((c) => c.key === key ? { ...c, value: configValue } : c));
      setEditingConfig(null);
      toast('Config updated!', 'success');
    } catch (e: unknown) { toast(e instanceof Error ? e.message : 'Failed', 'error'); }
  };

  if (!user || user.role !== 'ADMIN') return null;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'config', label: 'Platform Config' },
    { id: 'users', label: 'Users' },
    { id: 'bookings', label: 'Bookings' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'hotels', label: 'Hotels' },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

        <div className="flex gap-1 mb-6 bg-white border rounded-lg p-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition ${tab === t.id ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && kpis && (
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { label: 'Active Hotels', value: kpis.totalHotels, icon: '🏨', color: 'bg-blue-50 text-blue-700' },
              { label: 'Total Bookings', value: kpis.totalBookings, icon: '📋', color: 'bg-green-50 text-green-700' },
              { label: 'Confirmed', value: kpis.confirmedBookings, icon: '✅', color: 'bg-emerald-50 text-emerald-700' },
              { label: 'Revenue', value: formatBDT(kpis.totalRevenueBdt), icon: '💰', color: 'bg-yellow-50 text-yellow-700' },
              { label: 'Total Users', value: kpis.totalUsers, icon: '👥', color: 'bg-purple-50 text-purple-700' },
              { label: 'Active Agents', value: kpis.totalAgents, icon: '🤝', color: 'bg-indigo-50 text-indigo-700' },
              { label: 'Pending Reviews', value: kpis.pendingReviews, icon: '⭐', color: 'bg-orange-50 text-orange-700', alert: kpis.pendingReviews > 0 },
              { label: 'Pending Hotels', value: kpis.pendingHotels, icon: '🏗️', color: 'bg-red-50 text-red-700', alert: kpis.pendingHotels > 0 },
            ].map((stat) => (
              <div key={stat.label} className={`rounded-xl p-4 ${stat.color} ${stat.alert ? 'ring-2 ring-orange-300' : ''}`}>
                <div className="text-2xl mb-1">{stat.icon}</div>
                <p className="text-xs opacity-70">{stat.label}</p>
                <p className="font-bold text-xl">{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'config' && (
          <div className="bg-white border rounded-xl">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Platform Configuration</h2>
              <p className="text-sm text-gray-600">Change rates and settings without code deployment. Changes take effect immediately.</p>
            </div>
            <div className="divide-y">
              {configs.map((config) => (
                <div key={config.key} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{config.key}</p>
                    {config.description && <p className="text-xs text-gray-500">{config.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {editingConfig === config.key ? (
                      <>
                        <input
                          value={configValue}
                          onChange={(e) => setConfigValue(e.target.value)}
                          className="border rounded px-2 py-1 text-sm w-32"
                          autoFocus
                        />
                        <button onClick={() => handleSaveConfig(config.key)} className="text-xs bg-green-600 text-white px-2 py-1 rounded">Save</button>
                        <button onClick={() => setEditingConfig(null)} className="text-xs text-gray-500">Cancel</button>
                      </>
                    ) : (
                      <>
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{config.value}</span>
                        <button onClick={() => { setEditingConfig(config.key); setConfigValue(config.value); }} className="text-xs text-brand-600 hover:underline">Edit</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'users' && <AdminUsers />}
        {tab === 'bookings' && <AdminBookings />}
        {tab === 'reviews' && <AdminReviews />}
        {tab === 'hotels' && <AdminHotels />}
      </div>
    </div>
  );
}

function AdminUsers() {
  const [users, setUsers] = useState<Array<{ id: string; name: string; phone: string; role: string; status: string }>>([]);
  useEffect(() => { adminApi.users().then((u) => setUsers(u as typeof users)).catch(console.error); }, []);

  return (
    <div className="bg-white border rounded-xl overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="border-b bg-gray-50 text-left">
          <th className="px-4 py-3">Name</th>
          <th className="px-4 py-3">Phone</th>
          <th className="px-4 py-3">Role</th>
          <th className="px-4 py-3">Status</th>
        </tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b last:border-0">
              <td className="px-4 py-3">{u.name}</td>
              <td className="px-4 py-3 font-mono text-xs">{u.phone}</td>
              <td className="px-4 py-3"><span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded">{u.role}</span></td>
              <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded ${u.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{u.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminBookings() {
  const [bookings, setBookings] = useState<Array<{ id: string; bookingRef: string; status: string; grandTotalBdt: number; user?: { name: string }; hotel?: { name: string } }>>([]);
  useEffect(() => { adminApi.bookings().then((b) => setBookings(b as typeof bookings)).catch(console.error); }, []);
  const { formatBDT } = { formatBDT: (n: number) => `BDT ${n.toLocaleString()}` };

  return (
    <div className="bg-white border rounded-xl overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="border-b bg-gray-50 text-left">
          <th className="px-4 py-3">Ref</th>
          <th className="px-4 py-3">Guest</th>
          <th className="px-4 py-3">Hotel</th>
          <th className="px-4 py-3">Amount</th>
          <th className="px-4 py-3">Status</th>
        </tr></thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} className="border-b last:border-0">
              <td className="px-4 py-3 font-mono text-xs">{b.bookingRef}</td>
              <td className="px-4 py-3">{b.user?.name}</td>
              <td className="px-4 py-3">{b.hotel?.name}</td>
              <td className="px-4 py-3 font-medium">{formatBDT(b.grandTotalBdt)}</td>
              <td className="px-4 py-3"><span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">{b.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminReviews() {
  const [reviews, setReviews] = useState<Array<{ id: string; rating: number; body: string; user?: { name: string }; hotel?: { name: string } }>>([]);
  useEffect(() => { adminApi.pendingReviews().then((r) => setReviews(r as typeof reviews)).catch(console.error); }, []);

  const approve = async (id: string) => {
    await adminApi.approveReview(id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
    toast('Review approved', 'success');
  };
  const reject = async (id: string) => {
    await adminApi.rejectReview(id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
    toast('Review rejected', 'info');
  };

  return (
    <div className="space-y-4">
      {reviews.length === 0 && <p className="text-center text-gray-500 py-8">No pending reviews!</p>}
      {reviews.map((r) => (
        <div key={r.id} className="bg-white border rounded-xl p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="font-medium text-sm">{r.user?.name}</span>
              <span className="text-gray-500 text-sm ml-2">@ {r.hotel?.name}</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, i) => <span key={i} className={i < r.rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>)}
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-3">{r.body}</p>
          <div className="flex gap-2">
            <button onClick={() => approve(r.id)} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700">Approve</button>
            <button onClick={() => reject(r.id)} className="text-xs bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700">Reject</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function AdminHotels() {
  const [hotels, setHotels] = useState<Array<{ id: string; name: string; status: string; starRating: string }>>([]);
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/hotels?status=PENDING_APPROVAL`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('coxbeach_token')}` }
    }).then((r) => r.json()).then(setHotels).catch(console.error);
  }, []);

  const approve = async (id: string) => {
    await adminApi.approveHotel(id);
    setHotels((prev) => prev.filter((h) => h.id !== id));
    toast('Hotel approved!', 'success');
  };

  return (
    <div className="space-y-4">
      {hotels.length === 0 && <p className="text-center text-gray-500 py-8">No hotels pending approval!</p>}
      {hotels.map((h) => (
        <div key={h.id} className="bg-white border rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="font-medium">{h.name}</p>
            <p className="text-sm text-gray-500">{h.starRating} star · {h.status}</p>
          </div>
          <button onClick={() => approve(h.id)} className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700">Approve</button>
        </div>
      ))}
    </div>
  );
}

function toast(msg: string, type: string) {
  console.log(`[${type.toUpperCase()}] ${msg}`);
}
