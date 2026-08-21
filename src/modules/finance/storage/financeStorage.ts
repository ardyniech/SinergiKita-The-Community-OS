import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  addDoc, 
  serverTimestamp,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../../shared/utils/firebase';
import { Transaction, RecurringTransaction } from '../../../shared/models';

export const financeStorage = {
  subscribeToTransactions(tenantId: string, callback: (txs: Transaction[]) => void) {
    const q = query(
      collection(db, 'transactions'),
      where('tenantId', '==', tenantId),
      orderBy('date', 'desc')
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ 
        id: d.id, 
        ...d.data(),
        date: d.data().date?.toDate?.() ? d.data().date.toDate().toISOString().split('T')[0] : d.data().date
      } as Transaction)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'transactions');
    });
  },

  async addTransaction(tenantId: string, data: Partial<Transaction>) {
    try {
      await addDoc(collection(db, 'transactions'), {
        ...data,
        tenantId,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'transactions');
    }
  },

  async updateRecurringStatus(id: string, status: string) {
    try {
      await updateDoc(doc(db, 'recurring_transactions', id), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `recurring_transactions/${id}`);
    }
  }
};
