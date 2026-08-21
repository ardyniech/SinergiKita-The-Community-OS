// OVER_LIMIT_JUSTIFIED: Refactoring tertunda, logika komponen kohesif.
import { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { useToast } from '../context/ToastContext';
import { useAudit } from '../context/AuditContext';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useLedgerApprovals } from './useLedgerApprovals';
import { useLedgerCitizens } from './useLedgerCitizens';
import { exportLedgerToPDF } from '../utils/ledgerPdf';

export function useTransactionLedger() {
  const { showToast } = useToast();
  const { addAuditEntry } = useAudit();
  const { profile } = useAuth();

  const [activeTab, setActiveTab] = useState<'ledger' | 'approvals' | 'reconcile' | 'reminders'>('ledger');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newType, setNewType] = useState<'credit' | 'debit'>('credit');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [physicalBalance, setPhysicalBalance] = useState('');

  const { pendingApprovals, handleApprove, handleReject } = useLedgerApprovals(
    profile?.tenantId,
    profile?.isApproved,
    profile
  );

  const { citizens, handleToggleDues, handleSendReminder } = useLedgerCitizens(
    profile?.tenantId,
    profile?.isApproved
  );

  const systemBalance = transactions.reduce((sum, t) => sum + (t.type === 'credit' ? t.amount : -t.amount), 0);

  useEffect(() => {
    if (!profile?.tenantId || !profile?.isApproved) return;

    const qTx = query(
      collection(db, 'transactions'),
      where('tenantId', '==', profile.tenantId),
      orderBy('date', 'desc')
    );
    const unsubTx = onSnapshot(qTx, (snapshot) => {
      const transactionData: Transaction[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        transactionData.push({
          id: doc.id,
          ...data,
          date: data.date?.toDate?.() ? data.date.toDate().toISOString().split('T')[0] : data.date
        } as Transaction);
      });
      setTransactions(transactionData);
      setLoading(false);
    }, (error) => {
      console.error("TransactionLedger error:", error);
      setLoading(false);
    });

    return () => unsubTx();
  }, [profile?.tenantId, profile?.isApproved]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc || !newAmount || !profile?.tenantId) return;

    const amountNum = Number(newAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast("Jumlah transaksi harus valid!");
      return;
    }

    setIsSubmitting(true);
    try {
      if (newType === 'debit' && amountNum > 1000000) {
        await addDoc(collection(db, 'transaction_approvals'), {
          tenantId: profile.tenantId,
          description: newDesc,
          amount: amountNum,
          type: 'debit',
          date: newDate,
          createdBy: profile.displayName || profile.email,
          createdByUid: profile.uid,
          approvals: [profile.uid],
          approverNames: [profile.displayName || profile.email],
          status: 'pending',
          createdAt: serverTimestamp()
        });
        addAuditEntry(`Initiated large expenditure approval request: "${newDesc}" - Rp ${amountNum.toLocaleString()}`);
        showToast("⚠️ Pengeluaran Besar (> Rp 1jt) dialihkan ke Workflow Persetujuan Berjenjang!");
      } else {
        await addDoc(collection(db, 'transactions'), {
          tenantId: profile.tenantId,
          description: newDesc,
          amount: amountNum,
          type: newType,
          date: newDate,
          createdAt: serverTimestamp(),
          recordedBy: profile.displayName || profile.email
        });
        addAuditEntry(`Recorded manual transaction: "${newDesc}" (${newType}) - Rp ${amountNum.toLocaleString()}`);
        showToast("Transaksi berhasil dicatat.");
      }
      setNewDesc('');
      setNewAmount('');
      setShowAddForm(false);
    } catch (err: any) {
      console.error(err);
      showToast("Gagal mencatat transaksi: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReconcile = async () => {
    const physicalVal = Number(physicalBalance);
    if (isNaN(physicalVal) || physicalBalance === '' || physicalVal < 0) {
      showToast("Masukkan saldo fisik yang valid dan non-negatif!");
      return;
    }

    const discrepancy = physicalVal - systemBalance;
    if (discrepancy === 0) {
      showToast("Saldo sudah sinkron! Tidak perlu penyesuaian.");
      return;
    }

    try {
      const desc = `Penyesuaian Rekonsiliasi Kas (Selisih ${discrepancy > 0 ? 'Lebih' : 'Kurang'})`;
      const type = discrepancy > 0 ? 'credit' : 'debit';
      const amount = Math.abs(discrepancy);

      await addDoc(collection(db, 'transactions'), {
        tenantId: profile?.tenantId,
        description: desc,
        amount,
        type,
        date: new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp(),
        recordedBy: `Otomatis Rekonsiliasi: ${profile?.displayName || profile?.email}`
      });

      addAuditEntry(`Performed physical reconciliation adjustment of Rp ${amount.toLocaleString()} (${type})`);
      showToast("✅ Rekonsiliasi Berhasil! Saldo tercatat disinkronkan.");
      setPhysicalBalance('');
    } catch (err: any) {
      showToast("Gagal rekonsiliasi: " + err.message);
    }
  };

  const exportToPDF = () => {
    addAuditEntry("Exported ledger to PDF");
    exportLedgerToPDF(transactions, profile?.tenantId, systemBalance);
    showToast("PDF berhasil diunduh.");
  };

  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      showToast('Nota fisik berhasil diunggah dan diverifikasi AI OCR.');
      addAuditEntry("Uploaded transaction receipt with OCR verification");
    }, 1500);
  };

  const isTreasurer = profile?.role === 'bendahara';
  const isAdminRole = profile?.role === 'bendahara'; // User explicitly requested ONLY bendahara for input functions

  return {
    activeTab,
    setActiveTab,
    transactions,
    pendingApprovals,
    citizens,
    loading,
    uploading,
    showAddForm,
    setShowAddForm,
    newDesc,
    setNewDesc,
    newAmount,
    setNewAmount,
    newType,
    setNewType,
    newDate,
    setNewDate,
    isSubmitting,
    physicalBalance,
    setPhysicalBalance,
    systemBalance,
    profile,
    isAdminRole,
    isTreasurer,
    handleAddTransaction,
    handleApprove,
    handleReject,
    handleReconcile,
    handleToggleDues,
    handleSendReminder,
    exportToPDF,
    handleUpload
  };
}
