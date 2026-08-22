import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../shared/utils/firebase';

export interface ActiveDriver {
  uid: string;
  userName: string;
  lat: number;
  lng: number;
  updatedAt: number | null;
}

export function subscribeActiveLocations(
  tenantId: string,
  onUpdate: (drivers: ActiveDriver[]) => void
) {
  const q = query(
    collection(db, 'active_locations'),
    where('tenantId', '==', tenantId)
  );
  return onSnapshot(
    q,
    (snap) => {
      const list: ActiveDriver[] = [];
      snap.forEach((d) => {
        const data = d.data() as { uid?: string; userName?: string; lat?: number; lng?: number; updatedAt?: { toMillis: () => number } };
        list.push({
          uid: data.uid || d.id,
          userName: data.userName || 'Warga',
          lat: data.lat || 0,
          lng: data.lng || 0,
          updatedAt: data.updatedAt ? data.updatedAt.toMillis() : null,
        });
      });
      onUpdate(list);
    },
    () => onUpdate([])
  );
}

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
