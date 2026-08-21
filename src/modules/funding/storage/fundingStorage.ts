import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  addDoc, 
  serverTimestamp,
  updateDoc,
  doc,
  increment
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../../shared/utils/firebase';
import { FundingProject, Contribution } from '../../../shared/models';

export const fundingStorage = {
  subscribeToProjects(tenantId: string, callback: (projects: FundingProject[]) => void) {
    const q = query(
      collection(db, 'funding_projects'),
      where('tenantId', '==', tenantId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as FundingProject)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'funding_projects');
    });
  },

  subscribeToUserContributions(tenantId: string, userId: string, callback: (contribs: Contribution[]) => void) {
    const q = query(
      collection(db, 'funding_contributions'),
      where('tenantId', '==', tenantId),
      where('contributorId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Contribution)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'funding_contributions');
    });
  },

  async createProject(tenantId: string, data: Partial<FundingProject>) {
    try {
      await addDoc(collection(db, 'funding_projects'), {
        ...data,
        tenantId,
        collectedAmount: 0,
        status: 'active',
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'funding_projects');
    }
  },

  async addContribution(tenantId: string, data: Partial<Contribution>) {
    try {
      const contribRef = await addDoc(collection(db, 'funding_contributions'), {
        ...data,
        tenantId,
        status: 'verified',
        timestamp: serverTimestamp()
      });

      const projectRef = doc(db, 'funding_projects', data.projectId!);
      await updateDoc(projectRef, {
        collectedAmount: increment(data.amount!)
      });

      return contribRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'funding_contributions');
      return null;
    }
  }
};
