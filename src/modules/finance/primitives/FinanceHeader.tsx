import React from 'react';
import { Wallet, ShieldCheck, RefreshCw, Users } from 'lucide-react';

export type FinanceTab = 'ledger' | 'approvals' | 'reconcile' | 'reminders';

interface FinanceHeaderProps {
  activeTab: FinanceTab;
  setActiveTab: (tab: FinanceTab) => void;
  isAdminRole: boolean;
  pendingApprovalsCount: number;
}

export function FinanceHeader({
  activeTab,
  setActiveTab,
  isAdminRole,
  pendingApprovalsCount
}: FinanceHeaderProps) {
  return (
    <div className="flex bg-slate-100/50 p-1.5 rounded-[20px] mb-6 overflow-x-auto gap-2 border border-slate-200/50 backdrop-blur-md scrollbar-hide">
      <button
        onClick={() => setActiveTab('ledger')}
        className={`btn-3d flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] transition-all shrink-0 border ${
          activeTab === 'ledger' 
            ? 'bg-indigo-600 text-white border-indigo-500 shadow-3d-sm' 
            : 'bg-white/40 text-slate-500 border-white/80 hover:bg-white'
        }`}
      >
        <Wallet size={14} /> Fiscal Ledger
      </button>

      {isAdminRole && (
        <>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`btn-3d flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] transition-all shrink-0 relative border ${
              activeTab === 'approvals' 
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-3d-sm' 
                : 'bg-white/40 text-slate-500 border-white/80 hover:bg-white'
            }`}
          >
            <ShieldCheck size={14} /> Auth Requests
            {pendingApprovalsCount > 0 && (
              <span className="absolute -top-2 -right-1 bg-rose-500 text-white text-[8px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-3d-sm animate-bounce">
                {pendingApprovalsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('reconcile')}
            className={`btn-3d flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] transition-all shrink-0 border ${
              activeTab === 'reconcile' 
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-3d-sm' 
                : 'bg-white/40 text-slate-500 border-white/80 hover:bg-white'
            }`}
          >
            <RefreshCw size={14} /> Reconcile
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`btn-3d flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] transition-all shrink-0 border ${
              activeTab === 'reminders' 
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-3d-sm' 
                : 'bg-white/40 text-slate-500 border-white/80 hover:bg-white'
            }`}
          >
            <Users size={14} /> Dues Tracking
          </button>
        </>
      )}
    </div>
  );
}
