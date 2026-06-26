'use client';

import { useState } from 'react';
import { Room, hotelApi, roomApi } from '@/lib/api';
import { formatBDT } from '@/lib/utils';
import { toast } from '@/components/ui/toaster';
import { PhotoUploader } from '@/components/PhotoUploader';

const ROOM_TYPES = ['STANDARD', 'DELUXE', 'SUITE', 'PENTHOUSE', 'FAMILY', 'BUDGET'];

const BLANK_ROOM = {
  name: '', type: 'STANDARD', description: '',
  basePriceBdt: '', maxGuests: '2', totalUnits: '1', amenities: '',
  discountType: 'NONE' as 'NONE' | 'PERCENTAGE' | 'AMOUNT',
  discountValue: '',
  discountLabel: '',
  photos: [] as string[],
};

type RoomForm = typeof BLANK_ROOM;
type FormTab = 'details' | 'discount' | 'photos';

function computeDiscountedPrice(base: number, discountType: string, discountValue: string) {
  if (discountType === 'PERCENTAGE') {
    const pct = Number(discountValue);
    if (pct > 0 && pct < 100) return Math.round(base * (1 - pct / 100));
  }
  if (discountType === 'AMOUNT') {
    const amt = Number(discountValue);
    if (amt > 0 && amt < base) return base - amt;
  }
  return base;
}

