import React from 'react';
import { X, Printer, FileCheck } from 'lucide-react';
import { LPJSummary } from '../../../shared/models/lpj';
import { formatRupiah, getMonthName } from '../logic/lpjUtils';

interface LPJPrintPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  summary: LPJSummary;
  leaderName?: string;
}

export const LPJPrintPreview: React.FC<LPJPrintPreviewProps> = ({
  isOpen,
  onClose,
  summary,
  leaderName = 'Ketua RT / RW'
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const periodStr = `${getMonthName(summary.month)} ${summary.year}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150 max-h-[90vh] flex flex-col">
        <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <FileCheck size={16} className="text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900">Pratinjau Cetak LPJ Resmi</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:bg-slate-200 rounded-full">
            <X size={15} />
          </button>
        </div>

        {/* Printable Area */}
        <div className="p-4 overflow-y-auto space-y-4 text-slate-800 font-serif text-[11px] leading-relaxed">
          {/* Formal KOP */}
          <div className="text-center border-b-2 border-slate-900 pb-2 space-y-0.5">
            <h1 className="text-xs font-black uppercase tracking-wider text-slate-900">
              PENGURUS LINGKUNGAN {summary.tenantName.toUpperCase()}
            </h1>
            <p className="text-[10px] italic text-slate-600">
              LAPORAN PERTANGGUNGJAWABAN (LPJ) KEUANGAN & PELAYANAN WARGA
            </p>
            <p className="text-[9px] font-sans font-bold text-slate-700">
              PERIODE: {periodStr.toUpperCase()}
            </p>
          </div>

          {/* Statement */}
          <p className="text-justify font-sans text-[10px] text-slate-600">
            Berikut dilaporkan rekapitulasi realisasi penerimaan, pengeluaran kas, serta pelayanan administrasi masyarakat lingkungan {summary.tenantName} untuk periode {periodStr}:
          </p>

          {/* Keuangan Table */}
          <div className="font-sans space-y-1">
            <h4 className="text-[10px] font-bold text-slate-900 uppercase">I. REKAPITULASI KAS & KEUANGAN</h4>
            <table className="w-full border-collapse border border-slate-300 text-[10px]">
              <thead>
                <tr className="bg-slate-100 text-slate-800">
                  <th className="border border-slate-300 p-1.5 text-left">Uraian Transaksi Kas</th>
                  <th className="border border-slate-300 p-1.5 text-right font-mono">Jumlah (Rp)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 p-1.5">Total Penerimaan Kas / Iuran Warga</td>
                  <td className="border border-slate-300 p-1.5 text-right font-mono font-bold text-emerald-700">
                    {formatRupiah(summary.totalIncome)}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1.5">Total Pengeluaran & Operasional RT</td>
                  <td className="border border-slate-300 p-1.5 text-right font-mono font-bold text-rose-700">
                    {formatRupiah(summary.totalExpense)}
                  </td>
                </tr>
                <tr className="bg-slate-50 font-bold">
                  <td className="border border-slate-300 p-1.5">Saldo Kas Akhir Periode</td>
                  <td className="border border-slate-300 p-1.5 text-right font-mono text-indigo-800">
                    {formatRupiah(summary.finalBalance)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Aktivitas Table */}
          <div className="font-sans space-y-1">
            <h4 className="text-[10px] font-bold text-slate-900 uppercase">II. REKAPITULASI PELAYANAN & KEGIATAN</h4>
            <table className="w-full border-collapse border border-slate-300 text-[10px]">
              <thead>
                <tr className="bg-slate-100 text-slate-800">
                  <th className="border border-slate-300 p-1.5 text-left">Komponen Pelayanan</th>
                  <th className="border border-slate-300 p-1.5 text-center font-mono">Volume / Frekuensi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 p-1.5">Transaksi Pembayaran Iuran Kebersihan/Kas</td>
                  <td className="border border-slate-300 p-1.5 text-center font-mono">{summary.duesCount} Transaksi</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1.5">Surat Pengantar RT/RW Diterbitkan</td>
                  <td className="border border-slate-300 p-1.5 text-center font-mono">{summary.lettersCount} Berkas</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1.5">Jadwal Shift Patroli Ronda Siskamling</td>
                  <td className="border border-slate-300 p-1.5 text-center font-mono">{summary.patrolCount} Shift</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1.5">Agenda Kegiatan Warga & Kerja Bakti</td>
                  <td className="border border-slate-300 p-1.5 text-center font-mono">{summary.eventsCount} Kegiatan</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1.5">Pelaporan Wajib Lapor Tamu 1x24 Jam</td>
                  <td className="border border-slate-300 p-1.5 text-center font-mono">{summary.guestsCount} Laporan</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-4 pt-4 text-center font-sans text-[10px]">
            <div>
              <p>Mengetahui,</p>
              <p className="font-bold">Ketua RT / RW</p>
              <div className="h-12"></div>
              <p className="font-bold underline">({leaderName})</p>
            </div>
            <div>
              <p>Disusun oleh,</p>
              <p className="font-bold">Bendahara & Sekretaris</p>
              <div className="h-12"></div>
              <p className="font-bold underline">(Pengurus Keuangan)</p>
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-600 font-medium hover:bg-slate-200 rounded-lg"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs"
          >
            <Printer size={13} />
            <span>Cetak Dokumen LPJ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
