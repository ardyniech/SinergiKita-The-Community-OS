import React from 'react';
import { Landmark, Plus, FileText } from 'lucide-react';
import { CSVExportButton } from '../../shared/atoms/CSVExportButton';
import { FinanceRecord } from './types';

interface FinanceSummaryCardProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  records: FinanceRecord[];
  isAdminRole: boolean;
  onOpenAddModal: () => void;
  onExportPDF: () => void;
}

export function FinanceSummaryCard({
  totalIncome,
  totalExpense,
  balance,
  records,
  isAdminRole,
  onOpenAddModal,
  onExportPDF
}: FinanceSummaryCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-xs">
      {/* Primary Header Section */}
      <div className="px-3 pt-4 pb-3 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-200">
              <Landmark size={20} />
            </div>
            <div>
              <h2 className="text-[15px] font-black text-slate-900 dark:text-slate-100 leading-tight">
                Buku Kas Digital
              </h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Transparansi Keuangan</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <CSVExportButton data={records} filename="Buku-Kas-SinergiKita" />
            <button
              onClick={onExportPDF}
              className="w-9 h-9 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-100 transition active:scale-95"
              title="Cetak PDF"
            >
              <FileText size={16} />
            </button>
          </div>
        </div>

        {/* Action Button - Primary */}
        {isAdminRole && (
          <button
            onClick={onOpenAddModal}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[13px] font-black flex items-center justify-center gap-2 shadow-sm shadow-emerald-200 transition active:scale-[0.98]"
          >
            <Plus size={18} /> Catat Transaksi Baru
          </button>
        )}
      </div>

      {/* Stats Section - Flat Grid */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800">
        <div className="px-3 py-3.5 flex flex-col items-center text-center">
          <span className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter mb-0.5">Pemasukan</span>
          <p className="text-[11px] font-black text-emerald-600 tabular-nums">
            {totalIncome.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="px-3 py-3.5 flex flex-col items-center text-center">
          <span className="text-[8px] font-black text-rose-600 uppercase tracking-tighter mb-0.5">Pengeluaran</span>
          <p className="text-[11px] font-black text-rose-600 tabular-nums">
            {totalExpense.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="px-3 py-3.5 flex flex-col items-center text-center bg-slate-50/50 dark:bg-slate-800/30">
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter mb-0.5">Saldo Bersih</span>
          <p className="text-[11px] font-black text-slate-900 dark:text-slate-100 tabular-nums">
            {balance.toLocaleString('id-ID')}
          </p>
        </div>
      </div>
    </div>
  );
}