function RoomFormDetails({ form, onChange }: { form: RoomForm; onChange: (f: RoomForm) => void }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Room Name *</label>
          <input
            value={form.name}
            onChange={(e) => onChange({ ...form, name: e.target.value })}
            placeholder="e.g. Deluxe Sea View"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Room Type *</label>
          <select
            value={form.type}
            onChange={(e) => onChange({ ...form, type: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            {ROOM_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Base Price (BDT/night) *</label>
          <input
            type="number"
            value={form.basePriceBdt}
            onChange={(e) => onChange({ ...form, basePriceBdt: e.target.value })}
            placeholder="5000"
            min="100"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Max Guests *</label>
          <input
            type="number"
            value={form.maxGuests}
            onChange={(e) => onChange({ ...form, maxGuests: e.target.value })}
            min="1" max="20"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Total Units *</label>
          <input
            type="number"
            value={form.totalUnits}
            onChange={(e) => onChange({ ...form, totalUnits: e.target.value })}
            min="1" max="500"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            required
          />
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => onChange({ ...form, description: e.target.value })}
            placeholder="Comfortable room with sea view and modern furnishings…"
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none h-16 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Amenities</label>
          <input
            value={form.amenities}
            onChange={(e) => onChange({ ...form, amenities: e.target.value })}
            placeholder="AC, WiFi, TV, Hot Water, Mini Bar, Balcony"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <p className="text-[11px] text-gray-400 mt-0.5">Separate with commas</p>
        </div>
      </div>
    </div>
  );
}

function RoomFormDiscount({ form, onChange }: { form: RoomForm; onChange: (f: RoomForm) => void }) {
  const base = Number(form.basePriceBdt) || 0;
  const discounted = computeDiscountedPrice(base, form.discountType, form.discountValue);
  const hasDiscount = form.discountType !== 'NONE' && discounted < base;

  const vat = Math.round(discounted * 0.15);
  const platform = Math.round(discounted * 0.08);
  const agent = Math.round(discounted * 0.05);
  const guestTotal = discounted + vat + platform + agent;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Discount Type</label>
        <select
          value={form.discountType}
          onChange={(e) => onChange({ ...form, discountType: e.target.value as RoomForm['discountType'], discountValue: '', discountLabel: '' })}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
        >
          <option value="NONE">No Discount</option>
          <option value="PERCENTAGE">Percentage Off (%)</option>
          <option value="AMOUNT">Fixed Amount Off (BDT)</option>
        </select>
      </div>

      {form.discountType !== 'NONE' && (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {form.discountType === 'PERCENTAGE' ? 'Discount Percentage (%)' : 'Discount Amount (BDT)'}
            </label>
            <input
              type="number"
              value={form.discountValue}
              onChange={(e) => onChange({ ...form, discountValue: e.target.value })}
              placeholder={form.discountType === 'PERCENTAGE' ? 'e.g. 15' : 'e.g. 500'}
              min="1"
              max={form.discountType === 'PERCENTAGE' ? '99' : undefined}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Discount Label (optional)</label>
            <input
              value={form.discountLabel}
              onChange={(e) => onChange({ ...form, discountLabel: e.target.value })}
              placeholder='e.g. "Weekend Special" or "Early Bird"'
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p className="text-[11px] text-gray-400 mt-0.5">Shown to guests as a badge on the room card</p>
          </div>
        </>
      )}

      {base > 0 && (
        <div className="bg-gray-50 border rounded-xl p-4 text-sm">
          <p className="font-medium text-gray-700 mb-2">Pricing Preview (per night)</p>
          <div className="space-y-1 text-xs text-gray-600">
            {hasDiscount ? (
              <>
                <div className="flex justify-between">
                  <span>Original price</span>
                  <span className="line-through text-gray-400">{formatBDT(base)}</span>
                </div>
                <div className="flex justify-between text-red-600 font-medium">
                  <span>
                    {form.discountType === 'PERCENTAGE'
                      ? `− ${form.discountValue}% discount`
                      : `− ${formatBDT(Number(form.discountValue))} off`}
                  </span>
                  <span>− {formatBDT(base - discounted)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Discounted price</span>
                  <span>{formatBDT(discounted)}</span>
                </div>
                <div className="border-t my-1" />
              </>
            ) : (
              <div className="flex justify-between"><span>Base price</span><span className="font-medium">{formatBDT(base)}</span></div>
            )}
            <div className="flex justify-between text-gray-400"><span>+ VAT (15%)</span><span>+{formatBDT(vat)}</span></div>
            <div className="flex justify-between text-gray-400"><span>+ Platform fee (8%)</span><span>+{formatBDT(platform)}</span></div>
            <div className="flex justify-between text-gray-400"><span>+ Agent comm (5%)</span><span>+{formatBDT(agent)}</span></div>
            <div className="flex justify-between font-semibold text-green-700 border-t pt-1 mt-1">
              <span>Guest pays</span><span>{formatBDT(guestTotal)}</span>
            </div>
          </div>
        </div>
      )}

      {form.discountType === 'NONE' && (
        <p className="text-xs text-gray-400 text-center py-4">Select a discount type above to set up a special offer for this room.</p>
      )}
    </div>
  );
}

interface Props {
  hotelId: string;
  hotelName: string;
  initialRooms: Room[];
  onClose: () => void;
}

export function RoomManager({ hotelId, hotelName, initialRooms, onClose }: Props) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [form, setForm] = useState<RoomForm>(BLANK_ROOM);
  const [formTab, setFormTab] = useState<FormTab>('details');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openAdd = () => {
    setForm(BLANK_ROOM);
    setEditingRoom(null);
    setFormTab('details');
    setMode('add');
  };

  const openEdit = (room: Room) => {
    setEditingRoom(room);
    setForm({
      name: room.name,
      type: room.type,
      description: room.description ?? '',
      basePriceBdt: String(room.basePriceBdt),
      maxGuests: String(room.maxGuests),
      totalUnits: String(room.totalUnits),
      amenities: (room.amenities ?? []).join(', '),
      discountType: room.discountType ?? 'NONE',
      discountValue: room.discountValue != null ? String(room.discountValue) : '',
      discountLabel: room.discountLabel ?? '',
      photos: room.photos ?? [],
    });
    setFormTab('details');
    setMode('edit');
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.basePriceBdt) {
      toast('Room name and price are required', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload: Partial<Room> = {
        name: form.name.trim(),
        type: form.type,
        description: form.description.trim(),
        basePriceBdt: Number(form.basePriceBdt),
        maxGuests: Number(form.maxGuests),
        totalUnits: Number(form.totalUnits),
        amenities: form.amenities.split(',').map((a) => a.trim()).filter(Boolean),
        photos: form.photos,
        discountType: form.discountType,
        discountValue: form.discountType !== 'NONE' && form.discountValue ? Number(form.discountValue) : 0,
        discountLabel: form.discountLabel.trim(),
      };

      if (mode === 'add') {
        const created = await hotelApi.addRoom(hotelId, payload);
        setRooms((prev) => [...prev, created]);
        toast('Room added!', 'success');
      } else if (editingRoom) {
        const updated = await roomApi.update(editingRoom.id, payload);
        setRooms((prev) => prev.map((r) => r.id === editingRoom.id ? updated : r));
        toast('Room updated!', 'success');
      }
      setMode('list');
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (roomId: string) => {
    setDeletingId(roomId);
    try {
      await roomApi.delete(roomId);
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
      toast('Room deleted', 'info');
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Delete failed', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleActive = async (room: Room) => {
    try {
      const updated = await roomApi.update(room.id, { isActive: !room.isActive });
      setRooms((prev) => prev.map((r) => r.id === room.id ? updated : r));
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Failed', 'error');
    }
  };

  const discountBadge = (room: Room) => {
    if (!room.discountType || room.discountType === 'NONE') return null;
    if (!room.discountValue) return null;
    if (room.discountLabel) return room.discountLabel;
    if (room.discountType === 'PERCENTAGE') return `${room.discountValue}% OFF`;
    return `${formatBDT(room.discountValue)} OFF`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl overflow-y-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-bold text-lg">
              {mode === 'list' ? 'Manage Rooms' : mode === 'add' ? 'Add New Room' : 'Edit Room'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">{hotelName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        {/* Body */}
        <div className="p-5 flex-1 overflow-y-auto">
          {mode === 'list' && (
            <div className="space-y-3">
              {rooms.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                  <div className="text-4xl mb-2">🛏️</div>
                  <p className="font-medium">No rooms yet</p>
                  <p className="text-sm mt-1">Add your first room type below.</p>
                </div>
              )}

              {rooms.map((room) => {
                const badge = discountBadge(room);
                return (
                  <div key={room.id} className={`border rounded-xl p-4 ${room.isActive === false ? 'opacity-60 bg-gray-50' : 'bg-white'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Cover photo thumbnail if available */}
                        {room.photos?.length > 0 && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={room.photos[0]}
                            alt={room.name}
                            className="w-full h-28 object-cover rounded-lg mb-2"
                          />
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{room.name}</span>
                          <span className="bg-blue-50 text-blue-700 text-[11px] px-2 py-0.5 rounded font-medium">{room.type}</span>
                          {room.isActive === false && <span className="bg-gray-200 text-gray-500 text-[11px] px-2 py-0.5 rounded">Inactive</span>}
                          {badge && (
                            <span className="bg-red-100 text-red-700 text-[11px] px-2 py-0.5 rounded font-semibold">🏷️ {badge}</span>
                          )}
                          {room.photos?.length > 0 && (
                            <span className="bg-gray-100 text-gray-500 text-[11px] px-2 py-0.5 rounded">📸 {room.photos.length}</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5 text-xs text-gray-500">
                          <span className="font-semibold text-green-700 text-sm">{formatBDT(room.basePriceBdt)}<span className="font-normal text-gray-400">/night</span></span>
                          <span>👥 Max {room.maxGuests} guests</span>
                          <span>🏠 {room.totalUnits} units</span>
                        </div>
                        {room.amenities?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {room.amenities.slice(0, 5).map((a) => (
                              <span key={a} className="bg-gray-100 text-gray-600 text-[11px] px-1.5 py-0.5 rounded">{a}</span>
                            ))}
                            {room.amenities.length > 5 && <span className="text-[11px] text-gray-400">+{room.amenities.length - 5} more</span>}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button onClick={() => openEdit(room)} className="text-xs bg-brand-50 text-brand-700 px-3 py-1.5 rounded-lg hover:bg-brand-100 font-medium transition">Edit</button>
                        <button onClick={() => toggleActive(room)} className="text-xs border px-3 py-1.5 rounded-lg hover:bg-gray-50 font-medium transition text-gray-600">
                          {room.isActive === false ? 'Activate' : 'Deactivate'}
                        </button>
                        <button
                          onClick={() => handleDelete(room.id)}
                          disabled={deletingId === room.id}
                          className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 font-medium transition disabled:opacity-50"
                        >
                          {deletingId === room.id ? '…' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                onClick={openAdd}
                className="w-full border-2 border-dashed border-brand-300 text-brand-600 hover:bg-brand-50 rounded-xl py-3 text-sm font-medium transition"
              >
                + Add Room Type
              </button>
            </div>
          )}

          {(mode === 'add' || mode === 'edit') && (
            <div className="space-y-4">
              {/* Tab bar */}
              <div className="flex border-b">
                {(['details', 'discount', 'photos'] as FormTab[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setFormTab(tab)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition capitalize ${
                      formTab === tab
                        ? 'border-brand-600 text-brand-700'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab === 'details' ? '📋 Details' : tab === 'discount' ? '🏷️ Discount' : `📸 Photos${form.photos.length > 0 ? ` (${form.photos.length})` : ''}`}
                  </button>
                ))}
              </div>

              {formTab === 'details' && <RoomFormDetails form={form} onChange={setForm} />}
              {formTab === 'discount' && <RoomFormDiscount form={form} onChange={setForm} />}
              {formTab === 'photos' && (
                <PhotoUploader
                  photos={form.photos}
                  onChange={(photos) => setForm({ ...form, photos })}
                  maxPhotos={8}
                />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t shrink-0">
          {mode === 'list' ? (
            <button onClick={onClose} className="w-full border py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Close</button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-brand-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-700 disabled:opacity-50 transition"
              >
                {saving ? 'Saving…' : mode === 'add' ? 'Add Room' : 'Save Changes'}
              </button>
              <button onClick={() => setMode('list')} className="flex-1 border py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Back</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
