'use client';

import { useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { agentApi } from '@/lib/api';
import { toast } from '@/components/ui/toaster';

function AgentLanding() {
  const { agentCode } = useParams<{ agentCode: string }>();
  const router = useRouter();

  useEffect(() => {
    agentApi.createAttribution(agentCode as string)
      .then(({ sessionId }) => {
        sessionStorage.setItem('agentSession', sessionId);
        toast(`You're browsing with agent ${agentCode} — exclusive rates apply!`, 'success');
        router.push('/');
      })
      .catch(() => {
        toast('Agent link expired or invalid', 'error');
        router.push('/');
      });
  }, [agentCode]);

  return (
    <div className="flex items-center justify-center h-64 text-gray-500">
      <div className="text-center">
        <div className="text-4xl mb-4">🔗</div>
        <p>Loading agent session...</p>
      </div>
    </div>
  );
}

export default function AgentLandingPage() {
  return <Suspense fallback={null}><AgentLanding /></Suspense>;
}
