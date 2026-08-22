import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../shared/utils/firebase';

export function subscribeActiveLocationsCount(
  tenantId: string,
  onUpdate: (count: number) => void
) {
  const q = query(
    collection(db, 'active_locations'),
    where('tenantId', '==', tenantId)
  );
  return onSnapshot(q, (snap) => onUpdate(snap.size), () => onUpdate(0));
}

export function subscribeActiveEmergenciesCount(
  tenantId: string,
  onUpdate: (count: number) => void
) {
  const q = query(
    collection(db, 'emergencies'),
    where('tenantId', '==', tenantId),
    where('status', '==', 'active')
  );
  return onSnapshot(q, (snap) => onUpdate(snap.size), () => onUpdate(0));
}
