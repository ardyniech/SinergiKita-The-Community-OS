import React, { useState } from 'react';
import { PiggyBank, Calculator, ArrowUpRight, History, Loader2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useKoperasi } from '../logic/useKoperasi';
import { KoperasiSummary } from './KoperasiSummary';
import { DepositForm } from './DepositForm';
import { LoanWorkflow } from './LoanWorkflow';
import { KoperasiHistory } from './KoperasiHistory';
import { SHUCalculator } from './SHUCalculator';

type KoperasiTab = 'save' | 'shu' | 'loan' | 'history';

export const KoperasiContainer: React.FC = () => {
  const { profile } = useAuth();
  const { 
    records, 
    loans, 
    loading, 
    submitting, 
    userDeposits, 
    totalKoperasiPool,
    handleDeposit,
    handleApplyLoan,
    handleUpdateLoanStatus
  } = useKoperasi(profile?.tenantId || null, profile);

  const [activeTab, setActiveTab] = useState<KoperasiTab>('save');
  const isAdmin = ['admin', 'ketua', 'bendahara', 'superadmin'].includes(profile?.role || '');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
      </div>
    );
  }

  const tabs: { id: KoperasiTab; label: string; icon: any }[] = [
    { id: 'save', label: 'Simpanan', icon: PiggyBank },
    { id: 'loan', label: 'Pinjaman', icon: ArrowUpRight },
    { id: 'shu', label: 'Hitung SHU', icon: Calculator },
    { id: 'history', label: 'Riwayat', icon: History },
  ];

  return (
    <div className="space-y-3">
      <KoperasiSummary userDeposits={userDeposits} totalPool={totalKoperasiPool} />

      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100/80 rounded-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all ${
                isActive
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon size={13} className={isActive ? 'text-emerald-600' : 'text-slate-400'} />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="animate-in fade-in duration-300">
        {activeTab === 'save' && (
          <DepositForm onDeposit={handleDeposit} submitting={submitting} />
        )}
        {activeTab === 'shu' && (
          <SHUCalculator userSavings={userDeposits} totalSavingsPool={totalKoperasiPool} />
        )}
        {activeTab === 'loan' && (
          <LoanWorkflow 
            loans={loans} 
            isAdmin={isAdmin} 
            submitting={submitting} 
            onApply={handleApplyLoan} 
            onUpdateStatus={handleUpdateLoanStatus} 
          />
        )}
        {activeTab === 'history' && (
          <KoperasiHistory records={records} loading={loading} />
        )}
      </div>
    </div>
  );
};
