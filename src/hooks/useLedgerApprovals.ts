import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useToast } from '../context/ToastContext';
import { useAudit } from '../context/AuditContext';

export interface PendingApproval {
  id: string;
  description: string;
  amount: number;
  type: 'debit';
  date: string;
  createdBy: string;
  createdByUid: string;
  approvals: string[];
  approverNames: string[];
  status: 'pending' | 'approved';
  tenantId: string;
}

export function useLedgerApprovals(tenantId?: string, isApproved?: boolean, userProfile?: any) {
  const { showToast } = useToast();
  const { addAuditEntry } = useAudit();
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);

  useEffect(() => {
    if (!tenantId || !isApproved) return;

    const qApp = query(
      collection(db, 'transaction_approvals'),
      where('tenantId', '==', tenantId),
      where('status', '==', 'pending')
    );
    const unsubApp = onSnapshot(qApp, (snapshot) => {
      const approvalData: PendingApproval[] = [];
      snapshot.forEach((doc) => {
        approvalData.push({ id: doc.id, ...doc.data() } as PendingApproval);
      });
      setPendingApprovals(approvalData);
    });

    return () => unsubApp();
  }, [tenantId, isApproved]);

  const handleApprove = async (approval: PendingApproval, simulateSecondUser: boolean = false) => {
    if (!tenantId || !userProfile?.uid) return;

    const isAlreadyApproved = approval.approvals.includes(userProfile.uid);
    if (isAlreadyApproved && !simulateSecondUser) {
      showToast("Anda sudah menyetujui transaksi ini. Menunggu approver lain!");
      return;
    }

    try {
      let updatedApprovals = [...approval.approvals];
      let updatedNames = [...approval.approverNames];

      if (simulateSecondUser) {
        updatedApprovals.push("simulated-approver-uid-123");
        updatedNames.push("Hendra Wijaya (Lurah Sektor B)");
      } else {
        updatedApprovals.push(userProfile.uid);
        updatedNames.push(userProfile.displayName || userProfile.email);
      }

      if (updatedApprovals.length >= 2) {
        const safeAmount = Number(approval.amount) || 0;
        await addDoc(collection(db, 'transactions'), {
          tenantId,
          description: `[DISETUJUI] ${approval.description}`,
          amount: safeAmount,
          type: 'debit',
          date: approval.date,
          createdAt: serverTimestamp(),
          recordedBy: `Disetujui oleh: ${updatedNames.join(" & ")}`
        });
        await deleteDoc(doc(db, 'transaction_approvals', approval.id));
        addAuditEntry(`Approved & Committed expense: "${approval.description}" - Rp ${safeAmount.toLocaleString()} by ${updatedNames.join(" & ")}`);
        showToast("✅ Transaksi Disetujui Penuh & Masuk Buku Kas!");
      } else {
        await updateDoc(doc(db, 'transaction_approvals', approval.id), {
          approvals: updatedApprovals,
          approverNames: updatedNames
        });
        addAuditEntry(`Approved expense (1/2 signatures): "${approval.description}" - Rp ${approval.amount.toLocaleString()}`);
        showToast("Persetujuan tercatat (1 dari 2 approver)");
      }
    } catch (err: any) {
      console.error(err);
      showToast("Gagal menyetujui: " + err.message);
    }
  };

  const handleReject = async (id: string, title: string) => {
    try {
      await deleteDoc(doc(db, 'transaction_approvals', id));
      addAuditEntry(`Rejected expense proposal: "${title}"`);
      showToast("Proposal pengeluaran ditolak.");
    } catch (err: any) {
      showToast("Gagal menolak: " + err.message);
    }
  };

  return { pendingApprovals, handleApprove, handleReject };
}
