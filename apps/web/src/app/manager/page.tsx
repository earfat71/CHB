'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { hotelApi, Hotel } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { toast } from '@/components/ui/toaster';

export default function ManagerPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [showAddHotel, setShowAddHotel] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', address: '', starRating: 'THREE', amenities: '', checkInTime: '14:00', checkOutTime: '12:00' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !['HOTEL_MANAGER', 'ADMIN'].includes(user.role)) { router.push('/'); return; }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    fetch(`${apiUrl}/api/hotels`, { headers: { Authorization: `Bearer ${localStorage.getItem('coxbeach_token')}` } })
      .then((r) => r.json()).then(setHotels).catch(console.error);
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const hotel = await hotelApi.create({
        ...form,
        amenities: form.amenities.split(',').map((a) => a.trim()).filter(Boolean),
      });
      setHotels((prev) => [...prev, hotel]);
      setShowAddHotel(false);
      toast('Hotel submitted for approval!', 'success');
    } catch (e: unknown) { toast(e instanceof Error ? e.message : 'Failed', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Hotel Manager Dashboard</h1>
        <button onClick={() => setShowAddHotel(true)} className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-700 transition">
          + Add Hotel
        </button>
      </div>

      <div className="space-y-4">
        {hotels.map((hotel) => (
          <div key={hotel.id} className="bg-white border rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{hotel.name}</h3>
                <p className="text-gray-500 text-sm">{hotel.address}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${hotel.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : hotel.status === 'PENDING_APPROVAL' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
                {hotel.status?.replace('_', ' ')}
              </span>
            </div>
            <div className="flex gap-3 mt-4">
              <a href={`/hotels/${hotel.slug || hotel.id}`} target="_blank" className="text-xs text-brand-600 hover:underline">View Public Page →</a>
            </div>
          </div>
        ))}
        {hotels.length === 0 && <p className="text-gray-500 text-center py-8">No hotels yet. Click &quot;Add Hotel&quot; to get started.</p>}
      </div>

      {showAddHotel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg overflow-y-auto max-h-[90vh]">
            <h2 className="font-bold text-lg mb-4">Add New Hotel</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Hotel Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm h-20" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address *</label>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Star Rating *</label>
                <select value={form.starRating} onChange={(e) => setForm({ ...form, starRating: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                  {['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'].map((r) => <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()} Star</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amenities (comma-separated)</label>
                <input value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} placeholder="WiFi, Pool, Restaurant, Gym" className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Check-in Time</label>
                  <input type="time" value={form.checkInTime} onChange={(e) => setForm({ ...form, checkInTime: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Check-out Time</label>
                  <input type="time" value={form.checkOutTime} onChange={(e) => setForm({ ...form, checkOutTime: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={loading} className="flex-1 bg-brand-600 text-white py-2 rounded-lg text-sm font-semibold">{loading ? 'Submitting...' : 'Submit for Approval'}</button>
                <button type="button" onClick={() => setShowAddHotel(false)} className="flex-1 border py-2 rounded-lg text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
