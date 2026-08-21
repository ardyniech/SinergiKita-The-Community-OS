import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  addDoc, 
  serverTimestamp,
  setDoc,
  doc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../../shared/utils/firebase';
import { Lesson, UserProgress } from '../../../shared/models';

export const learningStorage = {
  subscribeToLessons(tenantId: string, callback: (lessons: Lesson[]) => void) {
    const q = query(
      collection(db, 'learning_lessons'),
      where('tenantId', '==', tenantId),
      orderBy('order', 'asc')
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Lesson)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'learning_lessons');
    });
  },

  async markAsCompleted(userId: string, lessonId: string) {
    try {
      const progressRef = doc(db, 'user_learning_progress', `${userId}_${lessonId}`);
      await setDoc(progressRef, {
        userId,
        lessonId,
        completed: true,
        lastAccessed: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'learning_progress');
    }
  }
};
