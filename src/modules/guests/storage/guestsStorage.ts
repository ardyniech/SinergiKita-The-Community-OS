import { 
  collection, doc, addDoc, updateDoc, 
  query, where, orderBy, onSnapshot, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../../shared/utils/firebase';
import { GuestReport, GuestStatus } from '../../../shared/models/guests';

export function subscribeGuests(
  tenantId: string, 
  onSuccess: (reports: GuestReport[]) => void, 
  onError: (err: Error) => void
) {
  try {
    const q = query(
      collection(db, 'guest_reports'),
      where('tenantId', '==', tenantId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as GuestReport));
      onSuccess(list);
    }, (err) => {
      console.error('[Module:Guests] Error in subscribeGuests:', err);
      onError(err);
    });
  } catch (err: any) {
    console.error('[Module:Guests] Error init:', err);
    onError(err);
    return () => {};
  }
}

export async function submitGuestReport(data: Omit<GuestReport, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'guest_reports'), {
    ...data,
    status: 'reported',
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

export async function updateGuestStatus(id: string, status: GuestStatus, notes?: string): Promise<void> {
  const ref = doc(db, 'guest_reports', id);
  await updateDoc(ref, {
    status,
    ...(notes ? { notes } : {})
  });
}
