export interface MarketplaceProduct {
  id: string;
  tenantId: string;
  sellerId: string;
  sellerName: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  stock: number;
  status: 'available' | 'sold_out' | 'archived';
  createdAt: any;
}

export interface MarketplaceOrder {
  id: string;
  tenantId: string;
  productId: string;
  productTitle: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  timestamp: any;
}
