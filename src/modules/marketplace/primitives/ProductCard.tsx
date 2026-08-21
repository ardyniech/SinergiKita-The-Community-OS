import React from 'react';
import { ShoppingBag, Store, MessageCircle, Tag } from 'lucide-react';
import { MarketplaceProduct, AppUser } from '../../../shared/models';
import { generateWhatsAppOrderUrl, formatMarketplaceCategory } from '../logic/marketplaceUtils';

interface ProductCardProps {
  product: MarketplaceProduct;
  currentUser: AppUser | null;
  onBuyOrder: (p: MarketplaceProduct) => void;
}

export function ProductCard({ product, currentUser, onBuyOrder }: ProductCardProps) {
  const isOwner = currentUser?.uid === product.sellerId;
  const isAvailable = (product.stock || 0) > 0;
  const waUrl = generateWhatsAppOrderUrl(product, currentUser);

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-2.5 shadow-xs space-y-2 flex flex-col justify-between">
      <div className="space-y-1.5">
        <div className="aspect-video w-full rounded-lg bg-slate-100 overflow-hidden relative border border-slate-200/50">
          {product.image ? (
            <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <ShoppingBag size={24} />
            </div>
          )}
          <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-white/95 rounded-md shadow-xs border border-slate-200/80">
            <span className="text-[11px] font-black text-slate-900">Rp {product.price.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
              {formatMarketplaceCategory(product.category)}
            </span>
            <span className="text-[9px] text-slate-400 font-medium truncate">Stok: {product.stock || 0}</span>
          </div>
          <h3 className="text-xs font-bold text-slate-900 truncate mt-1 leading-snug">{product.title}</h3>
          {product.description && (
            <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{product.description}</p>
          )}
        </div>

        <div className="flex items-center gap-1 text-[10px] text-slate-500 pt-1 border-t border-slate-100">
          <Store size={11} className="text-slate-400 shrink-0" />
          <span className="truncate">{product.sellerName} {product.sellerHouseNo ? `(${product.sellerHouseNo})` : ''}</span>
        </div>
      </div>

      <div className="pt-1">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onBuyOrder(product)}
          className={`w-full h-8 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs ${
            isAvailable
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-slate-100 text-slate-400 pointer-events-none'
          }`}
        >
          <MessageCircle size={13} />
          <span>{isAvailable ? 'Pesan via WA' : 'Habis'}</span>
        </a>
      </div>
    </div>
  );
}
