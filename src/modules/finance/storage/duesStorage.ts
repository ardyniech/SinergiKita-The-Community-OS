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
import { DuesBilling, DuesPayment } from '../../../shared/models';

export const duesStorage = {
  subscribeToDuesBillings(tenantId: string, callback: (billings: DuesBilling[]) => void) {
    const q = query(
      collection(db, 'dues_billings'),
      where('tenantId', '==', tenantId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as DuesBilling)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'dues_billings');
    });
  },

  async addDuesBilling(tenantId: string, data: Omit<DuesBilling, 'id' | 'createdAt'>) {
    try {
      return await addDoc(collection(db, 'dues_billings'), {
        ...data,
        tenantId,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'dues_billings');
    }
  },

  subscribeToDuesPayments(tenantId: string, callback: (payments: DuesPayment[]) => void) {
    const q = query(
      collection(db, 'dues_payments'),
      where('tenantId', '==', tenantId),
      orderBy('paidAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as DuesPayment)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'dues_payments');
    });
  },

  async submitDuesPayment(tenantId: string, data: Omit<DuesPayment, 'id' | 'paidAt' | 'status'>) {
    try {
      return await addDoc(collection(db, 'dues_payments'), {
        ...data,
        tenantId,
        status: 'pending',
        paidAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'dues_payments');
    }
  },

  async verifyPayment(paymentId: string, verifiedBy: string) {
    try {
      await updateDoc(doc(db, 'dues_payments', paymentId), {
        status: 'verified',
        verifiedBy,
        verifiedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `dues_payments/${paymentId}`);
    }
  },

  async updateTenantPaymentInfo(
    tenantId: string, 
    info: { qrisImageUrl?: string; bankName?: string; bankAccountNumber?: string; bankAccountHolder?: string }
  ) {
    try {
      await updateDoc(doc(db, 'tenants', tenantId), {
        ...info,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tenants/${tenantId}`);
    }
  }
};
