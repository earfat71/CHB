import { NextResponse } from 'next/server';
import { DEMO_HOTELS, calcPricing } from '../_mock/data';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const nights = Math.max(1, Math.round((new Date(searchParams.get('checkOut') || '').getTime() - new Date(searchParams.get('checkIn') || '').getTime()) / 86400000));
  const guests = Number(searchParams.get('guests') || 1);
  const minPrice = Number(searchParams.get('minPrice') || 0);
  const maxPrice = Number(searchParams.get('maxPrice') || Infinity);

  const results = DEMO_HOTELS.flatMap((hotel) =>
    hotel.rooms
      .filter((r) => r.isActive && r.maxGuests >= guests && r.basePriceBdt >= minPrice && r.basePriceBdt <= maxPrice)
      .map((room) => {
        const pricing = calcPricing(room.basePriceBdt, isNaN(nights) ? 1 : nights, false);
        return { ...room, hotel, pricePerNight: room.basePriceBdt, totalPrice: pricing.grandTotalBdt, nights: isNaN(nights) ? 1 : nights };
      })
  );

  return NextResponse.json({ results, nights: isNaN(nights) ? 1 : nights });
}
