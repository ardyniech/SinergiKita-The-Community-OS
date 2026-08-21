import { 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  collection, 
  where, 
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from '../../../shared/utils/firebase';
import { AppUser, Tenant } from '../../../shared/models';

export const authStorage = {
  onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  subscribeToProfile(uid: string, callback: (profile: AppUser | null) => void) {
    return onSnapshot(doc(db, 'users', uid), (snap) => {
      if (snap.exists()) {
        callback({ id: snap.id, ...snap.data() } as AppUser);
      } else {
        callback(null);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
    });
  },

  subscribeToTenant(tenantId: string, callback: (tenant: Tenant | null) => void) {
    return onSnapshot(doc(db, 'tenants', tenantId), (snap) => {
      if (snap.exists()) {
        callback({ id: snap.id, ...snap.data() } as Tenant);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error("Tenant fetch error:", error);
    });
  },

  async createProfile(uid: string, profile: AppUser) {
    try {
      await setDoc(doc(db, 'users', uid), profile);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${uid}`);
    }
  }
};
