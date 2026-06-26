'use client';

import { useState } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { HotelCard } from '@/components/HotelCard';
import { hotelApi, Hotel } from '@/lib/api';
import { useEffect } from 'react';

export default function HomePage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hotelApi.list().then(setHotels).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-700 via-brand-600 to-ocean-500 text-white">
        <div className="absolute inset-0 bg-[url('/beach-bg.jpg')] bg-cover bg-center opacity-20" />
        <div className="relative max-w-6xl mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-balance">
            Cox&apos;s Bazar
            <span className="block text-sand-100 mt-2">Hotel Booking</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Find the perfect hotel on the world&apos;s longest sea beach.
            Transparent prices. Instant confirmation.
          </p>
          <div className="max-w-4xl mx-auto">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🏖️', title: 'Best Locations', desc: "Curated hotels along Cox's Bazar beach" },
              { icon: '💰', title: 'Transparent Pricing', desc: 'See exactly what you pay — VAT, fees, all included' },
              { icon: '🔒', title: 'Secure Booking', desc: 'bKash, Nagad, Rocket & card payments accepted' },
            ].map((f) => (
              <div key={f.title} className="text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Hotels */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Hotels</h2>
          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : hotels.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No hotels available yet.</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {hotels.slice(0, 6).map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Agent CTA */}
      <section className="py-16 bg-brand-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Are You a Travel Agent?</h2>
          <p className="text-blue-100 text-lg mb-8">
            Join the CoxBeach agent network. Get your unique QR code, earn commission on every booking, and track your earnings in real time.
          </p>
          <a href="/agent/register" className="inline-block bg-white text-brand-700 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition">
            Register as Agent
          </a>
        </div>
      </section>
    </div>
  );
}
