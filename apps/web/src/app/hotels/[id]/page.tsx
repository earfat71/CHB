'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { hotelApi, pricingApi, bookingApi, reviewApi, Hotel, Pricing } from '@/lib/api';
import { PriceBreakdown } from '@/components/PriceBreakdown';
import { formatBDT, formatDate, nightsCount, starRatingLabel } from '@/lib/utils';
import { useAuth } from '@/components/AuthProvider';
import { toast } from '@/components/ui/toaster';

const STAR_MAP: Record<string, number> = {
  ONE_STAR: 1, TWO_STAR: 2, THREE_STAR: 3, FOUR_STAR: 4, FIVE_STAR: 5,
};

function HotelDetail() {
  const { id } = useParams<{ id: string }>();
  const sp = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [booking, setBooking] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  // Date/guest state — initialize from URL params
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(tomorrow); dayAfter.setDate(dayAfter.getDate() + 2);
  const fmt = (d: Date) => d.toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(sp.get('checkIn') || fmt(tomorrow));
  const [checkOut, setCheckOut] = useState(sp.get('checkOut') || fmt(dayAfter));
  const [guests, setGuests] = useState(sp.get('guests') || '2');
  const [selectedRoomId, setSelectedRoomId] = useState(sp.get('roomId') || '');

  const nights = checkIn && checkOut ? nightsCount(checkIn, checkOut) : 0;
  const agentSession = typeof window !== 'undefined' ? sessionStorage.getItem('agentSession') : null;

  useEffect(() => {
    hotelApi.get(id).then(setHotel).catch(() => toast('Hotel not found', 'error')).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const room = hotel?.rooms?.find((r) => r.id === selectedRoomId);
    if (room && nights > 0) {
      pricingApi.quote(room.basePriceBdt, nights, !!agentSession)
        .then(setPricing).catch(console.error);
    } else {
      setPricing(null);
    }
  }, [hotel, selectedRoomId, nights, agentSession]);

  const selectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    const url = new URL(window.location.href);
    url.searchParams.set('roomId', roomId);
    url.searchParams.set('checkIn', checkIn);
    url.searchParams.set('checkOut', checkOut);
    url.searchParams.set('guests', guests);
    router.replace(url.pathname + url.search, { scroll: false });
  };

  const handleBook = async () => {
    if (!user) {
      router.push('/auth/login?redirect=' + encodeURIComponent(window.location.href));
      return;
    }
    if (!selectedRoomId) { toast('Please select a room', 'error'); return; }
    if (!checkIn || !checkOut) { toast('Please select dates', 'error'); return; }
    if (nights < 1) { toast('Check-out must be after check-in', 'error'); return; }

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

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Loading hotel…</p>
      </div>
    </div>
  );

  if (!hotel) return (
    <div className="text-center py-20">
      <p className="text-5xl mb-4">😕</p>
      <h2 className="text-xl font-semibold mb-2">Hotel not found</h2>
      <a href="/search" className="text-brand-600 hover:underline">← Back to search</a>
    </div>
  );

  const starCount = STAR_MAP[hotel.starRating] ?? 0;
  const photos = hotel.photos?.length ? hotel.photos : [];
  const activeRooms = hotel.rooms?.filter((r) => r.isActive !== false) ?? [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4 flex items-center gap-1.5">
        <a href="/" className="hover:text-brand-600">Home</a>
        <span>/</span>
        <a href="/search" className="hover:text-brand-600">Hotels</a>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate max-w-[200px]">{hotel.name}</span>
      </nav>

      {/* Hotel Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold font-display text-gray-900 mb-1">{hotel.name}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
              <span className="flex items-center gap-1">📍 {hotel.address}</span>
              <span className="flex items-center gap-1">{starRatingLabel(hotel.starRating)}</span>
              <span className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={`text-sm ${i < starCount ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                ))}
                {hotel.avgRating ? <span className="ml-1 font-medium text-gray-700">{hotel.avgRating.toFixed(1)}</span> : null}
              </span>
              <span>🕐 Check-in {hotel.checkInTime} | Out {hotel.checkOutTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Gallery */}
      {photos.length > 0 ? (
        <div className="mb-8">
          <div className="h-72 md:h-96 rounded-2xl overflow-hidden">
            <img src={photos[activePhoto]} alt={hotel.name} className="w-full h-full object-cover" />
          </div>
          {photos.length > 1 && (
            <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
              {photos.map((p, i) => (
                <button key={i} onClick={() => setActivePhoto(i)} className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition ${i === activePhoto ? 'border-brand-600' : 'border-transparent'}`}>
                  <img src={p} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="h-64 bg-gradient-to-br from-brand-700 to-brand-500 rounded-2xl flex items-center justify-center text-white text-8xl mb-8 opacity-80">
          🏨
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Description + Rooms + Reviews */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <section>
            <h2 className="text-xl font-semibold font-display mb-3">About This Hotel</h2>
            <p className="text-gray-600 leading-relaxed">{hotel.description}</p>
          </section>

          {/* Amenities */}
          {hotel.amenities?.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold font-display mb-3">Hotel Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {hotel.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-2 text-sm text-gray-700 bg-brand-50 rounded-lg px-3 py-2">
                    <span className="text-brand-600">✓</span> {a}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Rooms */}
          <section>
            <h2 className="text-xl font-semibold font-display mb-4">
              Room Types
              {activeRooms.length > 0 && <span className="text-gray-400 font-normal text-sm ml-2">({activeRooms.length} available)</span>}
            </h2>
            {activeRooms.length === 0 ? (
              <p className="text-gray-500 text-sm">No rooms currently available.</p>
            ) : (
              <div className="space-y-3">
                {activeRooms.map((room) => {
                  const isSelected = selectedRoomId === room.id;
                  const hasDiscount = room.discountType && room.discountType !== 'NONE' && room.discountValue;
                  const displayPrice = hasDiscount
                    ? room.discountType === 'PERCENTAGE'
                      ? Math.round(room.basePriceBdt * (1 - (room.discountValue ?? 0) / 100))
                      : room.basePriceBdt - (room.discountValue ?? 0)
                    : room.basePriceBdt;

                  return (
                    <div
                      key={room.id}
                      onClick={() => selectRoom(room.id)}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50 shadow-md'
                          : 'border-gray-200 hover:border-brand-300 hover:shadow-sm bg-white'
                      }`}
                    >
                      <div className="flex gap-4">
                        {room.photos?.[0] ? (
                          <img src={room.photos[0]} alt={room.name} className="w-24 h-20 object-cover rounded-lg shrink-0" />
                        ) : (
                          <div className="w-24 h-20 bg-gradient-to-br from-brand-100 to-brand-200 rounded-lg flex items-center justify-center text-2xl shrink-0">🛏️</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">{room.name}</h3>
                              <p className="text-sm text-gray-500 capitalize">{room.type.replace('_', ' ')} · Up to {room.maxGuests} guests</p>
                            </div>
                            <div className="text-right shrink-0">
                              {hasDiscount && (
                                <p className="text-xs text-gray-400 line-through">{formatBDT(room.basePriceBdt)}</p>
                              )}
                              <p className="text-xl font-bold text-brand-700">{formatBDT(displayPrice)}</p>
                              <p className="text-xs text-gray-400">per night</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {room.amenities?.slice(0, 4).map((a) => (
                              <span key={a} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{a}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="mt-2 pt-2 border-t border-brand-200 flex items-center gap-1.5 text-xs text-brand-700 font-medium">
                          <span>✓</span> Selected
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Reviews */}
          {(hotel.reviews?.length ?? 0) > 0 && (
            <section>
              <h2 className="text-xl font-semibold font-display mb-4">
                Guest Reviews
                <span className="text-gray-400 font-normal text-sm ml-2">({hotel.reviews!.length})</span>
              </h2>
              <div className="space-y-4">
                {hotel.reviews!.map((review) => (
                  <div key={review.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-gray-900">{review.user?.name}</span>
                          <div className="flex">
                            {Array.from({ length: 5 }, (_, i) => (
                              <span key={i} className={`text-xs ${i < review.rating ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                            ))}
                          </div>
                        </div>
                        {review.title && <p className="font-medium text-sm mt-1">{review.title}</p>}
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">{formatDate(review.createdAt)}</span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{review.body}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Cancellation policy */}
          <section className="bg-sand-50 border border-sand-200 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Cancellation Policy</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start gap-2"><span className="text-green-600 font-bold shrink-0">✓</span><span><strong>Full refund</strong> if cancelled more than 48 hours before check-in</span></div>
              <div className="flex items-start gap-2"><span className="text-amber-500 font-bold shrink-0">½</span><span><strong>50% refund</strong> if cancelled 24–48 hours before check-in</span></div>
              <div className="flex items-start gap-2"><span className="text-red-500 font-bold shrink-0">✗</span><span><strong>No refund</strong> if cancelled less than 24 hours before check-in</span></div>
            </div>
          </section>
        </div>

        {/* Booking Sidebar */}
        <div>
          <div className="bg-white border rounded-2xl p-5 sticky top-20 shadow-sm">
            <h3 className="font-semibold text-lg font-display mb-4">Plan Your Stay</h3>

            {/* Date picker */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Check-in</label>
                <input
                  type="date"
                  value={checkIn}
                  min={fmt(new Date())}
                  onChange={(e) => { setCheckIn(e.target.value); setSelectedRoomId(''); setPricing(null); }}
                  className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Check-out</label>
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn || fmt(new Date())}
                  onChange={(e) => { setCheckOut(e.target.value); setSelectedRoomId(''); setPricing(null); }}
                  className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 mb-1">Guests</label>
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            {nights > 0 && (
              <div className="bg-brand-50 rounded-lg px-3 py-2 text-xs text-brand-700 mb-4 text-center font-medium">
                {nights} night{nights > 1 ? 's' : ''} · {formatDate(checkIn)} – {formatDate(checkOut)}
              </div>
            )}

            {pricing && <PriceBreakdown pricing={pricing} className="mb-4 !bg-white border" />}

            {agentSession && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700 mb-4 flex items-center gap-1.5">
                <span>✓</span> Agent referral applied
              </div>
            )}

            {!selectedRoomId && nights > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700 mb-4 flex items-center gap-1.5">
                <span>👆</span> Select a room type above to continue
              </div>
            )}

            <button
              onClick={handleBook}
              disabled={!selectedRoomId || nights < 1 || booking}
              className="w-full bg-marigold-500 hover:bg-marigold-600 disabled:bg-gray-200 text-gray-900 disabled:text-gray-400 py-3 rounded-xl font-bold transition disabled:cursor-not-allowed text-sm"
            >
              {booking
                ? 'Reserving…'
                : selectedRoomId && pricing
                  ? `Reserve for ${formatBDT(pricing.grandTotalBdt)}`
                  : 'Select Room & Dates'}
            </button>

            <p className="text-xs text-gray-400 text-center mt-2">No charge until payment · Free cancellation</p>

            {/* Trust badges */}
            <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-2">
              {[
                { icon: '🔒', text: 'Secure Booking' },
                { icon: '✓', text: 'Instant Confirm' },
                { icon: '💳', text: 'bKash / Nagad' },
                { icon: '↩', text: 'Free Cancel' },
              ].map((b) => (
                <div key={b.text} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span>{b.icon}</span> {b.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HotelPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">Loading…</div>}>
      <HotelDetail />
    </Suspense>
  );
}
