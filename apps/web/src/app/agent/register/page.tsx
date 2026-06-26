'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { agentApi } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { toast } from '@/components/ui/toaster';

export default function AgentRegisterPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [nid, setNid] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ agentCode: string; qrCodeUrl?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push('/auth/login?redirect=/agent/register'); return; }
    setLoading(true);
    try {
      const data = await agentApi.register(nid) as { agentCode: string; qrCodeUrl?: string };
      setResult(data);
      toast('Agent application submitted for verification!', 'success');
    } catch (e: unknown) { toast(e instanceof Error ? e.message : 'Registration failed', 'error'); }
    finally { setLoading(false); }
  };

  if (result) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🎊</div>
        <h1 className="text-2xl font-bold mb-2">Application Submitted!</h1>
        <p className="text-gray-600 mb-6">Your agent application is under review. You&apos;ll be notified once approved.</p>
        <div className="bg-white border rounded-xl p-6 mb-6">
          <p className="text-sm text-gray-600 mb-2">Your Agent Code</p>
          <p className="text-2xl font-mono font-bold text-brand-700">{result.agentCode}</p>
        </div>
        {result.qrCodeUrl && (
          <div className="bg-white border rounded-xl p-6">
            <p className="text-sm text-gray-600 mb-4">Your QR Code (share with customers)</p>
            <img src={result.qrCodeUrl} alt="Agent QR Code" className="mx-auto w-48 h-48" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <div className="text-4xl mb-2">🤝</div>
        <h1 className="text-2xl font-bold">Become a CoxBeach Agent</h1>
        <p className="text-gray-600 mt-2">Earn commission on every booking. Get your unique QR code.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: '📱', label: 'Share your QR' },
          { icon: '🏨', label: 'Customer books' },
          { icon: '💰', label: 'You earn 8%' },
        ].map((s) => (
          <div key={s.label} className="text-center p-3 bg-brand-50 rounded-lg">
            <div className="text-2xl mb-1">{s.icon}</div>
            <p className="text-xs font-medium text-brand-700">{s.label}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">National ID Number (NID) *</label>
          <input
            type="text"
            value={nid}
            onChange={(e) => setNid(e.target.value)}
            placeholder="Enter your NID number"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">🔒 Your NID is encrypted and stored securely. Only the last 4 digits are visible.</p>
        </div>

        {!user && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
            Please <a href="/auth/login?redirect=/agent/register" className="font-medium underline">log in</a> first to register as an agent.
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !user}
          className="w-full bg-brand-600 text-white py-3 rounded-lg font-semibold hover:bg-brand-700 transition disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Apply as Agent'}
        </button>
      </form>
    </div>
  );
}
