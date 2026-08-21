import React from 'react';
import { PiggyBank, TrendingUp, Users } from 'lucide-react';

interface KoperasiSummaryProps {
  userDeposits: number;
  totalPool: number;
}

export function KoperasiSummary({ userDeposits, totalPool }: KoperasiSummaryProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <PiggyBank size={18} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900">Kas & Permodalan Koperasi</h2>
            <p className="text-[10px] text-slate-400">Dana bergulir gotong royong warga</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100/70">
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp size={12} className="text-emerald-600" />
            <span className="text-[10px] font-bold text-emerald-800">Simpanan Anda</span>
          </div>
          <p className="text-sm font-black text-emerald-700 tabular-nums">
            Rp {userDeposits.toLocaleString('id-ID')}
          </p>
        </div>

        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/70">
          <div className="flex items-center gap-1 mb-1">
            <Users size={12} className="text-indigo-600" />
            <span className="text-[10px] font-bold text-slate-700">Total Kas Modal</span>
          </div>
          <p className="text-sm font-black text-slate-900 tabular-nums">
            Rp {totalPool.toLocaleString('id-ID')}
          </p>
        </div>
      </div>
    </div>
  );
}
