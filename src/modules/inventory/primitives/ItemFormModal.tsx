import React, { useState } from 'react';
import { Loader2, Plus, X } from 'lucide-react';
import { InventoryItem } from '../../../shared/models';

interface ItemFormModalProps {
  submitting: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<InventoryItem>) => Promise<void>;
}

export function ItemFormModal({ submitting, onClose, onSubmit }: ItemFormModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InventoryItem['category']>('tenda_kursi');
  const [totalQuantity, setTotalQuantity] = useState('10');
  const [condition, setCondition] = useState<InventoryItem['condition']>('good');
  const [location, setLocation] = useState('Gudang RT 05');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(totalQuantity, 10);
    if (!name.trim() || !qty || qty <= 0) return;

    await onSubmit({
      name: name.trim(), category, totalQuantity: qty, condition, location: location.trim(), notes: notes.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-sm bg-white rounded-xl p-3.5 shadow-xl border border-slate-200 space-y-2.5">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-900">Tambah Inventaris / Aset</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          <div>
            <label className="text-[10px] font-bold text-slate-600">Nama Barang / Aset</label>
            <input
              type="text" required placeholder="Contoh: Kursi Lipat Chitose" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full h-8.5 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:border-teal-500 mt-0.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-600">Kategori</label>
              <select
                value={category} onChange={(e) => setCategory(e.target.value as any)}
                className="w-full h-8.5 px-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 outline-none focus:border-teal-500 mt-0.5"
              >
                <option value="tenda_kursi">Tenda & Kursi</option>
                <option value="sound_elektronik">Sound & Elektronik</option>
                <option value="alat_kebersihan">Alat Kebersihan</option>
                <option value="perkakas">Perkakas</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-600">Jumlah Unit</label>
              <input
                type="number" required min="1" value={totalQuantity} onChange={(e) => setTotalQuantity(e.target.value)}
                className="w-full h-8.5 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-900 outline-none focus:border-teal-500 mt-0.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-600">Kondisi</label>
              <select
                value={condition} onChange={(e) => setCondition(e.target.value as any)}
                className="w-full h-8.5 px-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 outline-none focus:border-teal-500 mt-0.5"
              >
                <option value="good">Baik & Siap Pakai</option>
                <option value="fair">Cukup Baik</option>
                <option value="needs_repair">Perlu Servis</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-600">Lokasi Simpan</label>
              <input
                type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                className="w-full h-8.5 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:border-teal-500 mt-0.5"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600">Catatan (Opsional)</label>
            <input
              type="text" placeholder="Contoh: Termasuk kabel rol 10m" value={notes} onChange={(e) => setNotes(e.target.value)}
              className="w-full h-8.5 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:border-teal-500 mt-0.5"
            />
          </div>

          <button
            type="submit" disabled={submitting || !name.trim()}
            className="w-full h-9 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs disabled:opacity-50 mt-1"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            <span>Simpan Data Aset</span>
          </button>
        </form>
      </div>
    </div>
  );
}
