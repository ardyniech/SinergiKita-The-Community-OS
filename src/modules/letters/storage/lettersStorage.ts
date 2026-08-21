import { 
  collection, doc, addDoc, updateDoc, 
  query, where, orderBy, onSnapshot, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../../shared/utils/firebase';
import { LetterRequest, LetterRequestStatus } from '../../../shared/models/letters';

export function subscribeLetters(
  tenantId: string, 
  onSuccess: (letters: LetterRequest[]) => void, 
  onError: (err: Error) => void
) {
  try {
    const q = query(
      collection(db, 'letter_requests'),
      where('tenantId', '==', tenantId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as LetterRequest));
      onSuccess(list);
    }, (err) => {
      console.error('[Module:Letters] Error in subscribeLetters:', err);
      onError(err);
    });
  } catch (err: any) {
    console.error('[Module:Letters] Error in subscribeLetters init:', err);
    onError(err);
    return () => {};
  }
}

export async function submitLetterRequest(data: Omit<LetterRequest, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'letter_requests'), {
    ...data,
    status: 'submitted',
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

export async function updateLetterStatus(
  id: string, 
  status: LetterRequestStatus, 
  extra?: { letterNumber?: string; notes?: string; signerName?: string; signerRole?: string }
): Promise<void> {
  const ref = doc(db, 'letter_requests', id);
  await updateDoc(ref, {
    status,
    ...(status === 'approved' ? { issuedAt: serverTimestamp() } : {}),
    ...(extra || {})
  });
}
