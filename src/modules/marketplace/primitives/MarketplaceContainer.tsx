import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useMarketplace } from '../logic/useMarketplace';
import { MarketplaceHeader } from './MarketplaceHeader';
import { ProductCard } from './ProductCard';
import { ProductForm } from './ProductForm';
import { Loader2, ShoppingBag, AlertCircle } from 'lucide-react';

export const MarketplaceContainer: React.FC = () => {
  const { profile } = useAuth();
  const { products, loading, submitting, handleAddProduct, handleBuy } = useMarketplace(profile?.tenantId || null, profile);
  const [activeTab, setActiveTab] = useState<'browse' | 'my-orders'>('browse');
  const [showAddForm, setShowAddForm] = useState(false);

  if (loading) return <div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 text-indigo-600 animate-spin" /></div>;

  return (
    <div className="liquid-glass rounded-[40px] p-4 sm:p-6 shadow-3d-lg border-white/60 space-y-6">
      <MarketplaceHeader onAddProduct={() => setShowAddForm(true)} activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="animate-in fade-in duration-500">
        {activeTab === 'browse' && (
          <div className="space-y-6">
            {showAddForm && <ProductForm onAdd={handleAddProduct} onCancel={() => setShowAddForm(false)} submitting={submitting} />}
            {products.length === 0 ? (
              <div className="p-16 text-center bg-white/40 border border-white/80 rounded-[32px]">
                <ShoppingBag size={32} className="mx-auto mb-3 text-slate-200" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Belum ada produk dari warga.<br/>Jadilah yang pertama berjualan!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {products.map(p => <ProductCard key={p.id} product={p} onBuy={handleBuy} />)}
              </div>
            )}
          </div>
        )}
        {activeTab === 'my-orders' && (
          <div className="p-16 text-center bg-white/40 border border-white/80 rounded-[32px]">
            <AlertCircle size={32} className="mx-auto mb-3 text-slate-200" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Riwayat pesanan Anda masih kosong.</p>
          </div>
        )}
      </div>
    </div>
  );
};
