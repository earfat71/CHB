'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  adminApi, KPIs, PlatformConfig, AdminUser, AdminBooking, AdminReview,
  AdminAgent, AgentSettlement, HotelSettlement, Hotel,
} from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { formatBDT } from '@/lib/utils';
import { toast } from '@/components/ui/toaster';

type Tab = 'overview' | 'config' | 'users' | 'bookings' | 'reviews' | 'hotels' | 'agents' | 'settlements' | 'ledger';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-50 text-green-700',
  BANNED: 'bg-red-50 text-red-700',
  CONFIRMED: 'bg-green-50 text-green-700',
  PENDING_PAYMENT: 'bg-yellow-50 text-yellow-700',
  CHECKED_OUT: 'bg-blue-50 text-blue-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
  APPROVED: 'bg-green-50 text-green-700',
  PENDING: 'bg-yellow-50 text-yellow-700',
  REJECTED: 'bg-red-50 text-red-700',
  PAID: 'bg-blue-50 text-blue-700',
  PENDING_APPROVAL: 'bg-orange-50 text-orange-700',
};

function Badge({ status }: { status: string }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [kpis, setKpis] = useState<KPIs | null>(null);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'ADMIN') { router.push('/'); return; }
    adminApi.kpis().then(setKpis).catch(console.error);
  }, [user, router]);

  if (!user || user.role !== 'ADMIN') return null;

  const tabs: { id: Tab; label: string; alert?: number }[] = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'config', label: '⚙️ Config' },
    { id: 'users', label: '👥 Users' },
    { id: 'bookings', label: '📋 Bookings' },
    { id: 'hotels', label: '🏨 Hotels', alert: kpis?.pendingHotels },
    { id: 'reviews', label: '⭐ Reviews', alert: kpis?.pendingReviews },
    { id: 'agents', label: '🤝 Agents' },
    { id: 'settlements', label: '💳 Settlements' },
    { id: 'ledger', label: '📒 Ledger' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-sm text-gray-500">CoxBeach Platform Management</p>
          </div>
          <div className="text-sm text-gray-500 bg-white border rounded-lg px-3 py-2">
            Logged in as <strong>{user.name}</strong>
          </div>
        </div>

        <div className="flex gap-1 mb-6 bg-white border rounded-xl p-1.5 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${tab === t.id ? 'bg-brand-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {t.label}
              {t.alert != null && t.alert > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {t.alert}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === 'overview' && <AdminOverview kpis={kpis} />}
        {tab === 'config' && <AdminConfig />}
        {tab === 'users' && <AdminUsers />}
        {tab === 'bookings' && <AdminBookings />}
        {tab === 'hotels' && <AdminHotels />}
        {tab === 'reviews' && <AdminReviews />}
        {tab === 'agents' && <AdminAgents />}
        {tab === 'settlements' && <AdminSettlements />}
        {tab === 'ledger' && <AdminLedger />}
      </div>
    </div>
  );
}

