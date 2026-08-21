import { 
  collection, doc, addDoc, deleteDoc,
  query, where, orderBy, onSnapshot, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../../shared/utils/firebase';
import { EmergencyContact } from '../../../shared/models/contacts';

export function subscribeContacts(
  tenantId: string, 
  onSuccess: (contacts: EmergencyContact[]) => void, 
  onError: (err: Error) => void
) {
  try {
    const q = query(
      collection(db, 'emergency_contacts'),
      where('tenantId', '==', tenantId),
      orderBy('category', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as EmergencyContact));
      onSuccess(list);
    }, (err) => {
      console.error('[Module:Contacts] Error in subscribeContacts:', err);
      onError(err);
    });
  } catch (err: any) {
    console.error('[Module:Contacts] Error init:', err);
    onError(err);
    return () => {};
  }
}

export async function addContact(data: Omit<EmergencyContact, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'emergency_contacts'), {
    ...data,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

export async function removeContact(id: string): Promise<void> {
  await deleteDoc(doc(db, 'emergency_contacts', id));
}
