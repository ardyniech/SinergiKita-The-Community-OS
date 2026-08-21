import {
  collection, query, where, onSnapshot, orderBy,
  addDoc, updateDoc, doc, serverTimestamp, increment
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../../shared/utils/firebase';
import { InventoryItem, InventoryLoan } from '../../../shared/models';

export const inventoryStorage = {
  subscribeToItems(tenantId: string, callback: (items: InventoryItem[]) => void) {
    const q = query(
      collection(db, 'inventory_items'),
      where('tenantId', '==', tenantId),
      orderBy('name', 'asc')
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as InventoryItem)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'inventory_items');
    });
  },

  subscribeToLoans(tenantId: string, callback: (loans: InventoryLoan[]) => void) {
    const q = query(
      collection(db, 'inventory_loans'),
      where('tenantId', '==', tenantId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as InventoryLoan)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'inventory_loans');
    });
  },

  async createItem(tenantId: string, data: Partial<InventoryItem>) {
    try {
      await addDoc(collection(db, 'inventory_items'), {
        ...data,
        tenantId,
        availableQuantity: data.totalQuantity || 1,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'inventory_items');
    }
  },

  async requestLoan(tenantId: string, data: Partial<InventoryLoan>) {
    try {
      const loanRef = await addDoc(collection(db, 'inventory_loans'), {
        ...data,
        tenantId,
        status: 'requested',
        createdAt: serverTimestamp()
      });
      return loanRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'inventory_loans');
      return null;
    }
  },

  async updateLoanStatus(loanId: string, itemId: string, newStatus: InventoryLoan['status'], quantity: number) {
    try {
      const loanRef = doc(db, 'inventory_loans', loanId);
      const itemRef = doc(db, 'inventory_items', itemId);

      await updateDoc(loanRef, {
        status: newStatus,
        ...(newStatus === 'returned' ? { returnedAt: serverTimestamp() } : {})
      });

      if (newStatus === 'approved' || newStatus === 'in_use') {
        await updateDoc(itemRef, { availableQuantity: increment(-quantity) });
      } else if (newStatus === 'returned') {
        await updateDoc(itemRef, { availableQuantity: increment(quantity) });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'inventory_loans');
    }
  }
};
