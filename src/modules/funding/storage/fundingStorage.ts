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
      // 1. Add contribution record
      const contribRef = await addDoc(collection(db, 'funding_contributions'), {
        ...data,
        tenantId,
        status: 'verified', // Auto-verified for this prototype
        timestamp: serverTimestamp()
      });

      // 2. Increment project collectedAmount
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
