import React from 'react';
import { Landmark, Plus, QrCode, FileText } from 'lucide-react';
import { CSVExportButton } from '../../../shared/atoms/CSVExportButton';
import { Transaction } from '../../../shared/models';

interface FinanceSummaryProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactions: Transaction[];
  isTreasurer: boolean;
  onOpenAddModal: () => void;
  onOpenPayModal: () => void;
  onOpenReportModal?: () => void;
}

export function FinanceSummary({
  totalIncome,
  totalExpense,
  balance,
  transactions,
  isTreasurer,
  onOpenAddModal,
  onOpenPayModal,
  onOpenReportModal
}: FinanceSummaryProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs mb-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Landmark size={18} />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 leading-tight">
              Buku Kas Komunitas
            </h2>
            <p className="text-[10px] font-semibold text-slate-500">Transparansi Keuangan Terbuka</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              className="py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors border border-blue-200/60"
            >
              <FileText size={13} />
              <span>Rekap</span>
            </button>
          )}
          <CSVExportButton 
            data={transactions} 
            filename="Buku-Kas-Komunitas" 
            className="!bg-slate-100 !text-slate-700 !text-xs !py-1.5 !px-2.5 !rounded-lg !border-slate-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-tight">Pemasukan</span>
          <p className="text-xs font-black text-emerald-600 truncate">
            Rp {totalIncome.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-rose-700 uppercase tracking-tight">Pengeluaran</span>
          <p className="text-xs font-black text-rose-600 truncate">
            Rp {totalExpense.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tight">Saldo Kas</span>
          <p className="text-xs font-black text-slate-900 truncate">
            Rp {balance.toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onOpenPayModal}
          className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
        >
          <QrCode size={16} /> Bayar Iuran (QRIS)
        </button>

        {isTreasurer && (
          <button
            onClick={onOpenAddModal}
            className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus size={16} /> Catat Mutasi
          </button>
        )}
      </div>
    </div>
  );
}
