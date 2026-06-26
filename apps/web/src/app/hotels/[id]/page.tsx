'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { hotelApi, bookingApi, pricingApi, Hotel, Pricing } from '@/lib/api';
import { PriceBreakdown } from '@/components/PriceBreakdown';
import { formatBDT, formatDate, nightsCount } from '@/lib/utils';
import { useAuth } from '@/components/AuthProvider';
import { toast } from '@/components/ui/toaster';

function HotelDetail() {
  const { id } = useParams<{ id: string }>();
  const sp = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [booking, setBooking] = useState(false);

  const checkIn = sp.get('checkIn') || '';
  const checkOut = sp.get('checkOut') || '';
  const guests = sp.get('guests') || '2';
  const selectedRoomId = sp.get('roomId') || '';

  const nights = checkIn && checkOut ? nightsCount(checkIn, checkOut) : 0;
  const agentSession = typeof window !== 'undefined' ? sessionStorage.getItem('agentSession') : null;

  useEffect(() => {
    hotelApi.get(id).then(setHotel).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const room = hotel?.rooms?.find((r) => r.id === selectedRoomId);
    if (room && nights > 0) {
      pricingApi.quote(room.basePriceBdt, nights, !!agentSession)
        .then(setPricing).catch(console.error);
    }
  }, [hotel, selectedRoomId, nights, agentSession]);

  const handleBook = async () => {
    if (!user) { router.push('/auth/login?redirect=' + encodeURIComponent(window.location.href)); return; }
    if (!selectedRoomId || !checkIn || !checkOut) { toast('Please select dates and room', 'error'); return; }

    setBooking(true);
    try {
      const result = await bookingApi.hold({
        roomId: selectedRoomId,
        checkIn,
        checkOut,
        guestCount: Number(guests),
        attributionSessionId: agentSession || undefined,
      });
      router.push(`/booking/checkout?bookingId=${result.booking.id}`);
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Booking failed', 'error');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading hotel...</div>;
  if (!hotel) return <div className="text-center py-16 text-red-600">Hotel not found</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hotel Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
        <div className="flex items-center gap-4 text-gray-600">
          <span>📍 {hotel.address}</span>
          <span>⭐ {hotel.starRating?.replace('_', '')}</span>
          {hotel.avgRating && <span>🏅 {hotel.avgRating.toFixed(1)} / 5</span>}
          <span>🕐 Check-in: {hotel.checkInTime} | Check-out: {hotel.checkOutTime}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Photos */}
          <div className="h-64 bg-gradient-to-br from-brand-500 to-ocean-500 rounded-xl overflow-hidden flex items-center justify-center text-white text-8xl">
            {hotel.photos?.[0] ? <img src={hotel.photos[0]} alt={hotel.name} className="w-full h-full object-cover" /> : '🏨'}
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold mb-3">About This Hotel</h2>
            <p className="text-gray-600 leading-relaxed">{hotel.description}</p>
          </div>

          {/* Amenities */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {hotel.amenities?.map((a) => (
                <span key={a} className="bg-brand-50 text-brand-700 text-sm px-3 py-1 rounded-full">{a}</span>
              ))}
            </div>
          </div>

          {/* Rooms */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Available Rooms</h2>
            {checkIn && checkOut ? (
              <div className="space-y-3">
                {hotel.rooms?.filter((r) => r.isActive !== false).map((room) => (
                  <div
                    key={room.id}
                    onClick={() => {
                      const url = new URL(window.location.href);
                      url.searchParams.set('roomId', room.id);
                      router.replace(url.pathname + url.search);
                    }}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition ${selectedRoomId === room.id ? 'border-brand-600 bg-brand-50' : 'border-gray-200 hover:border-brand-300'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{room.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{room.type.replace('_', ' ')} · Up to {room.maxGuests} guests</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {room.amenities?.slice(0, 3).map((a) => (
                            <span key={a} className="text-xs bg-gray-100 px-2 py-0.5 rounded">{a}</span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-brand-700">{formatBDT(room.basePriceBdt)}</p>
                        <p className="text-xs text-gray-500">per night</p>
                        {selectedRoomId === room.id && <span className="text-xs text-brand-600 font-medium">✓ Selected</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-sm">
                Please select check-in and check-out dates to see room availability and prices.
              </div>
            )}
          </div>

          {/* Reviews */}
          {hotel.reviews && hotel.reviews.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Guest Reviews</h2>
              <div className="space-y-4">
                {hotel.reviews.map((review) => (
                  <div key={review.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{review.user?.name}</span>
                        <div className="flex">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span key={i} className={i < review.rating ? 'star-filled text-xs' : 'star-empty text-xs'}>★</span>
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                    </div>
                    {review.title && <p className="font-medium text-sm mb-1">{review.title}</p>}
                    <p className="text-gray-600 text-sm">{review.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Booking Sidebar */}
        <div className="space-y-4">
          <div className="bg-white border rounded-xl p-5 sticky top-20 shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Your Stay</h3>
            {checkIn && checkOut ? (
              <div className="space-y-3 text-sm mb-4">
                <div className="flex justify-between"><span className="text-gray-600">Check-in</span><span className="font-medium">{formatDate(checkIn)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Check-out</span><span className="font-medium">{formatDate(checkOut)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Nights</span><span className="font-medium">{nights}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Guests</span><span className="font-medium">{guests}</span></div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-4">Select dates to see pricing</p>
            )}

            {pricing && <PriceBreakdown pricing={pricing} className="mb-4" />}

            {agentSession && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-700 mb-4">
                ✓ Agent discount applied
              </div>
            )}

            <button
              onClick={handleBook}
              disabled={!selectedRoomId || !checkIn || !checkOut || booking}
              className="w-full bg-brand-600 text-white py-3 rounded-lg font-semibold hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {booking ? 'Processing...' : selectedRoomId ? `Book ${formatBDT(pricing?.grandTotalBdt || 0)}` : 'Select a Room'}
            </button>

            <p className="text-xs text-gray-500 text-center mt-2">You won&apos;t be charged until payment</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HotelPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
      <HotelDetail />
    </Suspense>
  );
}
