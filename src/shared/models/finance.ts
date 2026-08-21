export interface Transaction {
  id: string;
  amount: number;
  type: 'debit' | 'credit';
  description: string;
  date: string;
  status?: 'pending' | 'completed' | 'failed';
  tenantId?: string;
  recordedBy?: string;
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
