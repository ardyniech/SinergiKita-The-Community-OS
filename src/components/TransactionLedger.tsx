import React from 'react';
import { Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useTransactionLedger } from '../hooks/useTransactionLedger';
import { LedgerHeader } from './finance/LedgerHeader';
import { LedgerTransactionsList } from './finance/LedgerTransactionsList';
import { LedgerApprovalsTab } from './finance/LedgerApprovalsTab';
import { LedgerReconcileTab } from './finance/LedgerReconcileTab';
import { LedgerRemindersTab } from './finance/LedgerRemindersTab';

export default function TransactionLedger() {
  const {
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
    handleAddTransaction,
    handleApprove,
    handleReject,
    handleReconcile,
    handleToggleDues,
    handleSendReminder,
    exportToPDF,
    handleUpload
  } = useTransactionLedger();

  if (loading) {
    return (
      <div className="liquid-glass p-12 text-center flex flex-col items-center justify-center gap-4 rounded-[40px] border-white/60 shadow-3d-lg">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <Loader2 size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500 animate-pulse" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Synchronizing Financial Modules...</span>
      </div>
    );
  }

  return (
    <div className="liquid-glass p-6 rounded-[40px] border-white/60 shadow-3d-lg mb-8 bg-white/40 backdrop-blur-2xl">
      <LedgerHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdminRole={isAdminRole}
        pendingApprovalsCount={pendingApprovals.length}
      />

      <AnimatePresence mode="wait">
        {activeTab === 'ledger' && (
          <motion.div key="ledger" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
            <LedgerTransactionsList
              systemBalance={systemBalance}
              transactions={transactions}
              isAdminRole={isAdminRole}
              showAddForm={showAddForm}
              setShowAddForm={setShowAddForm}
              exportToPDF={exportToPDF}
              handleUpload={handleUpload}
              uploading={uploading}
              newDesc={newDesc}
              setNewDesc={setNewDesc}
              newAmount={newAmount}
              setNewAmount={setNewAmount}
              newType={newType}
              setNewType={setNewType}
              newDate={newDate}
              setNewDate={setNewDate}
              isSubmitting={isSubmitting}
              handleAddTransaction={handleAddTransaction}
            />
          </motion.div>
        )}

        {activeTab === 'approvals' && (
          <motion.div key="approvals" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
            <LedgerApprovalsTab
              pendingApprovals={pendingApprovals}
              profileUid={profile?.uid}
              handleReject={handleReject}
              handleApprove={handleApprove}
            />
          </motion.div>
        )}

        {activeTab === 'reconcile' && (
          <motion.div key="reconcile" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
            <LedgerReconcileTab
              systemBalance={systemBalance}
              physicalBalance={physicalBalance}
              setPhysicalBalance={setPhysicalBalance}
              handleReconcile={handleReconcile}
            />
          </motion.div>
        )}

        {activeTab === 'reminders' && (
          <motion.div key="reminders" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
            <LedgerRemindersTab
              citizens={citizens}
              handleToggleDues={handleToggleDues}
              handleSendReminder={handleSendReminder}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
