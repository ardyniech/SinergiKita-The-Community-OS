import React, { useState } from 'react';
import { Package, Tag, Coins, Check, X, Loader2 } from 'lucide-react';
import { MarketplaceProduct } from '../../../shared/models';

interface ProductFormProps {
  onAdd: (p: Partial<MarketplaceProduct>) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function ProductForm({ onAdd, onCancel, submitting }: ProductFormProps) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Pangan');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAdd({ title, price: Number(price), category, description, stock: 10 });
    onCancel();
  };

  return (
    <div className="card-3d p-5 bg-white shadow-3d-lg border-white space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-3d-sm">
            <Package size={20} />
          </div>
          <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-tight">Pasang Iklan Produk</h3>
        </div>
        <button onClick={onCancel} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={20} /></button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Nama Produk</label>
          <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-black outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Harga (Rp)</label>
            <input type="number" required value={price} onChange={e => setPrice(e.target.value)} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-black outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Kategori</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-black outline-none focus:ring-4 focus:ring-indigo-500/10">
              <option>Pangan</option><option>Jasa</option><option>Pakaian</option><option>Elektronik</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn-3d w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-3d-sm">
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Publikasikan Produk
        </button>
      </form>
    </div>
  );
}
