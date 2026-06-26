'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchApi, SearchResult } from '@/lib/api';
import { SearchBar } from '@/components/SearchBar';
import { formatBDT, formatDate } from '@/lib/utils';
import Link from 'next/link';

const STAR_OPTIONS = [
  { value: '', label: 'All categories' },
  { value: 'FIVE_STAR', label: '5 Star' },
  { value: 'FOUR_STAR', label: '4 Star' },
  { value: 'THREE_STAR', label: '3 Star' },
  { value: 'TWO_STAR', label: '2 Star' },
];

const AMENITY_OPTIONS = ['WiFi', 'Swimming Pool', 'Beach Access', 'Restaurant', 'Gym', 'Spa', 'Parking', 'Air Conditioning'];

function SearchResults() {
  const sp = useSearchParams();
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [starFilter, setStarFilter] = useState('');
  const [amenityFilters, setAmenityFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const checkIn = sp.get('checkIn') || '';
  const checkOut = sp.get('checkOut') || '';
  const guests = sp.get('guests') || '2';

  useEffect(() => {
    if (!checkIn || !checkOut) return;
    setLoading(true);
    setError('');
    searchApi.search({
      checkIn, checkOut, guests: Number(guests),
      sortBy: sortBy || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    })
      .then(setResults)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [checkIn, checkOut, guests, sortBy, minPrice, maxPrice]);

  const filteredResults = results?.results.filter((room) => {
    if (starFilter && room.hotel.starRating !== starFilter) return false;
    if (amenityFilters.length > 0) {
      const hotelAmenities = [...(room.hotel.amenities ?? []), ...(room.amenities ?? [])].map((a) => a.toLowerCase());
      if (!amenityFilters.every((f) => hotelAmenities.some((a) => a.includes(f.toLowerCase())))) return false;
    }
    return true;
  }) ?? [];

  const toggleAmenity = (a: string) => {
    setAmenityFilters((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
  };

  const hasActiveFilters = sortBy || minPrice || maxPrice || starFilter || amenityFilters.length > 0;

  return (
    <div>
      <div className="bg-white border-b py-4">
        <div className="max-w-6xl mx-auto px-4">
          <SearchBar compact />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header + Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold font-display">Available Hotels</h1>
            {checkIn && checkOut && (
              <p className="text-gray-600 text-sm mt-0.5">
                {formatDate(checkIn)} → {formatDate(checkOut)} · {guests} guest{Number(guests) > 1 ? 's' : ''} · {results?.nights ?? '—'} night{results?.nights !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border font-medium transition ${showFilters || hasActiveFilters ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 010 2H4a1 1 0 01-1-1zM6 10a1 1 0 011-1h10a1 1 0 010 2H7a1 1 0 01-1-1zM10 16a1 1 0 011-1h2a1 1 0 010 2h-2a1 1 0 01-1-1z" /></svg>
              Filters {hasActiveFilters && `(active)`}
            </button>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="">Sort: Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Best Rated</option>
              <option value="popularity">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white border rounded-xl p-4 mb-6 space-y-4">
            <div className="flex flex-wrap gap-6">
              {/* Price Range */}
              <div className="min-w-[200px]">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Price per night (৳)</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="border rounded-lg px-3 py-1.5 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="text-gray-400">–</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="border rounded-lg px-3 py-1.5 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Hotel Category */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Hotel category</p>
                <select
                  value={starFilter}
                  onChange={(e) => setStarFilter(e.target.value)}
                  className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {STAR_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {/* Amenities */}
              <div className="flex-1 min-w-[260px]">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {AMENITY_OPTIONS.map((a) => (
                    <button
                      key={a}
                      onClick={() => toggleAmenity(a)}
                      className={`text-xs px-3 py-1.5 rounded-full border font-medium transition ${amenityFilters.includes(a) ? 'bg-brand-600 text-white border-brand-600' : 'text-gray-600 border-gray-300 hover:border-brand-400 hover:text-brand-600'}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={() => { setSortBy(''); setMinPrice(''); setMaxPrice(''); setStarFilter(''); setAmenityFilters([]); }}
                className="text-xs text-red-600 hover:underline font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {loading && (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <div key={i} className="h-72 bg-gray-200 rounded-xl animate-pulse" />)}
          </div>
        )}

        {error && <div className="text-center py-12 text-red-600">{error}</div>}

        {!loading && results && filteredResults.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-xl font-semibold mb-2">No rooms available</h3>
            <p className="text-gray-600 mb-6">
              {results.results.length > 0 ? 'Try relaxing your filters.' : 'Try different dates or guest count.'}
            </p>
            {results.results.length > 0 && (
              <button onClick={() => { setStarFilter(''); setAmenityFilters([]); setMinPrice(''); setMaxPrice(''); }} className="text-brand-600 hover:underline mr-4">
                Clear filters
              </button>
            )}
            <Link href="/" className="text-brand-600 hover:underline">← Back to Home</Link>
          </div>
        )}

        {!loading && filteredResults.length > 0 && (
          <>
            <p className="text-gray-500 text-sm mb-4">{filteredResults.length} room type{filteredResults.length !== 1 ? 's' : ''} found</p>
            <div className="space-y-4">
              {filteredResults.map((room) => (
                <div key={room.id} className="bg-white border border-gray-200 rounded-xl p-5 flex gap-5 hover:shadow-md transition">
                  <div className="w-48 h-36 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex-shrink-0 flex items-center justify-center text-4xl text-white overflow-hidden">
                    {room.photos?.[0]
                      ? <img src={room.photos[0]} alt={room.name} className="w-full h-full object-cover" />
                      : '🛏️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs text-gray-500">{room.hotel.name}</p>
                          {room.hotel.avgRating ? (
                            <span className="text-xs bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded font-medium">
                              ★ {room.hotel.avgRating}
                            </span>
                          ) : null}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{room.type.replace('_', ' ')}</p>
                        {room.hotel.address && <p className="text-xs text-gray-400 mt-0.5">{room.hotel.address}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-gray-500">per night</p>
                        <p className="text-2xl font-bold text-brand-700">{formatBDT(room.pricePerNight)}</p>
                        <p className="text-sm text-gray-500">{formatBDT(room.totalPrice)} total</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 my-3">
                      {room.amenities?.slice(0, 5).map((a) => (
                        <span key={a} className={`text-xs px-2 py-0.5 rounded-full ${amenityFilters.includes(a) ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-600'}`}>{a}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">👥 Up to {room.maxGuests} guests · {(room as unknown as { availableUnits?: number }).availableUnits ?? room.totalUnits} unit{((room as unknown as { availableUnits?: number }).availableUnits ?? room.totalUnits) !== 1 ? 's' : ''} left</span>
                      <Link
                        href={`/hotels/${room.hotel.slug || room.hotel.id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&roomId=${room.id}`}
                        className="bg-marigold-500 hover:bg-marigold-600 text-gray-900 px-6 py-2 rounded-lg text-sm font-semibold transition"
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
