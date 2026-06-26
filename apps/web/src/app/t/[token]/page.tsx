'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { agentApi } from '@/lib/api';

export default function AgentTrackedLanding() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'ok' | 'invalid'>('loading');
  const [agentName, setAgentName] = useState('');

  useEffect(() => {
    if (!token) { setStatus('invalid'); return; }

    agentApi.createAttribution(token as string)
      .then((res) => {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('agentSession', res.sessionId);
        }
        const name = (res as { sessionId: string; agentName?: string }).agentName || '';
        setAgentName(name);
        setStatus('ok');
        // Redirect to search after 2 seconds so the user sees the confirmation
        setTimeout(() => router.push('/'), 2000);
      })
      .catch(() => setStatus('invalid'));
  }, [token, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-700 to-brand-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Verifying agent link…</p>
          </>
        )}

        {status === 'ok' && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Agent Session Started</h1>
            {agentName && (
              <p className="text-brand-700 font-medium mb-3">Referred by: {agentName}</p>
            )}
            <p className="text-gray-500 text-sm mb-6">
              Your booking will earn this agent their commission.
              You have <strong>24 hours</strong> to complete your booking.
            </p>
            <div className="bg-brand-50 rounded-lg p-3 text-xs text-brand-700 mb-6">
              🏖️ Redirecting you to CoxBeach…
            </div>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-brand-600 text-white py-2.5 rounded-lg font-semibold hover:bg-brand-700 transition"
            >
              Search Hotels Now
            </button>
          </>
        )}

        {status === 'invalid' && (
          <>
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid or Expired Link</h1>
            <p className="text-gray-500 text-sm mb-6">
              This agent link is no longer valid. You can still book directly without an agent referral.
            </p>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-brand-600 text-white py-2.5 rounded-lg font-semibold hover:bg-brand-700 transition"
            >
              Browse Hotels
            </button>
          </>
        )}

        <p className="text-xs text-gray-400 mt-4">
          CoxBeach — Cox&apos;s Bazar Hotel Booking
        </p>
      </div>
    </div>
  );
}
