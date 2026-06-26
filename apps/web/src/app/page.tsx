'use client';

import { useState, useEffect } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { HotelCard } from '@/components/HotelCard';
import { hotelApi, Hotel } from '@/lib/api';
import Link from 'next/link';

const TRUST_SIGNALS = [
  { icon: '🏖️', title: 'Destination Expert', desc: "We cover Cox's Bazar exclusively — every hotel is verified before listing." },
  { icon: '৳', title: 'Zero Hidden Fees', desc: 'See VAT, platform fee, and agent commission itemised before you pay.' },
  { icon: '📲', title: 'Bangladeshi Payments', desc: 'Pay with bKash, Nagad, Rocket, or card — no foreign accounts needed.' },
  { icon: '⚡', title: 'Instant Confirmation', desc: 'Your booking is confirmed the moment payment clears. No waiting.' },
  { icon: '🤝', title: 'Agent Network', desc: 'Local travel agents with QR codes earn commissions transparently.' },
  { icon: '🔒', title: 'Secure Platform', desc: 'Your data is encrypted and your payments go through licensed gateways.' },
];

const BEACH_DISTANCES = [
  { zone: 'Kolatoli Beach Road', desc: '0–200 m from the sea' },
  { zone: 'Sugandha Point', desc: '200–500 m from the sea' },
  { zone: 'Marine Drive', desc: 'Seafront — direct beach access' },
];

export default function HomePage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hotelApi.list().then(setHotels).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/beach-bg.jpg')] bg-cover bg-center opacity-15" />
        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white" style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
        <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-28 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6 border border-white/20">
            <span>🌊</span>
            <span>World&apos;s longest natural sea beach — 120 km of coastline</span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 text-balance leading-tight">
            Book Your Stay at
            <span className="block text-marigold-300 mt-1">Cox&apos;s Bazar</span>
          </h1>
          <p className="text-lg md:text-xl text-brand-100 mb-10 max-w-2xl mx-auto">
            Transparent prices. Real availability. Confirmed in under 3 minutes.
            <br />
            <span className="font-bengali text-brand-200">কক্সবাজারের সেরা হোটেল বুকিং প্ল্যাটফর্ম।</span>
          </p>
          <div className="max-w-4xl mx-auto">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center text-gray-900 mb-2">Why CoxBeach?</h2>
          <p className="text-center text-gray-500 mb-10">Built specifically for Cox&apos;s Bazar — not just another listing site.</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {TRUST_SIGNALS.map((f) => (
              <div key={f.title} className="p-5 bg-sand-50 rounded-xl border border-sand-100">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-800 mb-1">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beach proximity section */}
      <section className="py-14 bg-brand-900 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="font-display text-3xl font-bold mb-4">Filter by Distance to Beach</h2>
              <p className="text-brand-200 mb-6">
                Not all hotels are equal. Some are right on the shore; others are a short walk away. Every listing on CoxBeach shows its distance to the waterline so you know exactly what you&apos;re getting.
              </p>
              <div className="space-y-3">
                {BEACH_DISTANCES.map((z) => (
                  <div key={z.zone} className="flex items-center gap-3 bg-white/10 rounded-xl p-4">
                    <span className="text-2xl">🏝️</span>
                    <div>
                      <p className="font-semibold">{z.zone}</p>
                      <p className="text-brand-300 text-sm">{z.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <h3 className="font-display text-xl font-bold mb-2">120 km of Coastline</h3>
              <p className="text-brand-200 text-sm mb-6">From Inani Beach to Cox&apos;s Bazar town — find hotels anywhere along the shore.</p>
              <Link href="/search" className="inline-block bg-marigold-400 text-gray-900 font-bold px-6 py-3 rounded-lg hover:bg-marigold-300 transition">
                Search by Location →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Hotels */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-3xl font-bold text-gray-900">Featured Hotels</h2>
              <p className="text-gray-500 mt-1">Verified properties along Cox&apos;s Bazar beach</p>
            </div>
            <Link href="/search" className="text-brand-600 hover:text-brand-700 font-medium text-sm">
              View all →
            </Link>
          </div>
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

      {/* Pricing transparency */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-gray-900 mb-4">Fully Transparent Pricing</h2>
          <p className="text-gray-500 mb-10">Every cost is shown before you pay. No surprise fees at checkout.</p>
          <div className="bg-gray-50 border rounded-2xl p-8 text-left max-w-md mx-auto font-mono text-sm">
            <p className="font-semibold text-gray-700 mb-4 font-sans">Example: 1 night at ৳ 5,000/night</p>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-gray-600">Room price</span><span className="font-semibold">৳ 5,000</span></div>
              <div className="flex justify-between text-gray-400"><span>+ VAT (15%)</span><span>+৳ 750</span></div>
              <div className="flex justify-between text-gray-400"><span>+ Platform fee (8%)</span><span>+৳ 400</span></div>
              <div className="flex justify-between text-gray-400"><span>+ Agent commission (5%)</span><span>+৳ 250</span></div>
              <div className="flex justify-between font-bold text-brand-700 border-t pt-3 mt-3 text-base font-sans">
                <span>You pay</span><span>৳ 6,400</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4 font-sans">Agent commission only applies when you scan an agent&apos;s QR code. All rates are configurable by admin.</p>
          </div>
        </div>
      </section>

      {/* Agent CTA */}
      <section className="py-16 bg-gradient-to-br from-brand-800 to-brand-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-5xl mb-4">🤝</div>
          <h2 className="font-display text-3xl font-bold mb-4">Are You a Travel Agent?</h2>
          <p className="text-brand-200 text-lg mb-8 max-w-2xl mx-auto">
            Join the CoxBeach agent network. Get your unique QR code, earn <strong className="text-white">5% commission</strong> on every booking you refer, and track your earnings in real time. Attribution is reliable even across devices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/agent/register"
              className="inline-block bg-marigold-400 text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-marigold-300 transition"
            >
              Register as Agent
            </Link>
            <Link
              href="/about"
              className="inline-block border border-white/30 text-white font-medium px-8 py-3 rounded-lg hover:bg-white/10 transition"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
