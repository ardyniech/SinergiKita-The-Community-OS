import React from 'react';
import { FinanceRecord } from './types';

interface FinanceLedgerTableProps {
  records: FinanceRecord[];
  filterCategory: string;
  setFilterCategory: (cat: string) => void;
  categories: string[];
}

export function FinanceLedgerTable({
  records,
  filterCategory,
  setFilterCategory,
  categories
}: FinanceLedgerTableProps) {
  const filteredRecords = filterCategory === 'ALL'
    ? records
    : records.filter(r => r.category === filterCategory);

  return (
    <div className="bg-white dark:bg-slate-900 shadow-xs border-y border-slate-100 dark:border-slate-800">
      <div className="px-3 py-3 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          Riwayat Transaksi
        </h3>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="h-8 pl-2 pr-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-black appearance-none focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
        >
          <option value="ALL">Semua Kategori</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredRecords.length === 0 ? (
              <tr>
                <td className="px-3 py-12 text-center text-slate-400 italic text-xs font-medium">
                  Belum ada transaksi tercatat
                </td>
              </tr>
            ) : (
              filteredRecords.map((r) => (
                <tr key={r.id} className="active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors">
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">
                        {r.date?.slice(0, 10)}
                      </span>
                      <span className={`text-[13px] font-black tabular-nums ${
                        r.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {r.type === 'income' ? '+' : '-'} {Number(r.amount).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="shrink-0 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[9px] font-black uppercase tracking-wider border border-slate-200/50 dark:border-slate-700/50">
                        {r.category}
                      </span>
                      <span className="text-[12px] font-bold text-slate-800 dark:text-slate-200 truncate">
                        {r.description}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
