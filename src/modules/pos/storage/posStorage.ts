import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  addDoc, 
  serverTimestamp,
  doc,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../../shared/utils/firebase';
import { POSTransaction, POSProduct } from '../../../shared/models';

export const posStorage = {
  subscribeToTransactions(tenantId: string, callback: (txs: POSTransaction[]) => void) {
    const q = query(
      collection(db, 'pos_transactions'),
      where('tenantId', '==', tenantId),
      orderBy('timestamp', 'desc')
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as POSTransaction)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'pos_transactions');
    });
  },

  async recordTransaction(tenantId: string, data: Partial<POSTransaction>) {
    try {
      // 1. Record the sale
      const txRef = await addDoc(collection(db, 'pos_transactions'), {
        ...data,
        tenantId,
        status: 'completed',
        timestamp: serverTimestamp()
      });

      // 2. Update stock for each item (Simplified: in a real app use batch/transaction)
      for (const item of (data.items || [])) {
        const pRef = doc(db, 'pos_products', item.id);
        await updateDoc(pRef, {
          stock: increment(-item.quantity)
        });
      }

      return txRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'pos_transactions');
      return null;
    }
  }
};
