import { collection, query, where, orderBy, limit as limitQuery, getDocs, addDoc, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../shared/utils/firebase';
import { WatchRequest } from '../../../shared/models/watchRequests';

export async function createWatchRequest(
  tenantId: string,
  requesterId: string,
  requesterName: string,
  destinationNote?: string,
  lat?: number,
  lng?: number
): Promise<WatchRequest | null> {
  try {
    const docData = {
      tenantId,
      requesterId,
      requesterName,
      destinationNote: destinationNote || '',
      lat: lat || 0,
      lng: lng || 0,
      status: 'pending' as const,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const ref = await addDoc(collection(db, 'watch_requests'), docData);
    return { id: ref.id, ...docData };
  } catch (err) {
    console.error('[Module:Watch] Error creating watch request:', err);
    return null;
  }
}

export async function confirmWatchRequest(
  requestId: string,
  watcherId: string,
  watcherName: string
): Promise<boolean> {
  try {
    await updateDoc(doc(db, 'watch_requests', requestId), {
      status: 'watching',
      watcherId,
      watcherName,
      updatedAt: Date.now()
    });
    return true;
  } catch (err) {
    console.error('[Module:Watch] Error confirming watch request:', err);
    return false;
  }
}

export async function completeWatchRequest(requestId: string): Promise<boolean> {
  try {
    await updateDoc(doc(db, 'watch_requests', requestId), {
      status: 'done',
      updatedAt: Date.now()
    });
    return true;
  } catch (err) {
    console.error('[Module:Watch] Error completing watch request:', err);
    return false;
  }
}

export function subscribeActiveWatchRequests(
  tenantId: string,
  onUpdate: (requests: WatchRequest[]) => void
) {
  const q = query(
    collection(db, 'watch_requests'),
    where('tenantId', '==', tenantId),
    where('status', 'in', ['pending', 'watching']),
    orderBy('createdAt', 'desc'),
    limitQuery(20)
  );

  return onSnapshot(q, (snap) => {
    const list: WatchRequest[] = [];
    snap.forEach((d) => {
      const data = d.data();
      list.push({
        id: d.id,
        tenantId: data.tenantId,
        requesterId: data.requesterId,
        requesterName: data.requesterName,
        destinationNote: data.destinationNote,
        lat: data.lat,
        lng: data.lng,
        status: data.status,
        watcherId: data.watcherId,
        watcherName: data.watcherName,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      });
    });
    onUpdate(list);
  }, (err) => {
    console.error('[Module:Watch] Error listening to watch requests:', err);
  });
}