function AdminOverview({ kpis }: { kpis: KPIs | null }) {
  if (!kpis) return <div className="text-center py-16 text-gray-400">Loading KPIs…</div>;

  const stats = [
    { label: 'Active Hotels', value: kpis.totalHotels, icon: '🏨', color: 'bg-blue-50 text-blue-700', sub: `${kpis.pendingHotels} pending approval` },
    { label: 'Total Bookings', value: kpis.totalBookings, icon: '📋', color: 'bg-green-50 text-green-700', sub: `${kpis.confirmedBookings} confirmed` },
    { label: 'Total Revenue', value: formatBDT(kpis.totalRevenueBdt), icon: '💰', color: 'bg-yellow-50 text-yellow-700', sub: 'All-time' },
    { label: 'Registered Users', value: kpis.totalUsers, icon: '👥', color: 'bg-purple-50 text-purple-700', sub: 'Across all roles' },
    { label: 'Active Agents', value: kpis.totalAgents, icon: '🤝', color: 'bg-indigo-50 text-indigo-700', sub: 'Earning commission' },
    { label: 'Pending Reviews', value: kpis.pendingReviews, icon: '⭐', color: kpis.pendingReviews > 0 ? 'bg-orange-50 text-orange-700' : 'bg-gray-50 text-gray-500', sub: 'Awaiting moderation', alert: kpis.pendingReviews > 0 },
    { label: 'Pending Hotels', value: kpis.pendingHotels, icon: '🏗️', color: kpis.pendingHotels > 0 ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-500', sub: 'Awaiting approval', alert: kpis.pendingHotels > 0 },
    { label: 'Confirmed Rate', value: `${Math.round((kpis.confirmedBookings / Math.max(kpis.totalBookings, 1)) * 100)}%`, icon: '📈', color: 'bg-emerald-50 text-emerald-700', sub: 'Booking conversion' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl p-5 ${s.color} ${s.alert ? 'ring-2 ring-orange-300' : ''}`}>
            <div className="text-3xl mb-2">{s.icon}</div>
            <p className="text-xs font-medium opacity-70 uppercase tracking-wide">{s.label}</p>
            <p className="text-2xl font-bold mt-0.5">{s.value}</p>
            <p className="text-xs opacity-60 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold mb-3">Revenue Breakdown</h3>
          <div className="space-y-2 text-sm">
            {[
              { label: 'Hotel Payouts (gross)', pct: 78, color: 'bg-blue-500' },
              { label: 'Platform Fees (5%)', pct: 10, color: 'bg-green-500' },
              { label: 'VAT Collected (15%)', pct: 8, color: 'bg-yellow-500' },
              { label: 'Agent Commissions (8%)', pct: 4, color: 'bg-purple-500' },
            ].map((r) => (
              <div key={r.label}>
                <div className="flex justify-between mb-0.5">
                  <span className="text-gray-600">{r.label}</span>
                  <span className="font-medium">{r.pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full">
                  <div className={`h-1.5 rounded-full ${r.color}`} style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold mb-3">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: 'Review pending hotels', href: '#', onClick: () => {}, icon: '🏗️', badge: kpis.pendingHotels },
              { label: 'Moderate pending reviews', href: '#', onClick: () => {}, icon: '⭐', badge: kpis.pendingReviews },
              { label: 'Process agent settlements', href: '#', onClick: () => {}, icon: '💳', badge: null },
              { label: 'Download revenue report', href: '#', onClick: () => toast('Report download not available in demo', 'info'), icon: '📊', badge: null },
            ].map((a) => (
              <button key={a.label} onClick={a.onClick} className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition text-left">
                <span>{a.icon} {a.label}</span>
                {a.badge != null && a.badge > 0 && <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{a.badge}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminConfig() {
  const [configs, setConfigs] = useState<PlatformConfig[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { adminApi.config().then(setConfigs).catch(console.error).finally(() => setLoading(false)); }, []);

  const save = async (key: string) => {
    try {
      await adminApi.updateConfig(key, value);
      setConfigs((prev) => prev.map((c) => c.key === key ? { ...c, value } : c));
      setEditing(null);
      toast('Config updated — takes effect immediately', 'success');
    } catch (e: unknown) { toast(e instanceof Error ? e.message : 'Failed', 'error'); }
  };

  if (loading) return <div className="text-center py-16 text-gray-400">Loading config…</div>;

  return (
    <div className="bg-white border rounded-xl">
      <div className="p-5 border-b">
        <h2 className="font-semibold text-lg">Platform Configuration</h2>
        <p className="text-sm text-gray-500 mt-0.5">Change rates and settings live — no code deployment needed. All values take effect immediately.</p>
      </div>
      <div className="divide-y">
        {configs.map((c) => (
          <div key={c.key} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-mono text-sm font-semibold text-gray-800">{c.key}</p>
              {c.description && <p className="text-xs text-gray-500 mt-0.5">{c.description}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {editing === c.key ? (
                <>
                  <input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="border rounded-lg px-3 py-1.5 text-sm w-36 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                    autoFocus
                  />
                  <button onClick={() => save(c.key)} className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-700">Save</button>
                  <button onClick={() => setEditing(null)} className="text-gray-500 text-xs hover:underline">Cancel</button>
                </>
              ) : (
                <>
                  <span className="font-mono text-sm bg-gray-100 px-3 py-1.5 rounded-lg">{c.value}</span>
                  <button onClick={() => { setEditing(c.key); setValue(c.value); }} className="text-brand-600 text-xs hover:underline font-medium">Edit</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { adminApi.users().then(setUsers).catch(console.error).finally(() => setLoading(false)); }, []);

  const filtered = users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.phone.includes(search));

  if (loading) return <div className="text-center py-16 text-gray-400">Loading users…</div>;

  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between gap-4">
        <h2 className="font-semibold">All Users <span className="text-gray-400 font-normal text-sm">({users.length})</span></h2>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or phone…" className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-64" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Joined</th>
          </tr></thead>
          <tbody className="divide-y">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{u.phone}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{u.email || '—'}</td>
                <td className="px-4 py-3"><span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded font-medium">{u.role}</span></td>
                <td className="px-4 py-3"><Badge status={u.status} /></td>
                <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center py-8 text-gray-400">No users match your search.</p>}
      </div>
    </div>
  );
}

function AdminBookings() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => { adminApi.bookings().then(setBookings).catch(console.error).finally(() => setLoading(false)); }, []);

  const statuses = ['ALL', 'CONFIRMED', 'PENDING_PAYMENT', 'CHECKED_OUT', 'CANCELLED'];
  const filtered = filter === 'ALL' ? bookings : bookings.filter((b) => b.status === filter);

  if (loading) return <div className="text-center py-16 text-gray-400">Loading bookings…</div>;

  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between gap-4 flex-wrap">
        <h2 className="font-semibold">All Bookings <span className="text-gray-400 font-normal text-sm">({filtered.length})</span></h2>
        <div className="flex gap-1 flex-wrap">
          {statuses.map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${filter === s ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
            <th className="px-4 py-3">Ref</th>
            <th className="px-4 py-3">Guest</th>
            <th className="px-4 py-3">Hotel</th>
            <th className="px-4 py-3">Check-in</th>
            <th className="px-4 py-3">Nights</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Status</th>
          </tr></thead>
          <tbody className="divide-y">
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-brand-700 font-semibold">{b.bookingRef}</td>
                <td className="px-4 py-3 font-medium">{b.guestName}</td>
                <td className="px-4 py-3 text-gray-600">{b.hotel?.name}</td>
                <td className="px-4 py-3 text-gray-600">{b.checkIn}</td>
                <td className="px-4 py-3 text-center">{b.nights}</td>
                <td className="px-4 py-3 font-semibold">{formatBDT(b.grandTotalBdt)}</td>
                <td className="px-4 py-3"><Badge status={b.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center py-8 text-gray-400">No bookings found.</p>}
      </div>
    </div>
  );
}

function AdminHotels() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { adminApi.pendingHotels().then(setHotels).catch(console.error).finally(() => setLoading(false)); }, []);

  const approve = async (id: string) => {
    try {
      await adminApi.approveHotel(id);
      setHotels((prev) => prev.filter((h) => h.id !== id));
      toast('Hotel approved and listed!', 'success');
    } catch (e: unknown) { toast(e instanceof Error ? e.message : 'Failed', 'error'); }
  };

  if (loading) return <div className="text-center py-16 text-gray-400">Loading pending hotels…</div>;

  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
        <strong>Hotel Approval Queue</strong> — Review each hotel before it goes live on the platform.
      </div>
      {hotels.length === 0 && (
        <div className="bg-white border rounded-xl p-12 text-center text-gray-400">
          <div className="text-4xl mb-3">✅</div>
          <p className="font-medium">No hotels pending approval</p>
          <p className="text-sm mt-1">All submissions have been reviewed.</p>
        </div>
      )}
      {hotels.map((h) => (
        <div key={h.id} className="bg-white border rounded-xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">{h.name}</h3>
                <Badge status={h.status} />
              </div>
              <p className="text-sm text-gray-500">{h.address}</p>
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span>⭐ {h.starRating?.replace(/_/g, ' ')}</span>
                <span>🛏️ {h.rooms?.length ?? 0} room type(s)</span>
                <span>🕐 Check-in {h.checkInTime}</span>
              </div>
              {h.amenities?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {h.amenities.slice(0, 6).map((a) => (
                    <span key={a} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">{a}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => approve(h.id)} className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700 font-medium transition">
                Approve
              </button>
              <button onClick={() => toast('Rejection flow not implemented in demo', 'info')} className="border border-red-300 text-red-600 text-sm px-4 py-2 rounded-lg hover:bg-red-50 font-medium transition">
                Reject
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AdminReviews() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { adminApi.pendingReviews().then(setReviews).catch(console.error).finally(() => setLoading(false)); }, []);

  const approve = async (id: string) => {
    try {
      await adminApi.approveReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast('Review approved and published', 'success');
    } catch (e: unknown) { toast(e instanceof Error ? e.message : 'Failed', 'error'); }
  };

  const reject = async (id: string) => {
    try {
      await adminApi.rejectReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast('Review rejected', 'info');
    } catch (e: unknown) { toast(e instanceof Error ? e.message : 'Failed', 'error'); }
  };

  if (loading) return <div className="text-center py-16 text-gray-400">Loading reviews…</div>;

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <strong>Review Moderation Queue</strong> — All guest reviews require approval before appearing on hotel pages.
      </div>
      {reviews.length === 0 && (
        <div className="bg-white border rounded-xl p-12 text-center text-gray-400">
          <div className="text-4xl mb-3">🎉</div>
          <p className="font-medium">No pending reviews</p>
          <p className="text-sm mt-1">All reviews have been moderated.</p>
        </div>
      )}
      {reviews.map((r) => (
        <div key={r.id} className="bg-white border rounded-xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-semibold text-sm">{r.user?.name}</span>
                <span className="text-gray-400 text-xs">at {r.hotel?.name}</span>
                <div className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} className={i < r.rating ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                  ))}
                </div>
              </div>
              {r.title && <p className="font-medium text-sm mb-1">{r.title}</p>}
              <p className="text-gray-600 text-sm leading-relaxed">{r.body}</p>
              <p className="text-xs text-gray-400 mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <button onClick={() => approve(r.id)} className="bg-green-600 text-white text-xs px-3 py-2 rounded-lg hover:bg-green-700 font-medium transition">✓ Approve</button>
              <button onClick={() => reject(r.id)} className="bg-red-600 text-white text-xs px-3 py-2 rounded-lg hover:bg-red-700 font-medium transition">✗ Reject</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AdminAgents() {
  const [agents, setAgents] = useState<AdminAgent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { adminApi.agents().then(setAgents).catch(console.error).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="text-center py-16 text-gray-400">Loading agents…</div>;

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-indigo-50 text-indigo-700 rounded-xl p-4">
          <p className="text-xs font-medium opacity-70 uppercase tracking-wide">Active Agents</p>
          <p className="text-2xl font-bold mt-1">{agents.filter((a) => a.status === 'ACTIVE').length}</p>
        </div>
        <div className="bg-green-50 text-green-700 rounded-xl p-4">
          <p className="text-xs font-medium opacity-70 uppercase tracking-wide">Total Commission Paid</p>
          <p className="text-2xl font-bold mt-1">{formatBDT(agents.reduce((s, a) => s + a.totalCommissionBdt, 0))}</p>
        </div>
        <div className="bg-yellow-50 text-yellow-700 rounded-xl p-4">
          <p className="text-xs font-medium opacity-70 uppercase tracking-wide">Pending Payouts</p>
          <p className="text-2xl font-bold mt-1">{formatBDT(agents.reduce((s, a) => s + a.pendingCommissionBdt, 0))}</p>
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="p-4 border-b"><h2 className="font-semibold">Agent Directory</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">NID</th>
              <th className="px-4 py-3">Bookings</th>
              <th className="px-4 py-3">Total Comm.</th>
              <th className="px-4 py-3">Pending</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
            </tr></thead>
            <tbody className="divide-y">
              {agents.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-brand-700">{a.agentCode}</td>
                  <td className="px-4 py-3 font-medium">{a.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{a.phone}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{a.nidLast4}</td>
                  <td className="px-4 py-3 text-center">{a.totalBookings}</td>
                  <td className="px-4 py-3 font-medium text-green-700">{formatBDT(a.totalCommissionBdt)}</td>
                  <td className="px-4 py-3 font-medium text-yellow-700">{formatBDT(a.pendingCommissionBdt)}</td>
                  <td className="px-4 py-3"><Badge status={a.status} /></td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(a.joinedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminSettlements() {
  const [data, setData] = useState<{ agents: AgentSettlement[]; hotels: HotelSettlement[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'agents' | 'hotels'>('agents');

  useEffect(() => { adminApi.settlements().then(setData).catch(console.error).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="text-center py-16 text-gray-400">Loading settlements…</div>;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-white border rounded-xl p-1.5 w-fit">
        <button onClick={() => setView('agents')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${view === 'agents' ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Agent Settlements</button>
        <button onClick={() => setView('hotels')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${view === 'hotels' ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Hotel Settlements</button>
      </div>

      {view === 'agents' && (
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Agent Commission Settlements</h2>
            <button onClick={() => toast('CSV download not available in demo', 'info')} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg font-medium">Download CSV</button>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-4 py-3">Agent</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Period</th>
              <th className="px-4 py-3">Bookings</th>
              <th className="px-4 py-3">Commission</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr></thead>
            <tbody className="divide-y">
              {data.agents.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{s.agentName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-brand-700">{s.agentCode}</td>
                  <td className="px-4 py-3 text-gray-600">{s.period}</td>
                  <td className="px-4 py-3 text-center">{s.totalBookings}</td>
                  <td className="px-4 py-3 font-semibold">{formatBDT(s.commissionBdt)}</td>
                  <td className="px-4 py-3"><Badge status={s.status} /></td>
                  <td className="px-4 py-3">
                    {s.status === 'PENDING' && (
                      <button onClick={() => toast('Payment processing not available in demo', 'info')} className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700">Mark Paid</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === 'hotels' && (
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Hotel Revenue Settlements</h2>
            <button onClick={() => toast('CSV download not available in demo', 'info')} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg font-medium">Download CSV</button>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-4 py-3">Hotel</th>
              <th className="px-4 py-3">Period</th>
              <th className="px-4 py-3">Bookings</th>
              <th className="px-4 py-3">Net Revenue</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr></thead>
            <tbody className="divide-y">
              {data.hotels.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{s.hotelName}</td>
                  <td className="px-4 py-3 text-gray-600">{s.period}</td>
                  <td className="px-4 py-3 text-center">{s.totalBookings}</td>
                  <td className="px-4 py-3 font-semibold">{formatBDT(s.netRevenueBdt)}</td>
                  <td className="px-4 py-3"><Badge status={s.status} /></td>
                  <td className="px-4 py-3">
                    {s.status === 'PENDING' && (
                      <button onClick={() => toast('Payment processing not available in demo', 'info')} className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700">Mark Paid</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AdminLedger() {
  const entries = [
    { id: 'le_1', bookingRef: 'CBZ-2026-001', type: 'DEBIT', account: 'GUEST_RECEIVABLE', amountBdt: 12800, description: 'Booking payment received', createdAt: '2026-06-20T10:05:00Z' },
    { id: 'le_2', bookingRef: 'CBZ-2026-001', type: 'CREDIT', account: 'HOTEL_PAYABLE', amountBdt: 10000, description: 'Hotel revenue payable', createdAt: '2026-06-20T10:05:00Z' },
    { id: 'le_3', bookingRef: 'CBZ-2026-001', type: 'CREDIT', account: 'PLATFORM_REVENUE', amountBdt: 500, description: 'Platform fee (5%)', createdAt: '2026-06-20T10:05:00Z' },
    { id: 'le_4', bookingRef: 'CBZ-2026-001', type: 'CREDIT', account: 'VAT_PAYABLE', amountBdt: 1500, description: 'VAT collected (15%)', createdAt: '2026-06-20T10:05:00Z' },
    { id: 'le_5', bookingRef: 'CBZ-2026-001', type: 'CREDIT', account: 'AGENT_COMMISSION_PAYABLE', amountBdt: 800, description: 'Agent commission (8%)', createdAt: '2026-06-20T10:05:00Z' },
    { id: 'le_6', bookingRef: 'CBZ-2026-002', type: 'DEBIT', account: 'GUEST_RECEIVABLE', amountBdt: 8400, description: 'Booking payment received', createdAt: '2026-06-21T12:05:00Z' },
    { id: 'le_7', bookingRef: 'CBZ-2026-002', type: 'CREDIT', account: 'HOTEL_PAYABLE', amountBdt: 7000, description: 'Hotel revenue payable', createdAt: '2026-06-21T12:05:00Z' },
    { id: 'le_8', bookingRef: 'CBZ-2026-002', type: 'CREDIT', account: 'PLATFORM_REVENUE', amountBdt: 350, description: 'Platform fee (5%)', createdAt: '2026-06-21T12:05:00Z' },
    { id: 'le_9', bookingRef: 'CBZ-2026-002', type: 'CREDIT', account: 'VAT_PAYABLE', amountBdt: 1050, description: 'VAT collected (15%)', createdAt: '2026-06-21T12:05:00Z' },
  ];

  const totalDebits = entries.filter((e) => e.type === 'DEBIT').reduce((s, e) => s + e.amountBdt, 0);
  const totalCredits = entries.filter((e) => e.type === 'CREDIT').reduce((s, e) => s + e.amountBdt, 0);

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 text-blue-700 rounded-xl p-4">
          <p className="text-xs font-medium opacity-70 uppercase tracking-wide">Total Debits</p>
          <p className="text-2xl font-bold mt-1">{formatBDT(totalDebits)}</p>
          <p className="text-xs opacity-60 mt-1">Guest payments in</p>
        </div>
        <div className="bg-green-50 text-green-700 rounded-xl p-4">
          <p className="text-xs font-medium opacity-70 uppercase tracking-wide">Total Credits</p>
          <p className="text-2xl font-bold mt-1">{formatBDT(totalCredits)}</p>
          <p className="text-xs opacity-60 mt-1">Distributed to parties</p>
        </div>
        <div className={`rounded-xl p-4 ${totalDebits === totalCredits ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          <p className="text-xs font-medium opacity-70 uppercase tracking-wide">Balance (must = 0)</p>
          <p className="text-2xl font-bold mt-1">{formatBDT(totalDebits - totalCredits)}</p>
          <p className="text-xs opacity-60 mt-1">{totalDebits === totalCredits ? '✓ Balanced' : '⚠ Imbalanced'}</p>
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Double-Entry Ledger</h2>
          <p className="text-xs text-gray-500 mt-0.5">Every booking creates balanced debit/credit entries. Total debits must always equal total credits.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-4 py-3">Booking Ref</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Account</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">Date</th>
            </tr></thead>
            <tbody className="divide-y">
              {entries.map((e) => (
                <tr key={e.id} className={`hover:bg-gray-50 ${e.type === 'DEBIT' ? 'bg-blue-50/30' : ''}`}>
                  <td className="px-4 py-3 font-mono text-xs text-brand-700 font-semibold">{e.bookingRef}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-semibold ${e.type === 'DEBIT' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {e.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{e.account}</td>
                  <td className="px-4 py-3 text-gray-600">{e.description}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${e.type === 'DEBIT' ? 'text-blue-700' : 'text-green-700'}`}>
                    {e.type === 'DEBIT' ? '+' : '-'}{formatBDT(e.amountBdt)}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(e.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 bg-gray-50 font-semibold">
                <td colSpan={4} className="px-4 py-3 text-sm">Totals</td>
                <td className="px-4 py-3 text-right text-sm">
                  <span className="text-blue-700">+{formatBDT(totalDebits)}</span>
                  {' / '}
                  <span className="text-green-700">-{formatBDT(totalCredits)}</span>
                </td>
                <td className="px-4 py-3" />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
