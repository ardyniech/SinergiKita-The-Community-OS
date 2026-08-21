import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useFinance } from '../logic/useFinance';
import { FinanceHeader, FinanceTab } from './FinanceHeader';
import { FinanceSummary } from './FinanceSummary';
import { TransactionList } from './TransactionList';
import { TransactionForm } from './TransactionForm';
import { Loader2 } from 'lucide-react';

export const FinanceContainer: React.FC = () => {
  const { profile } = useAuth();
  const { 
    transactions, 
    loading, 
    totalIncome, 
    totalExpense, 
    systemBalance, 
    recordTransaction 
  } = useFinance(profile?.tenantId || null);

  const [activeTab, setActiveTab] = useState<FinanceTab>('ledger');
  const [showAddForm, setShowAddForm] = useState(false);
  
  const isAdmin = ['admin', 'ketua', 'bendahara', 'superadmin'].includes(profile?.role || '');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="liquid-glass rounded-[40px] p-4 sm:p-6 shadow-3d-lg border-white/60">
      <FinanceHeader 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isAdminRole={isAdmin}
        pendingApprovalsCount={0} // Mock for now
      />

      <FinanceSummary 
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        balance={systemBalance}
        transactions={transactions}
        isAdminRole={isAdmin}
        onOpenAddModal={() => setShowAddForm(true)}
        onExportPDF={() => {}}
      />

      <div className="animate-in fade-in duration-500">
        {activeTab === 'ledger' && (
          <div className="space-y-6">
            {showAddForm && isAdmin && (
              <TransactionForm 
                onAdd={recordTransaction} 
                onUpload={async () => {}} 
                uploading={false}
                isSubmitting={false}
                onCancel={() => setShowAddForm(false)}
              />
            )}
            <TransactionList systemBalance={systemBalance} transactions={transactions} />
          </div>
        )}
        {activeTab === 'approvals' && (
          <div className="p-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Authorization Protocol Pending Integration
          </div>
        )}
        {activeTab === 'reconcile' && (
          <div className="p-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Reconciliation Engine Offline
          </div>
        )}
        {activeTab === 'reminders' && (
          <div className="p-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Dues Tracking Service Pending
          </div>
        )}
      </div>
    </div>
  );
};
