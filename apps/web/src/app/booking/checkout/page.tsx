'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { bookingApi, paymentApi, Booking, PaymentResponse } from '@/lib/api';
import { PriceBreakdown } from '@/components/PriceBreakdown';
import { formatDate, formatBDT } from '@/lib/utils';
import { toast } from '@/components/ui/toaster';
import { useAuth } from '@/components/AuthProvider';

const GATEWAYS = [
  { id: 'BKASH', label: 'bKash', icon: '🔴', color: 'border-red-200 hover:border-red-400' },
  { id: 'NAGAD', label: 'Nagad', icon: '🟠', color: 'border-orange-200 hover:border-orange-400' },
  { id: 'ROCKET', label: 'Rocket', icon: '🟣', color: 'border-purple-200 hover:border-purple-400' },
  { id: 'SSLCOMMERZ', label: 'Card / SSLCommerz', icon: '💳', color: 'border-blue-200 hover:border-blue-400' },
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

  useEffect(() => {
    if (!bookingId) return;
    bookingApi.get(bookingId)
      .then(setBooking)
      .catch((e) => { toast(e.message, 'error'); router.push('/'); })
      .finally(() => setLoading(false));
  }, [bookingId]);

  useEffect(() => {
    if (!booking?.holdExpiresAt) return;
    const update = () => {
      const left = Math.max(0, Math.floor((new Date(booking.holdExpiresAt!).getTime() - Date.now()) / 1000));
      setTimeLeft(left);
      if (left === 0) toast('Booking hold expired. Please search again.', 'error');
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [booking]);

  const handlePay = async () => {
    if (!booking) return;
    setPaying(true);
    try {
      const result = await paymentApi.initiate(booking.id, gateway);
      setPaymentInfo(result);
      toast('Sandbox payment initiated! Click "Confirm Payment" to simulate success.', 'info');
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
      toast('Payment confirmed!', 'success');
      router.push(`/booking/confirmation?bookingId=${booking.id}`);
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Confirmation failed', 'error');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64">Loading checkout...</div>;
  if (!booking) return null;

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Secure Checkout</h1>

      {/* Hold Timer */}
      {timeLeft > 0 && (
        <div className={`mb-6 p-3 rounded-lg flex items-center gap-2 text-sm ${timeLeft < 120 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
          ⏱ Room held for: <strong>{mins}:{secs.toString().padStart(2, '0')}</strong>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Booking Summary */}
        <div className="space-y-4">
          <div className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold mb-4">Booking Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Booking Ref</span><span className="font-mono font-medium">{booking.bookingRef}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Hotel</span><span>{booking.hotel?.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Check-in</span><span>{formatDate(booking.checkIn)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Check-out</span><span>{formatDate(booking.checkOut)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Nights</span><span>{booking.nights}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Guests</span><span>{booking.guestCount}</span></div>
            </div>
          </div>

          <PriceBreakdown
            pricing={{
              baseTotalBdt: booking.baseTotalBdt,
              platformFeeBdt: booking.platformFeeBdt,
              agentCommBdt: booking.agentCommBdt,
              vatBdt: booking.vatBdt,
              grandTotalBdt: booking.grandTotalBdt,
              nights: booking.nights,
              pricePerNight: Math.round(booking.baseTotalBdt / booking.nights),
              rates: { vatRate: 0.15, platformFeeRate: 0.05, agentCommRate: booking.agentCommBdt > 0 ? 0.08 : 0 },
            }}
          />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
            🔒 SANDBOX MODE — No real money will be charged. This is a test environment.
          </div>
        </div>

        {/* Payment */}
        <div className="space-y-4">
          <div className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold mb-4">Select Payment Method</h2>
            <div className="space-y-2 mb-6">
              {GATEWAYS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGateway(g.id)}
                  className={`w-full flex items-center gap-3 p-3 border-2 rounded-lg transition ${gateway === g.id ? 'border-brand-600 bg-brand-50' : g.color}`}
                >
                  <span className="text-2xl">{g.icon}</span>
                  <span className="font-medium">{g.label}</span>
                  {gateway === g.id && <span className="ml-auto text-brand-600 font-bold">✓</span>}
                </button>
              ))}
            </div>

            {!paymentInfo ? (
              <button
                onClick={handlePay}
                disabled={paying}
                className="w-full bg-brand-600 text-white py-3 rounded-lg font-semibold hover:bg-brand-700 transition disabled:opacity-50"
              >
                {paying ? 'Processing...' : `Pay ${formatBDT(booking.grandTotalBdt)} via ${gateway}`}
              </button>
            ) : (
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
                  <p className="font-medium text-gray-800 mb-1">Sandbox Payment Ready</p>
                  <p>{paymentInfo.instructions}</p>
                </div>
                <button
                  onClick={handleSimulateSuccess}
                  disabled={paying}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                >
                  {paying ? 'Confirming...' : '✓ Simulate Successful Payment'}
                </button>
              </div>
            )}

            <p className="text-xs text-gray-400 text-center mt-3">
              Payments secured via bKash, Nagad, Rocket & SSLCommerz
            </p>
          </div>

          <div className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold mb-3">Guest Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Name</span><span>{user?.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Phone</span><span>{user?.phone}</span></div>
              {user?.email && <div className="flex justify-between"><span className="text-gray-600">Email</span><span>{user.email}</span></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
      <CheckoutPage />
    </Suspense>
  );
}
