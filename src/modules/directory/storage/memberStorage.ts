import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  getDocs
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../../shared/utils/firebase';
import { AppUser } from '../../../shared/models';

export const memberStorage = {
  subscribeToMembers(tenantId: string, callback: (members: AppUser[]) => void) {
    const q = query(collection(db, 'users'), where('tenantId', '==', tenantId));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as AppUser)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });
  },

  async updateMember(memberId: string, data: Partial<AppUser>) {
    try {
      const memberRef = doc(db, 'users', memberId);
      await updateDoc(memberRef, data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${memberId}`);
    }
  },

  async deleteMember(memberId: string) {
    try {
      await deleteDoc(doc(db, 'users', memberId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${memberId}`);
    }
  }
};
