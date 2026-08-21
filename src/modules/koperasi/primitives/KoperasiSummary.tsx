import React from 'react';
import { PiggyBank, TrendingUp, Users } from 'lucide-react';

interface KoperasiSummaryProps {
  userDeposits: number;
  totalPool: number;
}

export function KoperasiSummary({ userDeposits, totalPool }: KoperasiSummaryProps) {
  return (
    <div className="card-3d p-4 bg-white/60 shadow-3d-sm border-white/60 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-3d-sm">
            <PiggyBank size={20} />
          </div>
          <div>
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-tight">Fiskal Koperasi</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest opacity-80 leading-none mt-1">Sinergi Gotong Royong</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 bg-white/40 rounded-2xl border border-white/80 shadow-inner group">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={12} className="text-emerald-500" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Saldo Tabungan Anda</span>
          </div>
          <p className="text-xl font-black text-emerald-600 tabular-nums tracking-tighter">
            Rp {userDeposits.toLocaleString('id-ID')}
          </p>
        </div>

        <div className="p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100/50 shadow-inner">
          <div className="flex items-center gap-2 mb-2">
            <Users size={12} className="text-indigo-500" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Konsolidasi Kas</span>
          </div>
          <p className="text-xl font-black text-slate-900 tabular-nums tracking-tighter">
            Rp {totalPool.toLocaleString('id-ID')}
          </p>
        </div>
      </div>
    </div>
  );
}
