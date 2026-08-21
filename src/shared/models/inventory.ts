export type InventoryCondition = 'good' | 'fair' | 'needs_repair';
export type LoanStatus = 'requested' | 'approved' | 'in_use' | 'returned' | 'rejected';

export interface InventoryItem {
  id: string;
  tenantId: string;
  name: string;
  category: 'tenda_kursi' | 'sound_elektronik' | 'alat_kebersihan' | 'perkakas' | 'lainnya';
  totalQuantity: number;
  availableQuantity: number;
  condition: InventoryCondition;
  picName: string;
  picPhone: string;
  location: string;
  notes?: string;
  createdAt?: any;
}

export interface InventoryLoan {
  id: string;
  tenantId: string;
  itemId: string;
  itemName: string;
  borrowerId: string;
  borrowerName: string;
  borrowerPhone: string;
  borrowerHouseNo: string;
  quantity: number;
  purpose: string;
  startDate: string;
  endDate: string;
  status: LoanStatus;
  adminNotes?: string;
  createdAt?: any;
  returnedAt?: any;
}
