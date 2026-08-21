import { useState, useEffect } from 'react';
import { POSTransaction, CartItem, POSProduct, AppUser } from '../../../shared/models';
import { posStorage } from '../storage/posStorage';
import { dispatcher } from '../../../core/dispatcher';

export function usePOS(tenantId: string | null, profile: AppUser | null) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [transactions, setTransactions] = useState<POSTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!tenantId) return;
    return posStorage.subscribeToTransactions(tenantId, (data) => {
      setTransactions(data);
      setLoading(false);
    });
  }, [tenantId]);

  const addToCart = (product: POSProduct) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async (paymentMethod: 'cash' | 'qris' | 'transfer') => {
    if (!tenantId || !profile || cart.length === 0) return;
    setProcessing(true);
    try {
      const success = await posStorage.recordTransaction(tenantId, {
        cashierId: profile.uid,
        cashierName: profile.displayName || profile.email.split('@')[0],
        items: cart,
        totalAmount,
        paymentMethod
      });
      if (success) {
        setCart([]);
        dispatcher.emit('AUDIT_LOG', `Sale Completed: Rp ${totalAmount.toLocaleString()} via ${paymentMethod.toUpperCase()}`);
      }
    } finally {
      setProcessing(false);
    }
  };

  return {
    cart,
    transactions,
    loading,
    processing,
    addToCart,
    removeFromCart,
    updateQuantity,
    totalAmount,
    handleCheckout
  };
}
