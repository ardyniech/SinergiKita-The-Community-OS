import React from 'react';
import { Landmark, Plus, FileText } from 'lucide-react';
import { CSVExportButton } from '../../../shared/atoms/CSVExportButton';
import { Transaction } from '../../../shared/models';

interface FinanceSummaryProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactions: Transaction[];
  isAdminRole: boolean;
  onOpenAddModal: () => void;
  onExportPDF: () => void;
}

export function FinanceSummary({
  totalIncome,
  totalExpense,
  balance,
  transactions,
  isAdminRole,
  onOpenAddModal,
  onExportPDF
}: FinanceSummaryProps) {
  return (
    <div className="bg-white/60 backdrop-blur-sm border-b border-white/60 shadow-3d-sm rounded-3xl overflow-hidden mb-6">
      <div className="px-4 pt-5 pb-4 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-3d-sm">
              <Landmark size={22} />
            </div>
            <div>
              <h2 className="text-[15px] font-black text-slate-900 leading-tight uppercase tracking-tight">
                Buku Kas Digital
              </h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">Transparansi Keuangan</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CSVExportButton 
              data={transactions} 
              filename="Buku-Kas-SinergiKita" 
              className="!bg-white/80 !border-white/60 !shadow-3d-sm !rounded-xl h-10"
            />
            <button
              onClick={onExportPDF}
              className="btn-3d w-10 h-10 bg-white/80 border border-white/60 text-slate-600 rounded-xl flex items-center justify-center hover:bg-white transition shadow-3d-sm"
              title="Cetak PDF"
            >
              <FileText size={18} />
            </button>
          </div>
        </div>

        {isAdminRole && (
          <button
            onClick={onOpenAddModal}
            className="btn-3d w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-3d-sm transition"
          >
            <Plus size={20} /> Catat Transaksi Baru
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 divide-x divide-slate-100/50 border-t border-slate-100/50 bg-white/30">
        <div className="px-3 py-4 flex flex-col items-center text-center">
          <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1 opacity-80">Pemasukan</span>
          <p className="text-[13px] font-black text-emerald-600 tabular-nums tracking-tighter">
            Rp {totalIncome.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="px-3 py-4 flex flex-col items-center text-center">
          <span className="text-[8px] font-black text-rose-600 uppercase tracking-widest mb-1 opacity-80">Pengeluaran</span>
          <p className="text-[13px] font-black text-rose-600 tabular-nums tracking-tighter">
            Rp {totalExpense.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="px-3 py-4 flex flex-col items-center text-center">
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 opacity-80">Saldo Bersih</span>
          <p className="text-[13px] font-black text-slate-900 tabular-nums tracking-tighter">
            Rp {balance.toLocaleString('id-ID')}
          </p>
        </div>
      </div>
    </div>
  );
}
