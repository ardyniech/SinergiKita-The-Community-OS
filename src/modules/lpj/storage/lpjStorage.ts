import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../shared/utils/firebase';
import { LPJSummary } from '../../../shared/models/lpj';

export async function fetchLPJSummary(
  tenantId: string, 
  tenantName: string,
  month: number, 
  year: number
): Promise<LPJSummary> {
  try {
    let totalIncome = 0;
    let totalExpense = 0;
    let duesCount = 0;
    let lettersCount = 0;
    let patrolCount = 0;
    let eventsCount = 0;
    let guestsCount = 0;

    // 1. Finance records
    const finQ = query(
      collection(db, 'finance_records'),
      where('tenantId', '==', tenantId)
    );
    const finSnap = await getDocs(finQ);
    finSnap.forEach(d => {
      const data = d.data();
      const amt = Number(data.amount) || 0;
      if (data.type === 'income') totalIncome += amt;
      else if (data.type === 'expense') totalExpense += amt;
    });

    // 2. Dues
    const duesQ = query(
      collection(db, 'dues_payments'),
      where('tenantId', '==', tenantId)
    );
    const duesSnap = await getDocs(duesQ);
    duesCount = duesSnap.size;

    // 3. Letters
    const lettersQ = query(
      collection(db, 'letter_requests'),
      where('tenantId', '==', tenantId)
    );
    const lettersSnap = await getDocs(lettersQ);
    lettersCount = lettersSnap.size;

    // 4. Patrol
    const patrolQ = query(
      collection(db, 'patrol_shifts'),
      where('tenantId', '==', tenantId)
    );
    const patrolSnap = await getDocs(patrolQ);
    patrolCount = patrolSnap.size;

    // 5. Events
    const eventsQ = query(
      collection(db, 'community_events'),
      where('tenantId', '==', tenantId)
    );
    const eventsSnap = await getDocs(eventsQ);
    eventsCount = eventsSnap.size;

    // 6. Guests
    const guestsQ = query(
      collection(db, 'guest_reports'),
      where('tenantId', '==', tenantId)
    );
    const guestsSnap = await getDocs(guestsQ);
    guestsCount = guestsSnap.size;

    return {
      month,
      year,
      tenantName,
      totalIncome,
      totalExpense,
      finalBalance: totalIncome - totalExpense,
      duesCount,
      lettersCount,
      patrolCount,
      eventsCount,
      guestsCount,
      createdAt: new Date().toISOString()
    };
  } catch (err) {
    console.error('[Module:LPJ] Error in fetchLPJSummary:', err);
    return {
      month,
      year,
      tenantName,
      totalIncome: 0,
      totalExpense: 0,
      finalBalance: 0,
      duesCount: 0,
      lettersCount: 0,
      patrolCount: 0,
      eventsCount: 0,
      guestsCount: 0,
      createdAt: new Date().toISOString()
    };
  }
}
