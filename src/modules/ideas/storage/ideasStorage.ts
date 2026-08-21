import { collection, query, where, orderBy, limit as limitQuery, startAfter, getDocs, addDoc, updateDoc, doc, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '../../../shared/utils/firebase';
import { CommunityIdea } from '../../../shared/models/ideas';

export async function fetchCommunityIdeas(
  tenantId: string,
  pageSize = 20,
  lastDocSnap?: QueryDocumentSnapshot<DocumentData>
): Promise<{ ideas: CommunityIdea[]; lastSnap?: QueryDocumentSnapshot<DocumentData> }> {
  try {
    let q = query(
      collection(db, 'community_ideas'),
      where('tenantId', '==', tenantId),
      orderBy('createdAt', 'desc'),
      limitQuery(pageSize)
    );

    if (lastDocSnap) {
      q = query(
        collection(db, 'community_ideas'),
        where('tenantId', '==', tenantId),
        orderBy('createdAt', 'desc'),
        startAfter(lastDocSnap),
        limitQuery(pageSize)
      );
    }

    const snap = await getDocs(q);
    const ideas: CommunityIdea[] = [];
    snap.forEach((d) => {
      const data = d.data();
      ideas.push({
        id: d.id,
        tenantId: data.tenantId,
        authorId: data.authorId,
        authorName: data.authorName,
        authorRole: data.authorRole || 'Anggota',
        title: data.title,
        description: data.description,
        category: data.category || 'Umum',
        status: data.status || 'didengar',
        rating: data.rating,
        reviewNote: data.reviewNote,
        reviewedBy: data.reviewedBy,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      });
    });

    const newLastSnap = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : undefined;
    return { ideas, lastSnap: newLastSnap };
  } catch (err) {
    console.error('[Module:Ideas] Error in fetchCommunityIdeas:', err);
    return { ideas: [] };
  }
}

export async function createCommunityIdea(
  tenantId: string,
  authorId: string,
  authorName: string,
  authorRole: string,
  title: string,
  description: string,
  category = 'Umum'
): Promise<CommunityIdea | null> {
  try {
    const docData = {
      tenantId,
      authorId,
      authorName,
      authorRole,
      title,
      description,
      category,
      status: 'didengar' as const,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const ref = await addDoc(collection(db, 'community_ideas'), docData);
    return { id: ref.id, ...docData };
  } catch (err) {
    console.error('[Module:Ideas] Error in createCommunityIdea:', err);
    return null;
  }
}

export async function reviewCommunityIdea(
  ideaId: string,
  status: 'didengar' | 'setuju' | 'follow-up' | 'pendalaman' | 'ditolak' | 'selesai',
  rating: number,
  reviewNote: string,
  reviewedBy: string
): Promise<boolean> {
  try {
    await updateDoc(doc(db, 'community_ideas', ideaId), {
      status,
      rating,
      reviewNote,
      reviewedBy,
      updatedAt: Date.now()
    });
    return true;
  } catch (err) {
    console.error('[Module:Ideas] Error in reviewCommunityIdea:', err);
    return false;
  }
}
