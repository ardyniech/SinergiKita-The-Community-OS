import React from 'react';
import { FileText } from 'lucide-react';
import { Transaction } from '../../../shared/models';

interface TransactionListProps {
  systemBalance: number;
  transactions: Transaction[];
}

export function TransactionList({ systemBalance, transactions }: TransactionListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex flex-col">
          <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-wider">Jejak Mutasi Digital</h3>
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1 opacity-70">
            Total Kas: <span className="text-indigo-600 font-black">Rp {systemBalance.toLocaleString()}</span>
          </p>
        </div>
      </div>

      <div className="rounded-[32px] border border-slate-200/50 overflow-hidden shadow-inner bg-slate-50/30">
        <div className="flex flex-col divide-y divide-slate-100 max-h-[500px] overflow-y-auto scrollbar-hide">
          {transactions.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] italic opacity-50">Belum ada mutasi keuangan.</p>
            </div>
          ) : (
            transactions.map(t => (
              <div key={t.id} className="p-4 flex justify-between items-center group hover:bg-white/60 transition-all">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-3d-sm border shrink-0 ${
                    t.type === 'credit' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                  }`}>
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-none mb-1 truncate">{t.description}</p>
                    <p className="text-slate-400 text-[8px] font-bold uppercase tracking-widest truncate">
                      {t.date} { (t as any).recordedBy && <span className="opacity-60">• {(t as any).recordedBy}</span> }
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`px-3 py-1.5 rounded-xl font-black text-[11px] tracking-tighter border shadow-3d-sm ${
                    t.type === 'credit' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-rose-500 text-white border-rose-400'
                  }`}>
                    {t.type === 'credit' ? '+' : '-'} {t.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
