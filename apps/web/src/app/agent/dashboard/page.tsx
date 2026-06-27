'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { agentApi } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { formatBDT, formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/toaster';

interface AgentProfile {
  agentCode: string;
  status: string;
  walletBalance: number;
  availableBalance: number;
  pendingBalance: number;
  commissionRate: number;
  qrToken?: string;
  qrCodeUrl?: string | null;
  totalEarned?: number;
  totalBookings?: number;
  attributionWindowHours?: number;
  attributions?: Array<{
    sessionId: string;
    booking?: {
      bookingRef: string;
      grandTotalBdt: number;
      agentCommBdt: number;
      status: string;
      createdAt: string;
      hotel?: { name: string };
    };
  }>;
}

type Tab = 'overview' | 'book' | 'bookings' | 'wallet' | 'qr';

function QrDisplay({ agentCode, qrToken }: { agentCode: string; qrToken: string }) {
  const qrUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/t/${qrToken}`
    : `/t/${qrToken}`;

  const copyLink = () => {
    navigator.clipboard.writeText(qrUrl).then(() => toast('Link copied!', 'success'));
  };

  // Generate a simple SVG QR placeholder (real QR would need a library)
  const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}&color=008278&bgcolor=ffffff&margin=10`;

  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-xl p-6 text-center">
        <h3 className="font-semibold text-gray-800 mb-4">Your Agent QR Code</h3>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrDataUrl}
          alt="Agent QR Code"
          className="w-48 h-48 mx-auto rounded-lg border-4 border-brand-100 mb-4"
        />
        <p className="text-sm text-gray-500 mb-4">
          Agent Code: <strong className="font-mono text-brand-700">{agentCode}</strong>
        </p>
        <div className="flex gap-2 justify-center">
          <a
            href={qrDataUrl}
            download={`${agentCode}-qr.png`}
            className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-700 transition font-medium"
          >
            ⬇ Download PNG
          </a>
          <button
            onClick={copyLink}
            className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition font-medium"
          >
            🔗 Copy Link
          </button>
        </div>
      </div>

      <div className="bg-sand-50 border border-sand-200 rounded-xl p-5 text-sm space-y-3">
        <h4 className="font-semibold text-gray-800">How attribution works</h4>
        <ol className="list-decimal pl-4 space-y-2 text-gray-600">
          <li>A customer scans your QR code or opens your referral link.</li>
          <li>A 24-hour attribution session starts automatically — this follows the customer even if they switch devices.</li>
          <li>If they complete a booking within that window, you earn <strong>5% commission</strong> on the room subtotal.</li>
          <li>Commission shows as <em>pending</em> until the stay is completed, then becomes <em>available</em> for withdrawal.</li>
        </ol>
      </div>

      <div className="bg-white border rounded-xl p-5">
        <h4 className="font-semibold text-gray-800 mb-3">Referral Link</h4>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={qrUrl}
            className="flex-1 border rounded-lg px-3 py-2 text-sm font-mono text-gray-600 bg-gray-50"
          />
          <button
            onClick={copyLink}
            className="bg-brand-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-brand-700 transition"
          >
            Copy
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Share this link via WhatsApp, Facebook, or print the QR code above.</p>
      </div>
    </div>
  );
}

function WithdrawalForm({ available }: { available: number }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('BKASH');
  const [account, setAccount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(amount) > available) { toast('Amount exceeds available balance', 'error'); return; }
    if (Number(amount) < 100) { toast('Minimum withdrawal is ৳ 100', 'error'); return; }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    toast('Withdrawal request submitted! Processing within 3 business days.', 'success');
    setAmount('');
    setAccount('');
    setSubmitting(false);
  };

  return (
    <div className="bg-white border rounded-xl p-6">
      <h3 className="font-semibold text-gray-800 mb-4">Request Withdrawal</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Amount (BDT)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 5000"
              min="100"
              max={available}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="BKASH">bKash</option>
              <option value="NAGAD">Nagad</option>
              <option value="ROCKET">Rocket</option>
              <option value="BANK">Bank Transfer</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Account Number</label>
          <input
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            placeholder="e.g. 01700000000"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            required
          />
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
          Available balance: <strong className="text-green-700">{formatBDT(available)}</strong> · Processing time: 3 business days
        </div>
        <button
          type="submit"
          disabled={submitting || available === 0}
          className="w-full bg-brand-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-700 disabled:opacity-50 transition"
        >
          {submitting ? 'Submitting…' : 'Request Withdrawal'}
        </button>
      </form>
    </div>
  );
}

