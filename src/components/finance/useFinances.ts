import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { FinanceRecord, PendingApproval, Citizen, ReconcileLog } from './types';

export function useFinances() {
  const { profile } = useAuth();
  const { showToast } = useToast();

  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [reconcileHistory, setReconcileHistory] = useState<ReconcileLog[]>([]);
  const [loading, setLoading] = useState(true);

  const tenantId = profile?.tenantId;

  const fetchRecords = async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const res = await fetch('/api/finances', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } catch (err) {
      console.error("Fetch finances error:", err);
      showToast("Gagal memuat kas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [tenantId]);

  useEffect(() => {
    if (!tenantId) return;
    const qApprovals = query(
      collection(db, 'pending_approvals'),
      where('tenantId', '==', tenantId)
    );
    const unsubApp = onSnapshot(qApprovals, (snap) => {
      setPendingApprovals(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PendingApproval)));
    }, (err) => console.warn("Approvals snapshot error:", err));

    const qUsers = query(
      collection(db, 'users'),
      where('tenantId', '==', tenantId)
    );
    const unsubUsers = onSnapshot(qUsers, (snap) => {
      setCitizens(snap.docs.map(doc => doc.data() as Citizen));
    }, (err) => console.warn("Users snapshot error:", err));

    const qReconcile = query(
      collection(db, 'cash_reconciliations'),
      where('tenantId', '==', tenantId)
    );
    const unsubRec = onSnapshot(qReconcile, (snap) => {
      setReconcileHistory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReconcileLog)));
    }, (err) => console.warn("Reconciliation snapshot error:", err));

    return () => {
      unsubApp();
      unsubUsers();
      unsubRec();
    };
  }, [tenantId]);

  return {
    records,
    pendingApprovals,
    citizens,
    reconcileHistory,
    loading,
    refetch: fetchRecords
  };
}
