import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface Transaction {
  amount: number;
  type: 'debit' | 'credit';
  category: string;
  description: string;
  createdBy: string;
  needsApproval: boolean;
}

export const financeService = {
  async createTransaction(data: Transaction) {
    // Dual-signature rule: > 1jt requires approval
    const requiresApproval = data.amount > 1000000;
    
    const transactionRef = await addDoc(collection(db, 'transactions'), {
      ...data,
      status: requiresApproval ? 'pending' : 'approved',
      createdAt: serverTimestamp(),
      approvalCount: 0,
      approvedBy: []
    });

    return { id: transactionRef.id, requiresApproval };
  },

  async approveTransaction(transactionId: string, approverId: string) {
    // Logic for incrementing approvalCount in Firestore
    console.log(`Transaction ${transactionId} approved by ${approverId}`);
  }
};