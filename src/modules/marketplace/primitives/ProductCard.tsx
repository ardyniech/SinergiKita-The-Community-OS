import React from 'react';
import { ShoppingBag, Tag, Store } from 'lucide-react';
import { MarketplaceProduct } from '../../../shared/models';

interface ProductCardProps {
  product: MarketplaceProduct;
  onBuy: (p: MarketplaceProduct) => void;
}

export function ProductCard({ product, onBuy }: ProductCardProps) {
  return (
    <div className="card-3d p-3 bg-white/60 border-white/60 shadow-3d-sm space-y-3 hover:shadow-3d-lg transition-all group">
      <div className="aspect-square rounded-2xl bg-slate-100 overflow-hidden relative border border-slate-200/50 shadow-inner">
        {product.image ? (
          <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <ShoppingBag size={40} />
          </div>
        )}
        <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur-md rounded-lg shadow-3d-sm border border-white/50">
          <p className="text-[10px] font-black text-slate-900 tabular-nums">Rp {product.price.toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-1.5 opacity-60">
          <Tag size={10} className="text-indigo-500" />
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{product.category}</span>
        </div>
        <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-tight truncate leading-tight">{product.title}</h3>
        <div className="flex items-center gap-1 opacity-70">
          <Store size={10} className="text-slate-400" />
          <p className="text-[9px] font-bold text-slate-400 truncate tracking-wide">{product.sellerName}</p>
        </div>
      </div>

      <button
        onClick={() => onBuy(product)}
        className="btn-3d w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-3d-sm active:translate-y-0.5 transition-all"
      >
        <ShoppingBag size={14} /> Beli Sekarang
      </button>
    </div>
  );
}
