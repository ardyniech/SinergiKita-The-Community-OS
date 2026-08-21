import { useState, useEffect } from 'react';
import { MarketplaceProduct, AppUser } from '../../../shared/models';
import { marketplaceStorage } from '../storage/marketplaceStorage';
import { dispatcher } from '../../../core/dispatcher';

export function useMarketplace(tenantId: string | null, profile: AppUser | null) {
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!tenantId) return;
    return marketplaceStorage.subscribeToProducts(tenantId, (data) => {
      setProducts(data);
      setLoading(false);
    });
  }, [tenantId]);

  const handleAddProduct = async (data: Partial<MarketplaceProduct>) => {
    if (!tenantId || !profile) return;
    setSubmitting(true);
    try {
      await marketplaceStorage.addProduct(tenantId, {
        ...data,
        sellerId: profile.uid,
        sellerName: profile.displayName || profile.email.split('@')[0]
      });
      dispatcher.emit('AUDIT_LOG', `Product Added: ${data.title}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBuy = async (product: MarketplaceProduct) => {
    if (!tenantId || !profile) return;
    setSubmitting(true);
    try {
      await marketplaceStorage.createOrder(tenantId, {
        productId: product.id,
        productTitle: product.title,
        amount: product.price,
        sellerId: product.sellerId,
        buyerId: profile.uid,
        buyerName: profile.displayName || profile.email.split('@')[0]
      });
      dispatcher.emit('AUDIT_LOG', `Purchase Order: ${product.title} by ${profile.displayName}`);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    products,
    loading,
    submitting,
    handleAddProduct,
    handleBuy
  };
}
