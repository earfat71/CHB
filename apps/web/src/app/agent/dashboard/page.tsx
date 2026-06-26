'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { agentApi } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { formatBDT, formatDate } from '@/lib/utils';

interface AgentProfile {
  agentCode: string;
  status: string;
  walletBalance: number;
  commissionRate: number;
  qrCodeUrl?: string;
  totalEarned?: number;
  attributions?: Array<{
    sessionId: string;
    booking?: { bookingRef: string; grandTotalBdt: number; agentCommBdt: number; status: string; createdAt: string };
  }>;
}

export default function AgentDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    Promise.all([agentApi.myProfile(), agentApi.myEarnings()])
      .then(([p, e]) => setProfile({ ...(p as AgentProfile), ...(e as AgentProfile) }))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>;
  if (!profile) return <div className="text-center py-16 text-red-600">Agent profile not found. <a href="/agent/register" className="text-brand-600 underline">Register here</a></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Agent Dashboard</h1>

      {profile.status !== 'ACTIVE' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-yellow-800 text-sm">
          ⏳ Your agent account is pending verification. You&apos;ll be notified once approved.
        </div>
      )}

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Agent Code', value: profile.agentCode, icon: '🆔' },
          { label: 'Wallet Balance', value: formatBDT(profile.walletBalance || 0), icon: '💰' },
          { label: 'Total Earned', value: formatBDT(profile.totalEarned || 0), icon: '📈' },
          { label: 'Commission Rate', value: `${((profile.commissionRate || 0) * 100).toFixed(0)}%`, icon: '💹' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border rounded-xl p-4">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className="font-bold text-lg">{stat.value}</p>
          </div>
        ))}
      </div>

      {profile.qrCodeUrl && (
        <div className="bg-white border rounded-xl p-6 mb-6">
          <h2 className="font-semibold mb-4">Your QR Code</h2>
          <div className="flex gap-6 items-start">
            <img src={profile.qrCodeUrl} alt="Agent QR Code" className="w-40 h-40" />
            <div>
              <p className="text-gray-600 text-sm mb-3">Share this QR code with customers. When they scan it and make a booking within 72 hours, you earn your commission automatically.</p>
              <button onClick={() => {
                const a = document.createElement('a');
                a.href = profile.qrCodeUrl!;
                a.download = `${profile.agentCode}-qr.png`;
                a.click();
              }} className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-700 transition">
                Download QR Code
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold mb-4">Attribution History</h2>
        {profile.attributions && profile.attributions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-gray-500">
                <th className="pb-2">Booking Ref</th>
                <th className="pb-2">Total</th>
                <th className="pb-2">Commission</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Date</th>
              </tr></thead>
              <tbody>
                {profile.attributions.filter((a) => a.booking).map((a) => (
                  <tr key={a.sessionId} className="border-b last:border-0">
                    <td className="py-2 font-mono">{a.booking!.bookingRef}</td>
                    <td className="py-2">{formatBDT(a.booking!.grandTotalBdt)}</td>
                    <td className="py-2 text-green-600 font-medium">{formatBDT(a.booking!.agentCommBdt)}</td>
                    <td className="py-2"><span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded">{a.booking!.status}</span></td>
                    <td className="py-2 text-gray-500">{formatDate(a.booking!.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No bookings attributed yet. Share your QR code to start earning!</p>
        )}
      </div>
    </div>
  );
}
