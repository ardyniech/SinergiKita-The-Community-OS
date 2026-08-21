import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  addDoc, 
  serverTimestamp,
  updateDoc,
  doc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../../shared/utils/firebase';
import { KoperasiRecord, KoperasiLoan } from '../../../shared/models';

export const koperasiStorage = {
  subscribeToRecords(tenantId: string, callback: (records: KoperasiRecord[]) => void) {
    const q = query(
      collection(db, 'koperasi'),
      where('tenantId', '==', tenantId),
      orderBy('timestamp', 'desc')
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as KoperasiRecord)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'koperasi');
    });
  },

  subscribeToLoans(tenantId: string, callback: (loans: KoperasiLoan[]) => void) {
    const q = query(
      collection(db, 'koperasi_loans'),
      where('tenantId', '==', tenantId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as KoperasiLoan)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'koperasi_loans');
    });
  },

  async addDeposit(tenantId: string, data: Partial<KoperasiRecord>) {
    try {
      await addDoc(collection(db, 'koperasi'), {
        ...data,
        tenantId,
        type: 'deposit',
        status: 'completed',
        timestamp: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'koperasi');
    }
  },

  async addLoanApplication(tenantId: string, data: Partial<KoperasiLoan>) {
    try {
      await addDoc(collection(db, 'koperasi_loans'), {
        ...data,
        tenantId,
        status: 'pending',
        createdAt: serverTimestamp(),
        paidAmount: 0
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'koperasi_loans');
    }
  },

  async updateLoanStatus(loanId: string, status: string, approvedBy: string) {
    try {
      await updateDoc(doc(db, 'koperasi_loans', loanId), {
        status,
        approvedBy
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `koperasi_loans/${loanId}`);
    }
  }
};
