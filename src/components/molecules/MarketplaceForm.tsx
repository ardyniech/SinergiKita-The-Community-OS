import React from 'react';
import { LucideIcon } from 'lucide-react';
import { MarketplaceItem } from '../../types';

interface Category {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

interface MarketplaceFormProps {
  newItem: { name: string; price: string; description: string; category: MarketplaceItem['category']; isNegotiable: boolean };
  setNewItem: (val: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  categories: Category[];
  submitting?: boolean;
}

export function MarketplaceForm({ newItem, setNewItem, onSubmit, onCancel, categories, submitting }: MarketplaceFormProps) {
  return (
    <form onSubmit={onSubmit} className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm space-y-3">
      <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Pasang Iklan Baru</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Nama Barang / Jasa</label>
          <input
            required
            type="text"
            value={newItem.name}
            onChange={e => setNewItem({ ...newItem, name: e.target.value })}
            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
            placeholder="Contoh: Ban Luar Ring 14"
          />
        </div>
        <div>
          <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Harga (Rp)</label>
          <input
            required
            type="number"
            value={newItem.price}
            onChange={e => setNewItem({ ...newItem, price: e.target.value })}
            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
            placeholder="150000"
          />
        </div>
        <div>
          <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Kategori</label>
          <select
            value={newItem.category}
            onChange={e => setNewItem({ ...newItem, category: e.target.value as any })}
            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
          >
            {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Keterangan Singkat</label>
          <textarea
            value={newItem.description}
            onChange={e => setNewItem({ ...newItem, description: e.target.value })}
            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none resize-none"
            rows={2}
            placeholder="Kondisi 90%, nego bensin..."
          />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            id="isNegotiable"
            checked={newItem.isNegotiable}
            onChange={e => setNewItem({ ...newItem, isNegotiable: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isNegotiable" className="text-[10px] font-bold text-gray-500 uppercase">Harga Bisa Nego</label>
        </div>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all">Batal</button>
        <button type="submit" disabled={submitting} className="flex-[2] py-2.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50">Tayangkan Iklan</button>
      </div>
    </form>
  );
}
