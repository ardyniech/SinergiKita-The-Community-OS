import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { usePOS } from '../logic/usePOS';
import { CartView } from './CartView';
import { Search, Loader2, Package, Tag } from 'lucide-react';

export const POSContainer: React.FC = () => {
  const { profile } = useAuth();
  const { cart, loading, processing, addToCart, removeFromCart, updateQuantity, totalAmount, handleCheckout } = usePOS(profile?.tenantId || null, profile);
  const [search, setSearch] = useState('');

  // Mock products for scanner demo
  const mockProducts = [
    { id: '1', sku: '101', name: 'Beras Premium 5kg', price: 65000, stock: 50 },
    { id: '2', sku: '102', name: 'Minyak Goreng 2L', price: 28000, stock: 30 },
    { id: '3', sku: '103', name: 'Gula Pasir 1kg', price: 15000, stock: 100 },
    { id: '4', sku: '104', name: 'Telur Ayam 1kg', price: 26000, stock: 40 },
  ];

  if (loading) return <div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 text-indigo-600 animate-spin" /></div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-1">
      <div className="lg:col-span-7 space-y-6">
        <div className="card-3d p-4 bg-white/60 border-white/60 shadow-3d-sm space-y-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-[14px] font-black text-slate-900 uppercase tracking-tight">Scanner & Inventori</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Cari SKU atau Nama Produk</p>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Scan Barcode / Cari Produk..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl text-[12px] font-black outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {mockProducts.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.includes(search)).map(p => (
            <button 
              key={p.id}
              onClick={() => addToCart(p)}
              className="card-3d p-4 bg-white/80 border-white/60 shadow-3d-sm text-left space-y-2 hover:bg-white hover:scale-[1.02] transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                <Package size={20} />
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-tight line-clamp-1">{p.name}</p>
                <p className="text-[9px] font-bold text-slate-400 tracking-wider">SKU: {p.sku}</p>
              </div>
              <div className="pt-2 border-t border-slate-50 flex justify-between items-center">
                <span className="text-[12px] font-black text-indigo-600 tabular-nums">Rp {p.price.toLocaleString()}</span>
                <span className="text-[8px] font-black text-slate-300 uppercase">Stok: {p.stock}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-5">
        <CartView 
          cart={cart} 
          onUpdateQty={updateQuantity} 
          onRemove={removeFromCart} 
          total={totalAmount} 
          onCheckout={handleCheckout} 
          processing={processing}
        />
      </div>
    </div>
  );
};
