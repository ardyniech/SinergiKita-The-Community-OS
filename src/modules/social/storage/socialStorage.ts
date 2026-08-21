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
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../../shared/utils/firebase';
import { SocialPost } from '../../../shared/models';

export const socialStorage = {
  subscribeToFeed(tenantId: string, callback: (posts: SocialPost[]) => void) {
    const q = query(
      collection(db, 'social_posts'),
      where('tenantId', '==', tenantId),
      orderBy('timestamp', 'desc')
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as SocialPost)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'social_posts');
    });
  },

  async createPost(tenantId: string, data: Partial<SocialPost>) {
    try {
      await addDoc(collection(db, 'social_posts'), {
        ...data,
        tenantId,
        likes: [],
        commentCount: 0,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'social_posts');
    }
  },

  async toggleLike(postId: string, userId: string, hasLiked: boolean) {
    try {
      const postRef = doc(db, 'social_posts', postId);
      await updateDoc(postRef, {
        likes: hasLiked ? arrayRemove(userId) : arrayUnion(userId)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'social_posts');
    }
  }
};
