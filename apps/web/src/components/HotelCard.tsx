import Link from 'next/link';
import { Hotel } from '@/lib/api';
import { formatBDT } from '@/lib/utils';

const STAR_MAP: Record<string, number> = {
  ONE_STAR: 1, TWO_STAR: 2, THREE_STAR: 3, FOUR_STAR: 4, FIVE_STAR: 5,
};

const STAR_LABEL: Record<string, string> = {
  ONE_STAR: '1★', TWO_STAR: '2★', THREE_STAR: '3★', FOUR_STAR: '4★', FIVE_STAR: '5★',
};

export function HotelCard({ hotel }: { hotel: Hotel }) {
  const starCount = STAR_MAP[hotel.starRating] ?? 0;
  const minPrice = hotel.rooms?.length
    ? Math.min(...hotel.rooms.filter((r) => r.isActive !== false).map((r) => r.basePriceBdt))
    : null;

  return (
    <Link href={`/hotels/${hotel.slug || hotel.id}`} className="group block bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden border border-gray-100">
      {/* Photo */}
      <div className="h-52 bg-gradient-to-br from-brand-700 to-brand-500 relative overflow-hidden">
        {hotel.photos?.[0] ? (
          <img
            src={hotel.photos[0]}
            alt={hotel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-6xl opacity-60">🏨</div>
        )}
        {/* Star badge */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-bold px-2.5 py-1 rounded-full shadow">
          {STAR_LABEL[hotel.starRating] ?? ''}
        </div>
        {/* Rating badge */}
        {hotel.avgRating ? (
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
            <span className="text-amber-400">★</span>
            {hotel.avgRating.toFixed(1)}
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-base mb-0.5 group-hover:text-brand-700 transition-colors line-clamp-1">{hotel.name}</h3>
        <p className="text-gray-500 text-xs mb-3 flex items-center gap-1">
          <span>📍</span> {hotel.address}
        </p>

        {/* Stars */}
        <div className="flex items-center gap-0.5 mb-3">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={`text-sm ${i < starCount ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
          ))}
          {hotel._count?.reviews ? (
            <span className="text-xs text-gray-400 ml-1.5">({hotel._count.reviews})</span>
          ) : null}
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1 mb-3">
          {hotel.amenities?.slice(0, 3).map((a) => (
            <span key={a} className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">{a}</span>
          ))}
          {(hotel.amenities?.length ?? 0) > 3 && (
            <span className="text-xs text-gray-400 px-1">+{hotel.amenities!.length - 3} more</span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          {minPrice != null ? (
            <div>
              <span className="text-xs text-gray-400">From </span>
              <span className="font-bold text-brand-700">{formatBDT(minPrice)}</span>
              <span className="text-xs text-gray-400">/night</span>
            </div>
          ) : (
            <span className="text-sm text-gray-400">Check availability</span>
          )}
          <span className="text-xs bg-brand-600 text-white px-3 py-1.5 rounded-lg font-medium group-hover:bg-brand-700 transition-colors">
            View Rooms
          </span>
        </div>
      </div>
    </Link>
  );
}
