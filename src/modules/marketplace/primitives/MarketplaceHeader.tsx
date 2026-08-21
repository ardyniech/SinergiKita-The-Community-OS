import React from 'react';
import { ShoppingBag, Plus, Store } from 'lucide-react';

interface MarketplaceHeaderProps {
  onAddProduct: () => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  totalProducts: number;
}

const CATEGORIES = [
  { id: 'all', label: 'Semua' },
  { id: 'kuliner', label: 'Kuliner' },
  { id: 'sembako', label: 'Sembako' },
  { id: 'jasa', label: 'Jasa' },
  { id: 'pakaian', label: 'Pakaian' },
  { id: 'kerajinan', label: 'Kerajinan' },
];

export function MarketplaceHeader({
  onAddProduct,
  selectedCategory,
  setSelectedCategory,
  totalProducts
}: MarketplaceHeaderProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Store size={18} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900">Pasar & UMKM Warga</h2>
            <p className="text-[10px] text-slate-400">Beli dari tetangga, majukan ekonomi warga</p>
          </div>
        </div>

        <button
          onClick={onAddProduct}
          className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
        >
          <Plus size={14} />
          <span>Jual Produk</span>
        </button>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
