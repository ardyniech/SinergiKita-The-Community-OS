import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../shared/utils/firebase';
import { AppUser } from '../../../shared/models';

export function subscribePendingRiders(
  tenantId: string,
  onUpdate: (members: AppUser[]) => void
) {
  const q = query(
    collection(db, 'users'),
    where('tenantId', '==', tenantId)
  );

  return onSnapshot(q, (snap) => {
    const list: AppUser[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as AppUser);
    });
    onUpdate(list);
  }, (err) => {
    console.error('[Module:Verification] Error loading riders:', err);
  });
}

export async function verifyRiderStatus(
  tenantId: string,
  memberId: string,
  status: boolean,
  verifierName: string
): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', memberId);
    const update: Record<string, unknown> = {
      isVerifiedRider: status,
      verifiedAt: Date.now(),
      verifierName
    };
    // Only ever APPROVE (status=true). Never set isApproved=false here,
    // otherwise un-verifying a rider would lock them out of the tenant.
    if (status) update.isApproved = true;
    await updateDoc(userRef, update);
    return true;
  } catch (err) {
    console.error('[Module:Verification] Error verifying rider:', err);
    return false;
  }
}
