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
  getDocs,
  limit,
  startAfter,
  increment,
  getDoc,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../../shared/utils/firebase';
import { SocialPost } from '../../../shared/models';

export const socialStorage = {
  async fetchFeed(tenantId: string, lastDoc: any = null, pageSize = 20) {
    try {
      let q = query(
        collection(db, 'social_posts'),
        where('tenantId', '==', tenantId),
        orderBy('timestamp', 'desc'),
        limit(pageSize)
      );
      
      if (lastDoc) {
        q = query(
          collection(db, 'social_posts'),
          where('tenantId', '==', tenantId),
          orderBy('timestamp', 'desc'),
          startAfter(lastDoc),
          limit(pageSize)
        );
      }
      
      const snap = await getDocs(q);
      const posts = snap.docs.map(d => ({ id: d.id, ...d.data() } as SocialPost));
      return { posts, lastVisible: snap.docs[snap.docs.length - 1] };
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'social_posts');
      return { posts: [], lastVisible: null };
    }
  },

  async createPost(tenantId: string, data: Partial<SocialPost>) {
    try {
      await addDoc(collection(db, 'social_posts'), {
        ...data,
        tenantId,
        likeCount: 0,
        commentCount: 0,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'social_posts');
    }
  },

  async toggleLike(postId: string, userId: string) {
    try {
      const likeRef = doc(db, `social_posts/${postId}/likes`, userId);
      const likeSnap = await getDoc(likeRef);
      const postRef = doc(db, 'social_posts', postId);
      
      if (likeSnap.exists()) {
        // Unlike
        await deleteDoc(likeRef);
        await updateDoc(postRef, { likeCount: increment(-1) });
        return false;
      } else {
        // Like
        await setDoc(likeRef, { createdAt: serverTimestamp() });
        await updateDoc(postRef, { likeCount: increment(1) });
        return true;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'social_posts');
      throw error;
    }
  },

  async checkUserLiked(postId: string, userId: string) {
    try {
      const likeSnap = await getDoc(doc(db, `social_posts/${postId}/likes`, userId));
      return likeSnap.exists();
    } catch (error) {
      return false;
    }
  }
};
