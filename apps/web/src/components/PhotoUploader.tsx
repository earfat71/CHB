'use client';

import { useRef, useState } from 'react';

interface Props {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export function PhotoUploader({ photos, onChange, maxPhotos = 10 }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState('');
  const [dragging, setDragging] = useState(false);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = maxPhotos - photos.length;
    Array.from(files).slice(0, remaining).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        onChange([...photos, dataUrl]);
      };
      reader.readAsDataURL(file);
    });
  };

  const addUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (photos.length >= maxPhotos) return;
    onChange([...photos, trimmed]);
    setUrlInput('');
  };

  const remove = (i: number) => onChange(photos.filter((_, idx) => idx !== i));

  const move = (from: number, to: number) => {
    if (to < 0 || to >= photos.length) return;
    const next = [...photos];
    [next[from], next[to]] = [next[to], next[from]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition ${dragging ? 'border-brand-500 bg-brand-50' : 'border-gray-300 hover:border-brand-400 hover:bg-gray-50'}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
      >
        <div className="text-3xl mb-1">📸</div>
        <p className="text-sm font-medium text-gray-700">Tap to upload photos</p>
        <p className="text-xs text-gray-400 mt-0.5">JPEG, PNG, WebP — up to {maxPhotos} photos</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {/* URL input */}
      <div className="flex gap-2">
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl())}
          placeholder="Or paste an image URL…"
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          type="button"
          onClick={addUrl}
          disabled={!urlInput.trim() || photos.length >= maxPhotos}
          className="bg-brand-600 text-white text-sm px-3 py-2 rounded-lg hover:bg-brand-700 disabled:opacity-40 transition"
        >
          Add
        </button>
      </div>

      {/* Preview grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((src, i) => (
            <div key={i} className="relative group rounded-lg overflow-hidden aspect-square bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1">
                <div className="flex gap-1">
                  <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="bg-white/80 text-gray-800 text-xs px-1.5 py-1 rounded disabled:opacity-30">◀</button>
                  <button type="button" onClick={() => move(i, i + 1)} disabled={i === photos.length - 1} className="bg-white/80 text-gray-800 text-xs px-1.5 py-1 rounded disabled:opacity-30">▶</button>
                </div>
                <button type="button" onClick={() => remove(i)} className="bg-red-600 text-white text-xs px-2 py-1 rounded">Remove</button>
              </div>
              {i === 0 && (
                <span className="absolute top-1 left-1 bg-brand-600 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">Cover</span>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400">{photos.length}/{maxPhotos} photos added{photos.length > 0 ? ' — first photo is the cover image' : ''}</p>
    </div>
  );
}
