import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useFinance } from '../logic/useFinance';
import { FinanceHeader, FinanceTab } from './FinanceHeader';
import { FinanceSummary } from './FinanceSummary';
import { TransactionList } from './TransactionList';
import { TransactionForm } from './TransactionForm';
import { DuesBillingList } from './DuesBillingList';
import { DuesBillingForm } from './DuesBillingForm';
import { QrisPaymentModal } from './QrisPaymentModal';
import { QrisSettingsCard } from './QrisSettingsCard';
import { DigitalReceiptModal } from './DigitalReceiptModal';
import { FinancialReportModal } from './FinancialReportModal';
import { DuesReminderModal } from './DuesReminderModal';
import { DuesBilling, DuesPayment } from '../../../shared/models';
import { Loader2 } from 'lucide-react';

export const FinanceContainer: React.FC = () => {
  const { profile, tenant } = useAuth();
  const {
    transactions, billings, payments, loading,
    totalIncome, totalExpense, systemBalance,
    recordTransaction, createDuesBilling, submitPayment, verifyPayment, updatePaymentInfo
  } = useFinance(profile?.tenantId || null, profile?.uid);

  const [activeTab, setActiveTab] = useState<FinanceTab>('ledger');
  const [showAddTx, setShowAddTx] = useState(false);
  const [showCreateDues, setShowCreateDues] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [payModalBilling, setPayModalBilling] = useState<DuesBilling | null | undefined>(undefined);
  const [reminderBilling, setReminderBilling] = useState<DuesBilling | null>(null);
  const [receiptData, setReceiptData] = useState<{ payment: DuesPayment; billing?: DuesBilling } | null>(null);

  const isTreasurer = ['bendahara', 'superadmin', 'ketua', 'admin'].includes(profile?.role || '');
  const pendingPayments = payments.filter(p => p.status === 'pending');

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 text-blue-600 animate-spin" /></div>;

  return (
    <div className="space-y-2.5 pb-8">
      <FinanceHeader activeTab={activeTab} setActiveTab={setActiveTab} isTreasurer={isTreasurer} pendingVerificationCount={pendingPayments.length} />
      <FinanceSummary
        totalIncome={totalIncome} totalExpense={totalExpense} balance={systemBalance}
        transactions={transactions} isTreasurer={isTreasurer}
        onOpenAddModal={() => setShowAddTx(true)} onOpenPayModal={() => setPayModalBilling(null)}
        onOpenReportModal={() => setShowReport(true)}
      />
      {activeTab === 'ledger' && (
        <div className="space-y-3">
          {showAddTx && isTreasurer && (
            <TransactionForm onAdd={recordTransaction} onCancel={() => setShowAddTx(false)} recordedByName={profile?.displayName || 'Bendahara'} />
          )}
          <TransactionList systemBalance={systemBalance} transactions={transactions} />
        </div>
      )}
      {activeTab === 'dues' && (
        <DuesBillingList
          billings={billings} payments={payments} currentUserId={profile?.uid || ''}
          isTreasurer={isTreasurer} onOpenCreateModal={() => setShowCreateDues(true)}
          onPayBilling={(b) => setPayModalBilling(b)}
          onVerifyPayment={(p) => verifyPayment(p, profile?.displayName || 'Bendahara')}
          onViewReceipt={(p, b) => setReceiptData({ payment: p, billing: b })}
          onSendReminder={(b) => setReminderBilling(b)}
        />
      )}
      {activeTab === 'settings' && isTreasurer && <QrisSettingsCard tenant={tenant} onSaveSettings={updatePaymentInfo} />}
      {showCreateDues && isTreasurer && (
        <DuesBillingForm onCreate={createDuesBilling} onCancel={() => setShowCreateDues(false)} creatorName={profile?.displayName || 'Bendahara'} />
      )}
      {payModalBilling !== undefined && (
        <QrisPaymentModal
          tenant={tenant} billings={billings} selectedBilling={payModalBilling}
          userName={profile?.displayName || 'Warga'} userId={profile?.uid || ''}
          onSubmitPayment={(d) => submitPayment({ ...d, userId: profile?.uid || '', userName: profile?.displayName || 'Warga' })}
          onClose={() => setPayModalBilling(undefined)}
        />
      )}
      {receiptData && (
        <DigitalReceiptModal tenant={tenant} billing={receiptData.billing} payment={receiptData.payment} onClose={() => setReceiptData(null)} />
      )}
      {showReport && (
        <FinancialReportModal
          tenant={tenant} transactions={transactions} totalIncome={totalIncome}
          totalExpense={totalExpense} balance={systemBalance} onClose={() => setShowReport(false)}
        />
      )}
      {reminderBilling && (
        <DuesReminderModal tenant={tenant} billing={reminderBilling} onClose={() => setReminderBilling(null)} />
      )}
    </div>
  );
};
