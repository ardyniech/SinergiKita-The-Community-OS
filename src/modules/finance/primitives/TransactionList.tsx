import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Inbox } from 'lucide-react';
import { Transaction } from '../../../shared/models';

interface TransactionListProps {
  systemBalance: number;
  transactions: Transaction[];
}

export function TransactionList({ systemBalance, transactions }: TransactionListProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold text-slate-900">Riwayat Mutasi Kas</h3>
        <span className="text-[10px] font-semibold text-slate-500">
          {transactions.length} transaksi tercatat
        </span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden divide-y divide-slate-100 shadow-xs">
        {transactions.length === 0 ? (
          <div className="py-10 flex flex-col items-center justify-center text-center px-4">
            <Inbox className="w-8 h-8 text-slate-300 mb-1.5" />
            <p className="text-xs font-semibold text-slate-500">Belum ada mutasi keuangan tercatat.</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Semua pemasukan & pengeluaran kas akan tampil di sini.</p>
          </div>
        ) : (
          transactions.map(t => {
            const isCredit = t.type === 'credit';
            return (
              <div key={t.id} className="p-2.5 flex items-center justify-between gap-2 hover:bg-slate-50/80 transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isCredit ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {isCredit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{t.description}</p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {t.date} {t.recordedBy && `• Oleh: ${t.recordedBy}`}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs font-bold ${
                    isCredit ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {isCredit ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
