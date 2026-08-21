import React from 'react';
import { ShoppingBag, Plus, History, Search } from 'lucide-react';

interface MarketplaceHeaderProps {
  onAddProduct: () => void;
  activeTab: 'browse' | 'my-orders';
  setActiveTab: (tab: 'browse' | 'my-orders') => void;
}

export function MarketplaceHeader({ onAddProduct, activeTab, setActiveTab }: MarketplaceHeaderProps) {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-3d-sm">
            <ShoppingBag size={22} />
          </div>
          <div>
            <h2 className="text-[15px] font-black text-slate-900 leading-tight uppercase tracking-tight">Market Komunitas</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5 opacity-70">Ekonomi Berdikari Warga</p>
          </div>
        </div>
        <button
          onClick={onAddProduct}
          className="btn-3d w-11 h-11 bg-white border border-slate-200 text-indigo-600 rounded-2xl flex items-center justify-center shadow-3d-sm hover:bg-slate-50 transition"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="flex bg-slate-100/50 p-1.5 rounded-[20px] overflow-x-auto gap-2 border border-slate-200/50 backdrop-blur-md scrollbar-hide">
        <button
          onClick={() => setActiveTab('browse')}
          className={`btn-3d flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border ${
            activeTab === 'browse' 
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-3d-sm' 
              : 'bg-white/40 text-slate-500 border-white/80 hover:bg-white'
          }`}
        >
          <Search size={14} /> Jelajah Toko
        </button>
        <button
          onClick={() => setActiveTab('my-orders')}
          className={`btn-3d flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border ${
            activeTab === 'my-orders' 
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-3d-sm' 
              : 'bg-white/40 text-slate-500 border-white/80 hover:bg-white'
          }`}
        >
          <History size={14} /> Pesanan Saya
        </button>
      </div>
    </div>
  );
}
