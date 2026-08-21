import React, { useState } from 'react';
import { Package, X, Loader2, Plus } from 'lucide-react';
import { MarketplaceProduct } from '../../../shared/models';

interface ProductFormProps {
  onAdd: (p: Partial<MarketplaceProduct>) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
  userPhone?: string;
  userHouseNo?: string;
}

export function ProductForm({ onAdd, onCancel, submitting, userPhone = '', userHouseNo = '' }: ProductFormProps) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('kuliner');
  const [stock, setStock] = useState('10');
  const [sellerPhone, setSellerPhone] = useState(userPhone);
  const [sellerHouseNo, setSellerHouseNo] = useState(userHouseNo);
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(price, 10);
    const s = parseInt(stock, 10);
    if (!title.trim() || !p || p <= 0) return;

    await onAdd({
      title: title.trim(),
      price: p,
      category,
      stock: s || 1,
      sellerPhone: sellerPhone.trim(),
      sellerHouseNo: sellerHouseNo.trim(),
      description: description.trim(),
      status: 'available'
    });
    onCancel();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2.5">
      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
        <div className="flex items-center gap-1.5 text-amber-700">
          <Package size={16} />
          <h3 className="text-xs font-bold text-slate-900">Jual Produk UMKM Warga</h3>
        </div>
        <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <label className="text-[10px] font-bold text-slate-600">Nama Produk / Jasa</label>
          <input
            type="text" required placeholder="Contoh: Risol Mayo Lumer Isi 5" value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full h-8.5 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:border-amber-500 mt-0.5"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-bold text-slate-600">Harga (Rp)</label>
            <input
              type="number" required min="500" value={price} onChange={e => setPrice(e.target.value)}
              className="w-full h-8.5 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-900 outline-none focus:border-amber-500 mt-0.5"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-600">Kategori</label>
            <select
              value={category} onChange={e => setCategory(e.target.value)}
              className="w-full h-8.5 px-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 outline-none focus:border-amber-500 mt-0.5"
            >
              <option value="kuliner">Kuliner & Snack</option>
              <option value="sembako">Sembako & Sayur</option>
              <option value="jasa">Jasa & Keahlian</option>
              <option value="pakaian">Pakaian</option>
              <option value="kerajinan">Kerajinan Tangan</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-bold text-slate-600">No. WhatsApp Penjual</label>
            <input
              type="tel" placeholder="0812xxxx" value={sellerPhone} onChange={e => setSellerPhone(e.target.value)}
              className="w-full h-8.5 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:border-amber-500 mt-0.5"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-600">Blok / No Rumah</label>
            <input
              type="text" placeholder="Blok B3 No. 12" value={sellerHouseNo} onChange={e => setSellerHouseNo(e.target.value)}
              className="w-full h-8.5 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:border-amber-500 mt-0.5"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-600">Deskripsi Singkat</label>
          <input
            type="text" placeholder="Fresh dibuat tiap pagi, free ongkir area RT" value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full h-8.5 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:border-amber-500 mt-0.5"
          />
        </div>

        <button
          type="submit" disabled={submitting || !title.trim()}
          className="w-full h-9 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs disabled:opacity-50 mt-1"
        >
          {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          <span>Tayangkan Produk ke Pasar Warga</span>
        </button>
      </form>
    </div>
  );
}
