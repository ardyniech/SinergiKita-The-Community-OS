import { collection, query, where, orderBy, limit as limitQuery, addDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../shared/utils/firebase';

export interface BulletinPost {
  id: string;
  tenantId: string;
  title: string;
  content: string;
  category: 'bengkel' | 'rest_area' | 'spareparts' | 'umum';
  authorId: string;
  authorName: string;
  createdAt: number;
}

export async function createBulletinPost(
  tenantId: string,
  authorId: string,
  authorName: string,
  title: string,
  content: string,
  category: BulletinPost['category']
): Promise<BulletinPost | null> {
  try {
    const docData = {
      tenantId,
      authorId,
      authorName,
      title,
      content,
      category,
      createdAt: Date.now()
    };
    const ref = await addDoc(collection(db, 'bulletin_posts'), docData);
    return { id: ref.id, ...docData };
  } catch (err) {
    console.error('[Module:Bulletin] Error creating post:', err);
    return null;
  }
}

export function subscribeBulletinPosts(
  tenantId: string,
  onUpdate: (posts: BulletinPost[]) => void
) {
  const q = query(
    collection(db, 'bulletin_posts'),
    where('tenantId', '==', tenantId),
    orderBy('createdAt', 'desc'),
    limitQuery(30)
  );

  return onSnapshot(q, (snap) => {
    const list: BulletinPost[] = [];
    snap.forEach((d) => {
      const data = d.data();
      list.push({
        id: d.id,
        tenantId: data.tenantId,
        authorId: data.authorId,
        authorName: data.authorName,
        title: data.title,
        content: data.content,
        category: data.category,
        createdAt: data.createdAt
      });
    });
    onUpdate(list);
  }, (err) => {
    console.error('[Module:Bulletin] Error listening to posts:', err);
  });
}
