import { NextResponse } from 'next/server';
import { DEMO_HOTELS, DEMO_BOOKINGS, calcPricing } from '../_mock/data';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const nights = Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000));
  const guests = Number(searchParams.get('guests') || 1);
  const minPrice = Number(searchParams.get('minPrice') || 0);
  const maxPrice = Number(searchParams.get('maxPrice') || Infinity);
  const sortBy = searchParams.get('sortBy') || '';

  const bookingCounts = DEMO_BOOKINGS.reduce<Record<string, number>>((acc, b) => {
    acc[b.hotelId] = (acc[b.hotelId] ?? 0) + 1;
    return acc;
  }, {});

  let results = DEMO_HOTELS.filter((h) => h.status === 'APPROVED').flatMap((hotel) =>
    hotel.rooms
      .filter((r) => r.isActive && r.maxGuests >= guests && r.basePriceBdt >= minPrice && r.basePriceBdt <= maxPrice)
      .map((room) => {
        const pricing = calcPricing(room.basePriceBdt, isNaN(nights) ? 1 : nights, false);
        return {
          ...room,
          hotel,
          pricePerNight: room.basePriceBdt,
          totalPrice: pricing.grandTotalBdt,
          nights: isNaN(nights) ? 1 : nights,
          availableUnits: room.totalUnits,
        };
      })
  );

  if (sortBy === 'price_asc') results.sort((a, b) => a.pricePerNight - b.pricePerNight);
  else if (sortBy === 'price_desc') results.sort((a, b) => b.pricePerNight - a.pricePerNight);
  else if (sortBy === 'rating') results.sort((a, b) => (b.hotel.avgRating ?? 0) - (a.hotel.avgRating ?? 0));
  else if (sortBy === 'popularity') results.sort((a, b) => (bookingCounts[b.hotel.id] ?? 0) - (bookingCounts[a.hotel.id] ?? 0));

  return NextResponse.json({ results, nights: isNaN(nights) ? 1 : nights });
}
