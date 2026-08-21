import { 
  collection, doc, addDoc, updateDoc, arrayUnion, arrayRemove,
  query, where, orderBy, onSnapshot, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../../shared/utils/firebase';
import { CommunityEvent } from '../../../shared/models/events';

export function subscribeEvents(
  tenantId: string, 
  onSuccess: (events: CommunityEvent[]) => void, 
  onError: (err: Error) => void
) {
  try {
    const q = query(
      collection(db, 'community_events'),
      where('tenantId', '==', tenantId),
      orderBy('date', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CommunityEvent));
      onSuccess(list);
    }, (err) => {
      console.error('[Module:Events] Error in subscribeEvents:', err);
      onError(err);
    });
  } catch (err: any) {
    console.error('[Module:Events] Error init:', err);
    onError(err);
    return () => {};
  }
}

export async function createEvent(data: Omit<CommunityEvent, 'id' | 'createdAt' | 'rsvpCount' | 'attendees'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'community_events'), {
    ...data,
    rsvpCount: 0,
    attendees: [],
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

export async function toggleRSVP(eventId: string, userId: string, isAttending: boolean): Promise<void> {
  const ref = doc(db, 'community_events', eventId);
  await updateDoc(ref, {
    attendees: isAttending ? arrayRemove(userId) : arrayUnion(userId)
  });
}
