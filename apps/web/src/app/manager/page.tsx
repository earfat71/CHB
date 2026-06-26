'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { hotelApi, Hotel } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { toast } from '@/components/ui/toaster';
import { PhotoUploader } from '@/components/PhotoUploader';

const TIME_OPTIONS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
];

function fmtTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
}

const STAR_OPTIONS = [
  { value: 'ONE', label: '⭐ 1 Star' },
  { value: 'TWO', label: '⭐⭐ 2 Star' },
  { value: 'THREE', label: '⭐⭐⭐ 3 Star' },
  { value: 'FOUR', label: '⭐⭐⭐⭐ 4 Star' },
  { value: 'FIVE', label: '⭐⭐⭐⭐⭐ 5 Star' },
];

const BLANK_FORM = {
  name: '', description: '', address: '',
  starRating: 'THREE', amenities: '',
  checkInTime: '14:00', checkOutTime: '12:00',
  photos: [] as string[],
};

export default function ManagerPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [showAddHotel, setShowAddHotel] = useState(false);
  const [editPhotosId, setEditPhotosId] = useState<string | null>(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (!['MANAGER', 'ADMIN'].includes(user.role)) { router.push('/'); return; }
    hotelApi.list().then(setHotels).catch(console.error);
  }, [user, router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim() || !form.address.trim()) {
      toast('Please fill in all required fields', 'error');
      return;
    }
    setLoading(true);
    try {
      const hotel = await hotelApi.create({
        ...form,
        amenities: form.amenities.split(',').map((a) => a.trim()).filter(Boolean),
        photos: form.photos,
      });
      setHotels((prev) => [...prev, hotel]);
      setShowAddHotel(false);
      setForm(BLANK_FORM);
      toast('Hotel submitted for approval!', 'success');
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Failed to submit', 'error');
    } finally {
      setLoading(false);
    }
  };

  const savePhotos = async (hotelId: string, photos: string[]) => {
    try {
      await hotelApi.update(hotelId, { photos });
      setHotels((prev) => prev.map((h) => h.id === hotelId ? { ...h, photos } : h));
      toast('Photos saved!', 'success');
    } catch (e: unknown) { toast(e instanceof Error ? e.message : 'Failed', 'error'); }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Hotel Manager Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your hotel listings</p>
        </div>
        <button
          onClick={() => { setForm(BLANK_FORM); setShowAddHotel(true); }}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-700 transition font-medium"
        >
          + Add Hotel
        </button>
      </div>

      <div className="space-y-4">
        {hotels.map((hotel) => (
          <div key={hotel.id} className="bg-white border rounded-xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{hotel.name}</h3>
                <p className="text-gray-500 text-sm mt-0.5">{hotel.address}</p>
                <div className="flex gap-3 mt-1 text-xs text-gray-400">
                  <span>{hotel.starRating?.replace('_STAR', '').replace('_', ' ')} Star</span>
                  <span>Check-in {hotel.checkInTime}</span>
                  <span>Check-out {hotel.checkOutTime}</span>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${
                hotel.status === 'APPROVED' ? 'bg-green-50 text-green-700' :
                hotel.status === 'PENDING_APPROVAL' ? 'bg-yellow-50 text-yellow-700' :
                'bg-red-50 text-red-700'
              }`}>
                {hotel.status?.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-4">
              <button
                onClick={() => setEditPhotosId(hotel.id)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition"
              >
                📸 Photos ({hotel.photos?.length ?? 0})
              </button>
              <a href={`/hotels/${hotel.slug || hotel.id}`} target="_blank" className="text-xs text-brand-600 hover:underline">View Public Page →</a>
            </div>
          </div>
        ))}
        {hotels.length === 0 && (
          <div className="text-center py-12 text-gray-400 bg-white border rounded-xl">
            <div className="text-4xl mb-3">🏨</div>
            <p className="font-medium">No hotels yet</p>
            <p className="text-sm mt-1">Click &quot;Add Hotel&quot; to submit your first listing.</p>
          </div>
        )}
      </div>

      {/* Edit Photos Modal */}
      {editPhotosId && (() => {
        const hotel = hotels.find((h) => h.id === editPhotosId);
        if (!hotel) return null;
        return (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
              <div className="p-5 border-b flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-lg">Manage Photos</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{hotel.name}</p>
                </div>
                <button onClick={() => setEditPhotosId(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
              </div>
              <div className="p-5 space-y-4">
                <PhotoUploader
                  photos={hotel.photos ?? []}
                  onChange={(photos) => setHotels((prev) => prev.map((h) => h.id === hotel.id ? { ...h, photos } : h))}
                />
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => { savePhotos(hotel.id, hotel.photos ?? []); setEditPhotosId(null); }}
                    className="flex-1 bg-brand-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-700 transition"
                  >
                    Save Photos
                  </button>
                  <button onClick={() => setEditPhotosId(null)} className="flex-1 border py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {showAddHotel && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
            <div className="p-5 border-b flex items-center justify-between">
              <h2 className="font-bold text-lg">Add New Hotel</h2>
              <button onClick={() => setShowAddHotel(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Hotel Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Ocean Paradise Resort"
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe your hotel, location, and key highlights…"
                  className="w-full border rounded-lg px-3 py-2.5 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Address *</label>
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="e.g. Kolatoli Beach Road, Cox's Bazar"
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Star Rating *</label>
                <select
                  value={form.starRating}
                  onChange={(e) => setForm({ ...form, starRating: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  {STAR_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Amenities</label>
                <input
                  value={form.amenities}
                  onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                  placeholder="WiFi, Pool, Restaurant, Gym, Spa, Parking"
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <p className="text-xs text-gray-400 mt-1">Separate each amenity with a comma</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Check-in Time</label>
                  <select
                    value={form.checkInTime}
                    onChange={(e) => setForm({ ...form, checkInTime: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    {TIME_OPTIONS.map((t) => <option key={t} value={t}>{fmtTime(t)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Check-out Time</label>
                  <select
                    value={form.checkOutTime}
                    onChange={(e) => setForm({ ...form, checkOutTime: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    {TIME_OPTIONS.map((t) => <option key={t} value={t}>{fmtTime(t)}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Hotel Photos</label>
                <PhotoUploader
                  photos={form.photos}
                  onChange={(photos) => setForm({ ...form, photos })}
                />
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
                Your hotel will be reviewed by our team before going live. This usually takes 1–2 business days.
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-brand-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-700 disabled:opacity-50 transition"
                >
                  {loading ? 'Submitting…' : 'Submit for Approval'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddHotel(false)}
                  className="flex-1 border py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
