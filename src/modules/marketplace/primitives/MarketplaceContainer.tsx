import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useMarketplace } from '../logic/useMarketplace';
import { MarketplaceHeader } from './MarketplaceHeader';
import { ProductCard } from './ProductCard';
import { ProductForm } from './ProductForm';
import { Loader2, Store } from 'lucide-react';

export const MarketplaceContainer: React.FC = () => {
  const { profile } = useAuth();
  const { products, loading, submitting, handleAddProduct, handleBuy } = useMarketplace(profile?.tenantId || null, profile);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
      </div>
    );
  }

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="space-y-3">
      <MarketplaceHeader
        onAddProduct={() => setShowAddForm(true)}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        totalProducts={products.length}
      />

      <div className="animate-in fade-in duration-300">
        {showAddForm && (
          <div className="mb-3">
            <ProductForm
              onAdd={handleAddProduct}
              onCancel={() => setShowAddForm(false)}
              submitting={submitting}
              userPhone={profile?.phone}
              userHouseNo={profile?.houseNumber}
            />
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-1">
            <Store size={24} className="mx-auto text-slate-300" />
            <p className="text-xs font-semibold text-slate-500">Belum ada produk di kategori ini.</p>
            <p className="text-[10px] text-slate-400">Warga dapat mendaftarkan usaha / kuliner untuk dibeli tetangga.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filteredProducts.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                currentUser={profile}
                onBuyOrder={handleBuy}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
