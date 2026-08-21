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
import { MarketplaceProduct, MarketplaceOrder } from '../../../shared/models';

export const marketplaceStorage = {
  subscribeToProducts(tenantId: string, callback: (products: MarketplaceProduct[]) => void) {
    const q = query(
      collection(db, 'marketplace_products'),
      where('tenantId', '==', tenantId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as MarketplaceProduct)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'marketplace_products');
    });
  },

  async addProduct(tenantId: string, data: Partial<MarketplaceProduct>) {
    try {
      await addDoc(collection(db, 'marketplace_products'), {
        ...data,
        tenantId,
        status: 'available',
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'marketplace_products');
    }
  },

  async createOrder(tenantId: string, data: Partial<MarketplaceOrder>) {
    try {
      await addDoc(collection(db, 'marketplace_orders'), {
        ...data,
        tenantId,
        status: 'pending',
        timestamp: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'marketplace_orders');
    }
  }
};
