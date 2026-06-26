'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { bookingApi, Booking } from '@/lib/api';
import { formatDate, formatBDT } from '@/lib/utils';

function ConfirmationPage() {
  const sp = useSearchParams();
  const bookingId = sp.get('bookingId') || '';
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (bookingId) bookingApi.get(bookingId).then(setBooking).catch(console.error);
  }, [bookingId]);

  if (!booking) return <div className="flex items-center justify-center h-64">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="text-6xl mb-6">🎉</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
      <p className="text-gray-600 mb-8">Your stay at {booking.hotel?.name} is all set.</p>

      <div className="bg-white border rounded-xl p-6 text-left mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Booking Details</h2>
          <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">Confirmed</span>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-gray-600">Booking Reference</span><span className="font-mono font-bold text-brand-700 text-base">{booking.bookingRef}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Hotel</span><span>{booking.hotel?.name}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Check-in</span><span>{formatDate(booking.checkIn)}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Check-out</span><span>{formatDate(booking.checkOut)}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Duration</span><span>{booking.nights} night{booking.nights > 1 ? 's' : ''}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Guests</span><span>{booking.guestCount}</span></div>
          <div className="border-t pt-3 flex justify-between font-bold"><span>Total Paid</span><span className="text-brand-700 text-lg">{formatBDT(booking.grandTotalBdt)}</span></div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 mb-8">
        A confirmation has been queued to your registered email and phone number.
        Please show your booking reference at check-in.
      </div>

      <div className="flex gap-4 justify-center">
        <Link href="/my-bookings" className="bg-brand-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-700 transition">
          View My Bookings
        </Link>
        <Link href="/" className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmationWrapper() {
  return (
    <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading...</div>}>
      <ConfirmationPage />
    </Suspense>
  );
}
