'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { bookingApi, reviewApi, Booking } from '@/lib/api';
import { formatDate, formatBDT, bookingStatusColor } from '@/lib/utils';
import { useAuth } from '@/components/AuthProvider';
import { toast } from '@/components/ui/toaster';

export default function MyBookingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' });

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    bookingApi.my().then(setBookings).catch(console.error).finally(() => setLoading(false));
  }, [user]);

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingApi.cancel(bookingId, 'Customer cancelled');
      setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b));
      toast('Booking cancelled', 'success');
    } catch (e: unknown) { toast(e instanceof Error ? e.message : 'Cancel failed', 'error'); }
  };

  const handleReview = async (bookingId: string) => {
    try {
      await reviewApi.create({ bookingId, ...reviewForm });
      toast('Review submitted for moderation!', 'success');
      setReviewModal(null);
    } catch (e: unknown) { toast(e instanceof Error ? e.message : 'Review failed', 'error'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🏨</div>
          <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
          <Link href="/" className="text-brand-600 hover:underline">Search for hotels →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white border rounded-xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-mono text-sm text-gray-500">{booking.bookingRef}</p>
                  <h3 className="font-semibold text-lg">{booking.hotel?.name}</h3>
                  <p className="text-gray-600 text-sm">
                    {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)} · {booking.nights} night{booking.nights > 1 ? 's' : ''}
                  </p>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${bookingStatusColor(booking.status)}`}>
                  {booking.status.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-center justify-between border-t pt-3">
                <div className="text-sm">
                  <span className="text-gray-600">Total: </span>
                  <span className="font-bold text-brand-700">{formatBDT(booking.grandTotalBdt)}</span>
                  {booking.agentCommBdt > 0 && <span className="text-xs text-green-600 ml-2">Agent booking</span>}
                </div>
                <div className="flex gap-2">
                  {booking.status === 'PENDING_PAYMENT' && (
                    <Link href={`/booking/checkout?bookingId=${booking.id}`} className="text-xs bg-brand-600 text-white px-3 py-1.5 rounded-lg hover:bg-brand-700 transition">
                      Complete Payment
                    </Link>
                  )}
                  {(booking.status === 'CONFIRMED' || booking.status === 'CHECKED_OUT') && !booking.review && (
                    <button onClick={() => setReviewModal(booking.id)} className="text-xs border border-brand-600 text-brand-600 px-3 py-1.5 rounded-lg hover:bg-brand-50 transition">
                      Leave Review
                    </button>
                  )}
                  {['PENDING_PAYMENT', 'CONFIRMED'].includes(booking.status) && (
                    <button onClick={() => handleCancel(booking.id)} className="text-xs border border-red-300 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="font-bold text-lg mb-4">Leave a Review</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button key={r} onClick={() => setReviewForm((f) => ({ ...f, rating: r }))} className={`text-2xl ${r <= reviewForm.rating ? 'star-filled' : 'star-empty'}`}>★</button>
                ))}
              </div>
            </div>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
              placeholder="Review title (optional)"
              value={reviewForm.title}
              onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))}
            />
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm mb-4 h-24"
              placeholder="Share your experience..."
              value={reviewForm.body}
              onChange={(e) => setReviewForm((f) => ({ ...f, body: e.target.value }))}
            />
            <div className="flex gap-2">
              <button onClick={() => handleReview(reviewModal)} className="flex-1 bg-brand-600 text-white py-2 rounded-lg text-sm font-semibold">Submit</button>
              <button onClick={() => setReviewModal(null)} className="flex-1 border py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
