import React from 'react';
import { Table, ShieldCheck, Wallet, Send } from 'lucide-react';

interface FinanceTabHeaderProps {
  activeTab: 'ledger' | 'approvals' | 'reconcile' | 'reminders';
  setActiveTab: (tab: 'ledger' | 'approvals' | 'reconcile' | 'reminders') => void;
  pendingCount: number;
}

export function FinanceTabHeader({ activeTab, setActiveTab, pendingCount }: FinanceTabHeaderProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide px-1">
      <button
        onClick={() => setActiveTab('ledger')}
        className={`h-9 px-4 text-[11px] font-black rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap shadow-sm border ${
          activeTab === 'ledger'
            ? 'bg-slate-900 text-white border-slate-900'
            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
        }`}
      >
        <Table size={14} /> Buku Kas
      </button>

      <button
        onClick={() => setActiveTab('approvals')}
        className={`h-9 px-4 text-[11px] font-black rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap relative shadow-sm border ${
          activeTab === 'approvals'
            ? 'bg-slate-900 text-white border-slate-900'
            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
        }`}
      >
        <ShieldCheck size={14} /> Dual-Sign
        {pendingCount > 0 && (
          <span className="w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] flex items-center justify-center animate-pulse">
            {pendingCount}
          </span>
        )}
      </button>

      <button
        onClick={() => setActiveTab('reconcile')}
        className={`h-9 px-4 text-[11px] font-black rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap shadow-sm border ${
          activeTab === 'reconcile'
            ? 'bg-slate-900 text-white border-slate-900'
            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
        }`}
      >
        <Wallet size={14} /> Rekon
      </button>

      <button
        onClick={() => setActiveTab('reminders')}
        className={`h-9 px-4 text-[11px] font-black rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap shadow-sm border ${
          activeTab === 'reminders'
            ? 'bg-slate-900 text-white border-slate-900'
            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
        }`}
      >
        <Send size={14} /> Tagihan
      </button>
    </div>
  );
}
