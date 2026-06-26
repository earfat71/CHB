'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function SearchBar({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 2);

  const [checkIn, setCheckIn] = useState(tomorrow.toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState(dayAfter.toISOString().split('T')[0]);
  const [guests, setGuests] = useState(2);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const qs = new URLSearchParams({ checkIn, checkOut, guests: String(guests) });
    router.push(`/search?${qs}`);
  };

  const cls = compact
    ? 'bg-white rounded-lg shadow p-3 flex gap-3 flex-wrap items-end'
    : 'bg-white rounded-2xl shadow-xl p-6 flex gap-4 flex-wrap items-end';

  return (
    <form onSubmit={handleSearch} className={cls}>
      <div className="flex-1 min-w-36">
        <label className="block text-xs font-medium text-gray-700 mb-1">Check-in</label>
        <input
          type="date"
          value={checkIn}
          min={new Date().toISOString().split('T')[0]}
          onChange={(e) => setCheckIn(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
          required
        />
      </div>
      <div className="flex-1 min-w-36">
        <label className="block text-xs font-medium text-gray-700 mb-1">Check-out</label>
        <input
          type="date"
          value={checkOut}
          min={checkIn}
          onChange={(e) => setCheckOut(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
          required
        />
      </div>
      <div className="w-24">
        <label className="block text-xs font-medium text-gray-700 mb-1">Guests</label>
        <input
          type="number"
          value={guests}
          min={1}
          max={20}
          onChange={(e) => setGuests(Number(e.target.value))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>
      <button
        type="submit"
        className="bg-brand-600 text-white px-8 py-2 rounded-lg font-semibold hover:bg-brand-700 transition whitespace-nowrap"
      >
        Search Hotels
      </button>
    </form>
  );
}
