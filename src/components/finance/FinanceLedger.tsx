import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useFinances } from './useFinances';
import { FinanceTabHeader } from './FinanceTabHeader';
import { FinanceSummaryCard } from './FinanceSummaryCard';
import { FinanceLedgerTable } from './FinanceLedgerTable';
import { FinanceApprovalsTab } from './FinanceApprovalsTab';
import { FinanceReconciliationTab } from './FinanceReconciliationTab';
import { FinanceRemindersTab } from './FinanceRemindersTab';
import { FinanceAddFormModal } from './FinanceAddFormModal';
import { exportFinancePDF } from './financePdf';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const CATEGORIES = ['Iuran Warga', 'Sumbangan', 'Operasional', 'Keamanan', 'Kebersihan', 'Lainnya'];

export function FinanceLedger() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const { records, pendingApprovals, citizens, reconcileHistory, loading, refetch } = useFinances();

  const [activeTab, setActiveTab] = useState<'ledger' | 'approvals' | 'reconcile' | 'reminders'>('ledger');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submittingApprovalId, setSubmittingApprovalId] = useState<string | null>(null);

  const isAdminRole = ['admin', 'ketua', 'bendahara', 'superadmin'].includes(profile?.role || '');

  const totalIncome = records
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

  const totalExpense = records
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

  const balance = totalIncome - totalExpense;

  const handleApprove = async (approvalId: string) => {
    if (!profile?.uid) return;
    setSubmittingApprovalId(approvalId);
    try {
      const ref = doc(db, 'pending_approvals', approvalId);
      await updateDoc(ref, {
        approvals: arrayUnion(profile.uid),
        approverNames: arrayUnion(profile.displayName || profile.email)
      });
      showToast("Persetujuan berhasil ditambahkan!");
    } catch (err) {
      showToast("Gagal menyetujui transaksi");
    } finally {
      setSubmittingApprovalId(null);
    }
  };

  if (loading) {
    return <div className="p-4 text-center text-xs font-bold text-slate-400">Memuat data kas...</div>;
  }

  return (
    <div className="w-full space-y-4 pb-8">
      <FinanceSummaryCard
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        balance={balance}
        records={records}
        isAdminRole={isAdminRole}
        onOpenAddModal={() => setShowAddModal(true)}
        onExportPDF={() => exportFinancePDF(records)}
      />

      <div className="px-2">
        <FinanceTabHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pendingCount={pendingApprovals.length}
        />
      </div>

      <div className="animate-in fade-in duration-300">
        {activeTab === 'ledger' && (
          <FinanceLedgerTable
            records={records}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            categories={CATEGORIES}
          />
        )}

        {activeTab === 'approvals' && (
          <FinanceApprovalsTab
            pendingApprovals={pendingApprovals}
            profileUid={profile?.uid}
            profileName={profile?.displayName || profile?.email}
            onApprove={handleApprove}
            submittingId={submittingApprovalId}
          />
        )}

        {activeTab === 'reconcile' && (
          <div className="px-2">
            <FinanceReconciliationTab systemBalance={balance} reconcileHistory={reconcileHistory} />
          </div>
        )}

        {activeTab === 'reminders' && (
          <div className="px-2">
            <FinanceRemindersTab citizens={citizens} />
          </div>
        )}
      </div>

      {showAddModal && (
        <FinanceAddFormModal
          onClose={() => setShowAddModal(false)}
          onSuccess={refetch}
          categories={CATEGORIES}
        />
      )}
    </div>
  );
}