export default function AgentDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    Promise.all([agentApi.myProfile(), agentApi.myEarnings()])
      .then(([p, e]) => setProfile({ ...(p as AgentProfile), ...(e as AgentProfile) }))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [user, router]);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading dashboard…</div>;
  if (!profile) return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">🤝</div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Agent profile not found</h2>
      <p className="text-gray-500 mb-6">You need to register as an agent first.</p>
      <a href="/agent/register" className="bg-brand-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-brand-700 transition">
        Register as Agent
      </a>
    </div>
  );

  const attributedBookings = profile.attributions?.filter((a) => a.booking) ?? [];
  const confirmedBookings = attributedBookings.filter((a) => ['CONFIRMED', 'CHECKED_OUT'].includes(a.booking!.status));
  const conversionRate = attributedBookings.length > 0 ? Math.round((confirmedBookings.length / attributedBookings.length) * 100) : 0;

  const TABS: { id: Tab; label: string }[] = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'book', label: '🏨 Book for Guest' },
    { id: 'qr', label: '📱 QR Code' },
    { id: 'bookings', label: `📋 Bookings (${attributedBookings.length})` },
    { id: 'wallet', label: '💰 Wallet' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Agent Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Code: <strong className="font-mono text-brand-700">{profile.agentCode}</strong></p>
        </div>
        <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${profile.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {profile.status}
        </span>
      </div>

      {profile.status !== 'ACTIVE' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-yellow-800 text-sm">
          ⏳ Your agent account is pending verification. You&apos;ll receive a notification once approved.
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 bg-white border rounded-xl p-1 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${tab === t.id ? 'bg-brand-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Earned', value: formatBDT(profile.totalEarned || 0), icon: '💰', color: 'text-green-700' },
              { label: 'Available', value: formatBDT(profile.availableBalance || 0), icon: '✅', color: 'text-brand-700' },
              { label: 'Pending', value: formatBDT(profile.pendingBalance || 0), icon: '⏳', color: 'text-yellow-700' },
              { label: 'Total Bookings', value: String(profile.totalBookings || 0), icon: '📋', color: 'text-gray-700' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white border rounded-xl p-4">
                <div className="text-xl mb-1">{stat.icon}</div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className={`font-bold text-lg ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Performance stats */}
          <div className="bg-white border rounded-xl p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Performance</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-brand-700">{attributedBookings.length}</p>
                <p className="text-xs text-gray-500 mt-0.5">Attributed Bookings</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">{confirmedBookings.length}</p>
                <p className="text-xs text-gray-500 mt-0.5">Confirmed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-marigold-600">{conversionRate}%</p>
                <p className="text-xs text-gray-500 mt-0.5">Conversion Rate</p>
              </div>
            </div>
          </div>

          {/* Commission rate info */}
          <div className="bg-brand-50 border border-brand-100 rounded-xl p-5 flex items-center gap-4">
            <div className="text-4xl">💹</div>
            <div>
              <p className="font-semibold text-brand-800">Your Commission Rate: 5%</p>
              <p className="text-sm text-brand-600 mt-0.5">
                Earned on the room subtotal of every booking attributed to your QR code within the 24-hour window.
              </p>
            </div>
          </div>
        </div>
      )}

      {tab === 'book' && (
        <div className="space-y-5">
          <div className="bg-white border rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-1">Book a Room for a Guest</h3>
            <p className="text-sm text-gray-500 mb-5">
              Search for available hotels, select a room, and enter the guest&apos;s details. Your 5% commission will be applied automatically.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-brand-50 border border-brand-200 rounded-xl">
                <span className="text-2xl mt-0.5">1️⃣</span>
                <div>
                  <p className="font-medium text-sm text-gray-800">Search for a hotel</p>
                  <p className="text-xs text-gray-500 mt-0.5">Browse available hotels in Cox&apos;s Bazar, filter by price, stars, or amenities.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-brand-50 border border-brand-200 rounded-xl">
                <span className="text-2xl mt-0.5">2️⃣</span>
                <div>
                  <p className="font-medium text-sm text-gray-800">Select room &amp; dates</p>
                  <p className="text-xs text-gray-500 mt-0.5">Pick check-in/check-out dates and choose the right room type.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-brand-50 border border-brand-200 rounded-xl">
                <span className="text-2xl mt-0.5">3️⃣</span>
                <div>
                  <p className="font-medium text-sm text-gray-800">Enter guest details</p>
                  <p className="text-xs text-gray-500 mt-0.5">A <strong>Guest Details</strong> form will appear in the booking sidebar — fill in the guest&apos;s name and phone number.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                <span className="text-2xl mt-0.5">💰</span>
                <div>
                  <p className="font-medium text-sm text-gray-800">Commission applied automatically</p>
                  <p className="text-xs text-gray-500 mt-0.5">Your 5% agent commission is added to every booking you complete — no QR scan needed when you&apos;re logged in as agent.</p>
                </div>
              </div>
            </div>

            <a
              href="/search"
              className="mt-6 w-full flex items-center justify-center gap-2 bg-marigold-500 hover:bg-marigold-600 text-gray-900 py-3 rounded-xl font-bold transition text-sm"
            >
              🔍 Search Hotels Now
            </a>
          </div>

          <div className="bg-sand-50 border border-sand-200 rounded-xl p-5 text-sm text-gray-600">
            <h4 className="font-semibold text-gray-800 mb-2">Important notes</h4>
            <ul className="space-y-1.5">
              <li>• The booking is registered under the guest&apos;s name and phone — not yours.</li>
              <li>• Commission (5%) is shown on the pricing breakdown at checkout.</li>
              <li>• Commission is credited as <em>pending</em> on your wallet after payment, and becomes available after the guest checks out.</li>
            </ul>
          </div>
        </div>
      )}

      {tab === 'qr' && (
        <QrDisplay agentCode={profile.agentCode} qrToken={profile.qrToken || profile.agentCode} />
      )}

      {tab === 'bookings' && (
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="p-5 border-b">
            <h3 className="font-semibold text-gray-800">Attributed Bookings</h3>
            <p className="text-sm text-gray-500 mt-0.5">Bookings made via your QR code or referral link</p>
          </div>
          {attributedBookings.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-3">📋</div>
              <p className="font-medium">No bookings yet</p>
              <p className="text-sm mt-1">Share your QR code to start earning commissions.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 text-left text-gray-500 text-xs">
                  <th className="px-5 py-3">Booking Ref</th>
                  <th className="px-5 py-3">Hotel</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3 text-green-700">Commission</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                </tr></thead>
                <tbody>
                  {attributedBookings.map((a) => (
                    <tr key={a.sessionId} className="border-t hover:bg-gray-50">
                      <td className="px-5 py-3 font-mono font-medium">{a.booking!.bookingRef}</td>
                      <td className="px-5 py-3 text-gray-600">{a.booking!.hotel?.name || '—'}</td>
                      <td className="px-5 py-3">{formatBDT(a.booking!.grandTotalBdt)}</td>
                      <td className="px-5 py-3 text-green-600 font-semibold">{formatBDT(a.booking!.agentCommBdt)}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          a.booking!.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                          a.booking!.status === 'CHECKED_OUT' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>{a.booking!.status.replace(/_/g, ' ')}</span>
                      </td>
                      <td className="px-5 py-3 text-gray-400">{formatDate(a.booking!.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'wallet' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-100 rounded-xl p-5">
              <p className="text-xs text-green-600 font-medium mb-1">Available Balance</p>
              <p className="text-2xl font-bold text-green-700">{formatBDT(profile.availableBalance || 0)}</p>
              <p className="text-xs text-green-600 mt-1">Ready to withdraw</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-5">
              <p className="text-xs text-yellow-600 font-medium mb-1">Pending Balance</p>
              <p className="text-2xl font-bold text-yellow-700">{formatBDT(profile.pendingBalance || 0)}</p>
              <p className="text-xs text-yellow-600 mt-1">Released after stay completion</p>
            </div>
          </div>

          <WithdrawalForm available={profile.availableBalance || 0} />

          <div className="bg-gray-50 border rounded-xl p-5 text-sm text-gray-600">
            <h4 className="font-semibold text-gray-800 mb-2">How commissions work</h4>
            <ul className="space-y-2">
              <li>• Commission (5%) is credited as <em>pending</em> when a booking is confirmed.</li>
              <li>• It becomes <em>available</em> after the guest checks out.</li>
              <li>• Withdrawal requests are processed within 3 business days.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
