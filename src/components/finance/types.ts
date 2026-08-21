export interface FinanceRecord {
  id: number;
  type: 'income' | 'expense';
  amount: string;
  description: string;
  category: string;
  date: string;
  authorEmail: string;
}

export interface PendingApproval {
  id: string;
  description: string;
  amount: number;
  type: 'debit';
  date: string;
  createdBy: string;
  createdByUid: string;
  approvals: string[];
  approverNames: string[];
  status: 'pending' | 'approved';
  tenantId: string;
}

export interface Citizen {
  uid: string;
  displayName: string;
  email: string;
  role: string;
  duesStatus?: 'paid' | 'unpaid';
  duesAmount?: number;
  phoneNumber?: string;
}

export interface ReconcileLog {
  id?: string;
  date: string;
  systemBalance: number;
  physicalCash: number;
  difference: number;
  notes: string;
  reconciledBy: string;
}
