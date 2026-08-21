import React from 'react';
import { 
  Wallet, ArrowUpRight, ArrowDownRight, CreditCard, 
  FileText, ShieldAlert, Calendar, UserPlus, Share2, Download, Printer 
} from 'lucide-react';
import { LPJSummary } from '../../../shared/models/lpj';
import { formatRupiah, generateLPJCSV, generateLPJWhatsAppMessage } from '../logic/lpjUtils';

interface LPJSummaryCardProps {
  summary: LPJSummary;
  onOpenPrintModal: () => void;
}

export const LPJSummaryCard: React.FC<LPJSummaryCardProps> = ({
  summary,
  onOpenPrintModal
}) => {
  const handleDownloadCSV = () => {
    const csvContent = generateLPJCSV(summary);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `LPJ_${summary.tenantName}_${summary.month}_${summary.year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareWA = () => {
    const text = generateLPJWhatsAppMessage(summary);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-3">
      {/* Financial Overview Card */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-3.5 text-white shadow-md space-y-3">
        <div className="flex items-center justify-between border-b border-indigo-800/80 pb-2">
          <div className="flex items-center gap-1.5">
            <Wallet size={16} className="text-indigo-400" />
            <span className="text-xs font-bold text-indigo-100">Ringkasan Saldo Kas RT/RW</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 bg-indigo-800/60 rounded-full font-mono text-indigo-200">
            {summary.month}/{summary.year}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-indigo-300 block">Saldo Kas Akhir Periode</span>
          <p className="text-lg font-black tracking-tight text-white font-mono">
            {formatRupiah(summary.finalBalance)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-indigo-800/80 text-[11px]">
          <div className="bg-indigo-950/50 p-2 rounded-xl">
            <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold">
              <ArrowUpRight size={12} /> Total Pemasukan
            </div>
            <p className="font-mono font-bold text-emerald-300 mt-0.5">
              {formatRupiah(summary.totalIncome)}
            </p>
          </div>

          <div className="bg-indigo-950/50 p-2 rounded-xl">
            <div className="flex items-center gap-1 text-rose-400 text-[10px] font-bold">
              <ArrowDownRight size={12} /> Total Pengeluaran
            </div>
            <p className="font-mono font-bold text-rose-300 mt-0.5">
              {formatRupiah(summary.totalExpense)}
            </p>
          </div>
        </div>
      </div>

      {/* Activity Breakdown Matrix */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white border border-slate-200/80 rounded-xl p-2.5 shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-indigo-600">
            <CreditCard size={14} />
            <span className="text-[10px] font-bold text-slate-700">Pembayaran Iuran</span>
          </div>
          <p className="text-sm font-black text-slate-900 font-mono">{summary.duesCount} Transaksi</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-2.5 shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-blue-600">
            <FileText size={14} />
            <span className="text-[10px] font-bold text-slate-700">Surat Pengantar</span>
          </div>
          <p className="text-sm font-black text-slate-900 font-mono">{summary.lettersCount} Berkas</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-2.5 shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-600">
            <ShieldAlert size={14} />
            <span className="text-[10px] font-bold text-slate-700">Shift Patroli Ronda</span>
          </div>
          <p className="text-sm font-black text-slate-900 font-mono">{summary.patrolCount} Jadwal</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-2.5 shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-amber-600">
            <Calendar size={14} />
            <span className="text-[10px] font-bold text-slate-700">Agenda & Tamu</span>
          </div>
          <p className="text-sm font-black text-slate-900 font-mono">{summary.eventsCount} / {summary.guestsCount} Laporan</p>
        </div>
      </div>

      {/* Export Action Controls */}
      <div className="grid grid-cols-3 gap-1.5">
        <button
          onClick={onOpenPrintModal}
          className="flex items-center justify-center gap-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-bold shadow-xs transition-colors"
        >
          <Printer size={12} />
          <span>Cetak / PDF</span>
        </button>

        <button
          onClick={handleDownloadCSV}
          className="flex items-center justify-center gap-1 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[10px] font-bold shadow-xs transition-colors"
        >
          <Download size={12} />
          <span>Unduh CSV</span>
        </button>

        <button
          onClick={handleShareWA}
          className="flex items-center justify-center gap-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold shadow-xs transition-colors"
        >
          <Share2 size={12} />
          <span>Sebar WA</span>
        </button>
      </div>
    </div>
  );
};
