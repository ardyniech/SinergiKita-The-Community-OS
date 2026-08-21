export interface POSProduct {
  id: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  category?: string;
  image?: string;
}

export interface CartItem extends POSProduct {
  quantity: number;
}

export interface POSTransaction {
  id: string;
  tenantId: string;
  cashierId: string;
  cashierName: string;
  items: CartItem[];
  totalAmount: number;
  paymentMethod: 'cash' | 'qris' | 'transfer';
  status: 'completed' | 'cancelled';
  timestamp: any;
}
