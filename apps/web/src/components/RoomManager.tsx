'use client';

import { useState } from 'react';
import { Room, hotelApi, roomApi } from '@/lib/api';
import { formatBDT } from '@/lib/utils';
import { toast } from '@/components/ui/toaster';

const ROOM_TYPES = ['STANDARD', 'DELUXE', 'SUITE', 'PENTHOUSE', 'FAMILY', 'BUDGET'];

const BLANK_ROOM = {
  name: '', type: 'STANDARD', description: '',
  basePriceBdt: '', maxGuests: '2', totalUnits: '1', amenities: '',
};

type RoomForm = typeof BLANK_ROOM;

function RoomFormFields({ form, onChange }: { form: RoomForm; onChange: (f: RoomForm) => void }) {
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
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openAdd = () => { setForm(BLANK_ROOM); setEditingRoom(null); setMode('add'); };
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
    });
    setMode('edit');
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.basePriceBdt) {
      toast('Room name and price are required', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        description: form.description.trim(),
        basePriceBdt: Number(form.basePriceBdt),
        maxGuests: Number(form.maxGuests),
        totalUnits: Number(form.totalUnits),
        amenities: form.amenities.split(',').map((a) => a.trim()).filter(Boolean),
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

              {rooms.map((room) => (
                <div key={room.id} className={`border rounded-xl p-4 ${room.isActive === false ? 'opacity-60 bg-gray-50' : 'bg-white'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{room.name}</span>
                        <span className="bg-blue-50 text-blue-700 text-[11px] px-2 py-0.5 rounded font-medium">{room.type}</span>
                        {room.isActive === false && <span className="bg-gray-200 text-gray-500 text-[11px] px-2 py-0.5 rounded">Inactive</span>}
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
              ))}

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
              <RoomFormFields form={form} onChange={setForm} />

              {/* Pricing preview */}
              {form.basePriceBdt && Number(form.basePriceBdt) > 0 && (
                <div className="bg-gray-50 border rounded-xl p-4 text-sm">
                  <p className="font-medium text-gray-700 mb-2">Pricing Preview (per night)</p>
                  {(() => {
                    const base = Number(form.basePriceBdt);
                    const vat = Math.round(base * 0.15);
                    const platform = Math.round(base * 0.05);
                    const agent = Math.round(base * 0.08);
                    return (
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex justify-between"><span>Base price</span><span className="font-medium">{formatBDT(base)}</span></div>
                        <div className="flex justify-between text-gray-400"><span>+ VAT (15%)</span><span>+{formatBDT(vat)}</span></div>
                        <div className="flex justify-between text-gray-400"><span>+ Platform fee (5%)</span><span>+{formatBDT(platform)}</span></div>
                        <div className="flex justify-between text-gray-400"><span>+ Agent comm (8%)</span><span>+{formatBDT(agent)}</span></div>
                        <div className="flex justify-between font-semibold text-green-700 border-t pt-1 mt-1">
                          <span>Guest pays</span><span>{formatBDT(base + vat + platform + agent)}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
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
