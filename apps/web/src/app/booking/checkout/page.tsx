'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { bookingApi, paymentApi, Booking, PaymentResponse } from '@/lib/api';
import { PriceBreakdown } from '@/components/PriceBreakdown';
import { formatDate, formatBDT } from '@/lib/utils';
import { toast } from '@/components/ui/toaster';
import { useAuth } from '@/components/AuthProvider';

const GATEWAYS = [
  { id: 'BKASH', label: 'bKash', color: 'border-red-200 hover:border-red-400', selected: 'border-red-500 bg-red-50', logo: '🔴' },
  { id: 'NAGAD', label: 'Nagad', color: 'border-orange-200 hover:border-orange-400', selected: 'border-orange-500 bg-orange-50', logo: '🟠' },
  { id: 'ROCKET', label: 'Rocket', color: 'border-purple-200 hover:border-purple-400', selected: 'border-purple-500 bg-purple-50', logo: '🟣' },
  { id: 'SSLCOMMERZ', label: 'Card / SSLCommerz', color: 'border-blue-200 hover:border-blue-400', selected: 'border-blue-500 bg-blue-50', logo: '💳' },
];

function CheckoutPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const bookingId = sp.get('bookingId') || '';

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [gateway, setGateway] = useState('BKASH');
  const [paying, setPaying] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<PaymentResponse | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!bookingId) { router.push('/'); return; }
    bookingApi.get(bookingId)
      .then(setBooking)
      .catch(() => { toast('Booking not found', 'error'); router.push('/my-bookings'); })
      .finally(() => setLoading(false));
  }, [bookingId, router]);

  const tick = useCallback(() => {
    if (!booking?.holdExpiresAt) return;
    const left = Math.max(0, Math.floor((new Date(booking.holdExpiresAt).getTime() - Date.now()) / 1000));
    setTimeLeft(left);
    if (left === 0 && !expired) {
      setExpired(true);
      toast('Your hold has expired. Please search again.', 'error');
    }
  }, [booking, expired]);

  useEffect(() => {
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  const handlePay = async () => {
    if (!booking) return;
    setPaying(true);
    try {
      const result = await paymentApi.initiate(booking.id, gateway);
      setPaymentInfo(result);
      toast('Payment initiated — click Confirm to simulate success', 'info');
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Payment failed', 'error');
    } finally {
      setPaying(false);
    }
  };

  const handleSimulateSuccess = async () => {
    if (!paymentInfo || !booking) return;
    setPaying(true);
    try {
      const txnId = `SANDBOX-TXN-${Date.now()}`;
      await paymentApi.confirmSandbox(gateway, booking.id, txnId);
      toast('Payment confirmed! Redirecting…', 'success');
      router.push(`/booking/confirmation?bookingId=${booking.id}`);
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Confirmation failed', 'error');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-gray-500 text-sm">Loading checkout…</p>
      </div>
    </div>
  );
  if (!booking) return null;

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timerColor = timeLeft < 120 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200';

  // Build pricing object from booking for PriceBreakdown
  const pricingObj = {
    baseTotalBdt: booking.baseTotalBdt,
    platformFeeBdt: booking.platformFeeBdt,
    agentCommBdt: booking.agentCommBdt,
    vatBdt: booking.vatBdt,
    grandTotalBdt: booking.grandTotalBdt,
    nights: booking.nights,
    pricePerNight: Math.round(booking.baseTotalBdt / booking.nights),
    rates: {
      vatRate: 0.15,
      platformFeeRate: 0.08,
      agentCommRate: booking.agentCommBdt > 0 ? 0.05 : 0,
    },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display text-gray-900">Secure Checkout</h1>
        <p className="text-sm text-gray-500 mt-1">Complete your payment to confirm the booking</p>
      </div>

      {/* Hold Timer */}
      {booking.holdExpiresAt && timeLeft > 0 && (
        <div className={`mb-6 p-3 rounded-xl flex items-center gap-3 text-sm border ${timerColor}`}>
          <div className="text-lg">⏱</div>
          <div>
            <span className="font-medium">Room held for </span>
            <span className="font-bold tabular-nums">{mins}:{secs.toString().padStart(2, '0')}</span>
            {timeLeft < 120 && <span className="ml-2 text-xs">— Act quickly!</span>}
          </div>
        </div>
      )}

      {expired && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <p className="font-semibold">Hold expired</p>
          <p className="mt-1">Your room hold has expired. Please <a href="/search" className="underline font-medium">search again</a> to book a new room.</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Booking Summary + Price */}
        <div className="space-y-4">
          <div className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Booking Summary</h2>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Reference</span>
                <span className="font-mono font-semibold text-brand-700">{booking.bookingRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Hotel</span>
                <span className="font-medium text-right max-w-[60%]">{booking.hotel?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Check-in</span>
                <span>{formatDate(booking.checkIn)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Check-out</span>
                <span>{formatDate(booking.checkOut)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Duration</span>
                <span>{booking.nights} night{booking.nights > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Guests</span>
                <span>{booking.guestCount} guest{booking.guestCount > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          <PriceBreakdown pricing={pricingObj} />

          {booking.agentCommBdt > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-700 flex items-center gap-2">
              <span>✓</span>
              <span>Agent referral applied — 5% commission included</span>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700 flex items-center gap-2">
            <span>🔒</span>
            <span>SANDBOX MODE — No real money charged. This is a demo environment.</span>
          </div>
        </div>

        {/* Right: Payment + Guest details */}
        <div className="space-y-4">
          <div className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Payment Method</h2>
            <div className="space-y-2 mb-5">
              {GATEWAYS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => { setGateway(g.id); setPaymentInfo(null); }}
                  className={`w-full flex items-center gap-3 p-3 border-2 rounded-xl transition text-left ${gateway === g.id ? g.selected : g.color + ' bg-white'}`}
                >
                  <span className="text-xl">{g.logo}</span>
                  <span className="font-medium text-sm">{g.label}</span>
                  {gateway === g.id && <span className="ml-auto text-brand-600 font-bold text-sm">✓ Selected</span>}
                </button>
              ))}
            </div>

            {!paymentInfo ? (
              <button
                onClick={handlePay}
                disabled={paying || expired}
                className="w-full bg-marigold-500 hover:bg-marigold-600 text-gray-900 py-3 rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paying ? 'Processing…' : `Pay ${formatBDT(booking.grandTotalBdt)} via ${gateway}`}
              </button>
            ) : (
              <div className="space-y-3">
                <div className="bg-sand-50 border border-sand-200 rounded-xl p-4 text-xs text-gray-700">
                  <p className="font-semibold text-gray-900 mb-2">Sandbox Instructions</p>
                  <p className="leading-relaxed">{paymentInfo.instructions}</p>
                </div>
                <button
                  onClick={handleSimulateSuccess}
                  disabled={paying}
                  className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition disabled:opacity-50"
                >
                  {paying ? 'Confirming…' : '✓ Simulate Successful Payment'}
                </button>
                <button
                  onClick={() => setPaymentInfo(null)}
                  className="w-full text-sm text-gray-500 hover:underline"
                >
                  ← Change payment method
                </button>
              </div>
            )}
          </div>

          <div className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Guest Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Name</span>
                <span className="font-medium">{user?.name ?? booking.guestName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phone</span>
                <span className="font-mono">{user?.phone ?? booking.guestPhone}</span>
              </div>
              {(user?.email || booking.guestEmail) && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span>{user?.email || booking.guestEmail}</span>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">
            By completing payment you agree to our{' '}
            <a href="/terms" className="underline">Terms & Conditions</a> and{' '}
            <a href="/refund-policy" className="underline">Refund Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">Loading…</div>}>
      <CheckoutPage />
    </Suspense>
  );
}
