import Link from 'next/link';
import { Hotel } from '@/lib/api';
import { starRatingLabel, formatBDT } from '@/lib/utils';

export function HotelCard({ hotel }: { hotel: Hotel }) {
  const stars = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 }[hotel.starRating] || 0;

  return (
    <Link href={`/hotels/${hotel.slug || hotel.id}`} className="group block bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100">
      <div className="h-48 bg-gradient-to-br from-brand-500 to-ocean-500 relative overflow-hidden">
        {hotel.photos?.[0] ? (
          <img src={hotel.photos[0]} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-6xl">🏨</div>
        )}
        <div className="absolute top-3 right-3 bg-white text-brand-700 text-xs font-bold px-2 py-1 rounded-full">
          {hotel.starRating?.replace('_', ' ')} ★
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-lg mb-1 group-hover:text-brand-600 transition">{hotel.name}</h3>
        <p className="text-gray-500 text-sm mb-2">📍 {hotel.address}</p>
        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={i < stars ? 'star-filled' : 'star-empty'}>★</span>
          ))}
          {hotel.avgRating && <span className="text-sm text-gray-600 ml-1">{hotel.avgRating.toFixed(1)}</span>}
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {hotel.amenities?.slice(0, 3).map((a) => (
            <span key={a} className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">{a}</span>
          ))}
          {(hotel.amenities?.length || 0) > 3 && (
            <span className="text-xs text-gray-500">+{hotel.amenities!.length - 3} more</span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500 text-sm">{hotel._count?.reviews || 0} reviews</span>
          <span className="text-brand-600 font-semibold text-sm">View Rooms →</span>
        </div>
      </div>
    </Link>
  );
}
