import React from 'react';
import { Wallet, QrCode, SlidersHorizontal, CheckCircle2 } from 'lucide-react';

export type FinanceTab = 'ledger' | 'dues' | 'settings';

interface FinanceHeaderProps {
  activeTab: FinanceTab;
  setActiveTab: (tab: FinanceTab) => void;
  isTreasurer: boolean;
  pendingVerificationCount?: number;
}

export function FinanceHeader({
  activeTab,
  setActiveTab,
  isTreasurer,
  pendingVerificationCount = 0
}: FinanceHeaderProps) {
  return (
    <div className="flex bg-slate-100/80 p-1 rounded-xl mb-3 overflow-x-auto gap-1 border border-slate-200/60 scrollbar-hide">
      <button
        onClick={() => setActiveTab('ledger')}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
          activeTab === 'ledger'
            ? 'bg-blue-600 text-white shadow-xs'
            : 'bg-transparent text-slate-600 hover:bg-white/60'
        }`}
      >
        <Wallet size={15} />
        <span>Buku Kas</span>
      </button>

      <button
        onClick={() => setActiveTab('dues')}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 relative ${
          activeTab === 'dues'
            ? 'bg-blue-600 text-white shadow-xs'
            : 'bg-transparent text-slate-600 hover:bg-white/60'
        }`}
      >
        <QrCode size={15} />
        <span>Iuran & QRIS</span>
        {pendingVerificationCount > 0 && isTreasurer && (
          <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
            {pendingVerificationCount}
          </span>
        )}
      </button>

      {isTreasurer && (
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === 'settings'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-transparent text-slate-600 hover:bg-white/60'
          }`}
        >
          <SlidersHorizontal size={15} />
          <span>Atur QRIS</span>
        </button>
      )}
    </div>
  );
}
