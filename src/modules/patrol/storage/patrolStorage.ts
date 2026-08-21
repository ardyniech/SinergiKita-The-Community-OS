import { 
  collection, doc, addDoc, updateDoc, setDoc, 
  query, where, onSnapshot, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../../shared/utils/firebase';
import { PatrolSchedule, PatrolCheckin, PatrolDay } from '../../../shared/models/patrol';

export function subscribePatrolSchedules(
  tenantId: string,
  onSuccess: (schedules: PatrolSchedule[]) => void,
  onError: (err: Error) => void
) {
  try {
    const q = query(
      collection(db, 'patrol_schedules'),
      where('tenantId', '==', tenantId)
    );
    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PatrolSchedule));
      onSuccess(list);
    }, (err) => {
      console.error('[Module:Patrol] Error in subscribePatrolSchedules:', err);
      onError(err);
    });
  } catch (err: any) {
    console.error('[Module:Patrol] Error init:', err);
    onError(err);
    return () => {};
  }
}

export function subscribePatrolCheckins(
  tenantId: string,
  date: string,
  onSuccess: (checkins: PatrolCheckin[]) => void,
  onError: (err: Error) => void
) {
  try {
    const q = query(
      collection(db, 'patrol_checkins'),
      where('tenantId', '==', tenantId),
      where('date', '==', date)
    );
    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PatrolCheckin));
      onSuccess(list);
    }, (err) => {
      console.error('[Module:Patrol] Error in subscribePatrolCheckins:', err);
      onError(err);
    });
  } catch (err: any) {
    console.error('[Module:Patrol] Error checkins init:', err);
    onError(err);
    return () => {};
  }
}

export async function saveSchedule(
  tenantId: string, 
  day: PatrolDay, 
  data: Omit<PatrolSchedule, 'id' | 'tenantId' | 'day'>
): Promise<void> {
  const scheduleId = `${tenantId}_${day}`;
  const ref = doc(db, 'patrol_schedules', scheduleId);
  await setDoc(ref, {
    ...data,
    tenantId,
    day
  }, { merge: true });
}

export async function submitCheckin(data: Omit<PatrolCheckin, 'id' | 'checkinTime'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'patrol_checkins'), {
    ...data,
    checkinTime: serverTimestamp()
  });
  return docRef.id;
}
