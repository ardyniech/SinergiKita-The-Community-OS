import React from 'react';
import { HeartHandshake, Plus } from 'lucide-react';

interface FundingHeaderProps {
  totalTarget: number;
  totalCollected: number;
  activeTab: 'projects' | 'my_contributions';
  setActiveTab: (tab: 'projects' | 'my_contributions') => void;
  onOpenCreate: () => void;
}

export function FundingHeader({
  totalCollected,
  activeTab,
  setActiveTab,
  onOpenCreate
}: FundingHeaderProps) {
  return (
    <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <HeartHandshake size={18} />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100">
              Gotong Royong & Modal Sosial
            </h2>
            <p className="text-[10px] text-slate-500">Patungan Warga untuk Inisiatif Bersama</p>
          </div>
        </div>

        <button
          onClick={onOpenCreate}
          className="min-h-[44px] px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black flex items-center gap-1 shadow-xs transition cursor-pointer"
        >
          <Plus size={14} /> Buat Inisiatif Baru
        </button>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('projects')}
            className={`min-h-[44px] px-3 py-1.5 text-xs font-black rounded-lg transition ${
              activeTab === 'projects' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-500'
            }`}
          >
            Daftar Inisiatif
          </button>
          <button
            onClick={() => setActiveTab('my_contributions')}
            className={`min-h-[44px] px-3 py-1.5 text-xs font-black rounded-lg transition ${
              activeTab === 'my_contributions' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-500'
            }`}
          >
            Kontribusi Saya
          </button>
        </div>

        <div className="text-right">
          <span className="text-[9px] font-bold text-slate-400 uppercase">Total Terkumpul</span>
          <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
            Rp {totalCollected.toLocaleString('id-ID')}
          </p>
        </div>
      </div>
    </div>
  );
}
