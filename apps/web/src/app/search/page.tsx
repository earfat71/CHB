'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchApi, SearchResult } from '@/lib/api';
import { SearchBar } from '@/components/SearchBar';
import { HotelCard } from '@/components/HotelCard';
import { formatBDT, formatDate } from '@/lib/utils';
import Link from 'next/link';

function SearchResults() {
  const sp = useSearchParams();
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('');

  const checkIn = sp.get('checkIn') || '';
  const checkOut = sp.get('checkOut') || '';
  const guests = sp.get('guests') || '2';

  useEffect(() => {
    if (!checkIn || !checkOut) return;
    setLoading(true);
    setError('');
    searchApi.search({ checkIn, checkOut, guests: Number(guests), sortBy: sortBy || undefined })
      .then(setResults)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [checkIn, checkOut, guests, sortBy]);

  return (
    <div>
      <div className="bg-white border-b py-4">
        <div className="max-w-6xl mx-auto px-4">
          <SearchBar compact />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Available Hotels</h1>
            {checkIn && checkOut && (
              <p className="text-gray-600 text-sm">
                {formatDate(checkIn)} → {formatDate(checkOut)} · {guests} guest{Number(guests) > 1 ? 's' : ''} · {results?.nights} night{results?.nights !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            <option value="">Sort: Relevance</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Best Rated</option>
          </select>
        </div>

        {loading && (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <div key={i} className="h-72 bg-gray-200 rounded-xl animate-pulse" />)}
          </div>
        )}

        {error && <div className="text-center py-12 text-red-600">{error}</div>}

        {!loading && results && results.results.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-xl font-semibold mb-2">No rooms available</h3>
            <p className="text-gray-600 mb-6">Try different dates or guest count.</p>
            <Link href="/" className="text-brand-600 hover:underline">← Back to Home</Link>
          </div>
        )}

        {!loading && results && results.results.length > 0 && (
          <>
            <p className="text-gray-600 mb-4">{results.results.length} room type{results.results.length > 1 ? 's' : ''} found</p>
            <div className="space-y-4">
              {results.results.map((room) => (
                <div key={room.id} className="bg-white border border-gray-200 rounded-xl p-5 flex gap-5 hover:shadow-md transition">
                  <div className="w-48 h-36 bg-gradient-to-br from-brand-500 to-ocean-500 rounded-lg flex-shrink-0 flex items-center justify-center text-4xl text-white">
                    {room.photos?.[0] ? <img src={room.photos[0]} alt={room.name} className="w-full h-full object-cover rounded-lg" /> : '🛏️'}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{room.hotel.name}</p>
                        <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{room.type.replace('_', ' ')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">per night</p>
                        <p className="text-2xl font-bold text-brand-700">{formatBDT(room.pricePerNight)}</p>
                        <p className="text-sm text-gray-600">{formatBDT(room.totalPrice)} total</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 my-3">
                      {room.amenities?.slice(0, 4).map((a) => (
                        <span key={a} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{a}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-sm text-gray-600">👥 Up to {room.maxGuests} guests · {room.availableUnits} unit{room.availableUnits > 1 ? 's' : ''} left</span>
                      <Link
                        href={`/hotels/${room.hotel.slug || room.hotel.id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&roomId=${room.id}`}
                        className="bg-brand-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-brand-700 transition"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
      <SearchResults />
    </Suspense>
  );
}
