export interface Transaction {
  id: string;
  amount: number;
  type: 'debit' | 'credit';
  description: string;
  category?: string;
  date: string;
  status?: 'pending' | 'completed' | 'failed';
  tenantId?: string;
  recordedBy?: string;
  recordedByName?: string;
  createdAt?: any;
}

export interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  frequency: 'monthly' | 'weekly';
  nextBillingDate: string;
  status: 'active' | 'paused';
}

export interface KoperasiRecord {
  id: string;
  tenantId: string;
  uid: string;
  userName: string;
  type: 'deposit' | 'loan' | 'repayment';
  amount: number;
  note?: string;
  status: 'pending' | 'completed' | 'rejected';
  timestamp: any;
}

export interface KoperasiLoan {
  id: string;
  tenantId: string;
  uid: string;
  borrowerName: string;
  amount: number;
  tenorMonths: number;
  purpose: string;
  guarantorName?: string;
  monthlyInstallment: number;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed';
  approvedBy?: string;
  createdAt: any;
  paidAmount?: number;
}

export interface DuesBilling {
  id: string;
  tenantId: string;
  title: string;
  amount: number;
  period: string; // e.g. "Agustus 2026"
  dueDate: string; // YYYY-MM-DD
  description?: string;
  createdBy: string;
  creatorName?: string;
  createdAt: any;
  status: 'active' | 'closed';
}

export interface DuesPayment {
  id: string;
  duesId: string;
  duesTitle?: string;
  tenantId: string;
  userId: string;
  userName: string;
  amount: number;
  paymentMethod: 'qris' | 'transfer' | 'cash';
  notes?: string;
  proofUrl?: string;
  status: 'pending' | 'verified' | 'rejected';
  paidAt: any;
  verifiedBy?: string;
  verifiedAt?: any;
}
