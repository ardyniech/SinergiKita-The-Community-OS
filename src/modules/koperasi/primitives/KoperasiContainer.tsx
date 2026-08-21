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
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  const tabs: { id: KoperasiTab; label: string; icon: any }[] = [
    ...(isAdmin ? [{ id: 'save' as KoperasiTab, label: 'Setor', icon: PiggyBank }] : []),
    { id: 'shu', label: 'SHU', icon: Calculator },
    { id: 'loan', label: 'Pinjaman', icon: ArrowUpRight },
    { id: 'history', label: 'Riwayat', icon: History },
  ];

  // If user is not admin and was on 'save' tab, move to 'shu'
  if (!isAdmin && activeTab === 'save') {
    setActiveTab('shu');
  }

  return (
    <div className="liquid-glass rounded-[40px] p-4 sm:p-6 shadow-3d-lg border-white/60 space-y-6">
      <KoperasiSummary userDeposits={userDeposits} totalPool={totalKoperasiPool} />

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide px-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn-3d flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
              activeTab === tab.id 
              ? 'bg-slate-900 text-white border-slate-800 shadow-3d-sm' 
              : 'bg-white/60 text-slate-500 border-white/80 hover:bg-white'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="animate-in fade-in duration-500">
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
