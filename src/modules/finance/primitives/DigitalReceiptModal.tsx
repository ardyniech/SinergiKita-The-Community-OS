import React, { useState } from 'react';
import { X, CheckCircle2, Printer, Share2, Copy, Check } from 'lucide-react';
import { DuesBilling, DuesPayment, Tenant } from '../../../shared/models';

interface DigitalReceiptModalProps {
  billing?: DuesBilling | null;
  payment: DuesPayment;
  tenant: Tenant | null;
  onClose: () => void;
}

export function DigitalReceiptModal({
  billing,
  payment,
  tenant,
  onClose
}: DigitalReceiptModalProps) {
  const [copied, setCopied] = useState(false);
  const receiptNo = `KWT-${(payment.id || '000').slice(0, 6).toUpperCase()}-${new Date().getFullYear()}`;
  const paymentDate = payment.paidAt?.toDate?.() 
    ? payment.paidAt.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('id-ID');

  const shareText = `*KUITANSI IURAN KOMUNITAS*\nNo: ${receiptNo}\nKomunitas: ${tenant?.name || 'Komunitas SinergiKita'}\nNama: ${payment.userName}\nIuran: ${payment.duesTitle}\nNominal: Rp ${payment.amount.toLocaleString('id-ID')}\nMetode: ${payment.paymentMethod.toUpperCase()}\nStatus: LUNAS & TERVERIFIKASI\nTanggal: ${paymentDate}\nVerifikator: ${payment.verifiedBy || 'Bendahara'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-sm w-full p-4 shadow-xl border border-slate-200 space-y-3 print:m-0 print:p-6 print:border-none print:shadow-none">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 print:hidden">
          <span className="text-xs font-bold text-slate-900">Kuitansi Pembayaran Digital</span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={16} />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5 text-xs">
          <div className="text-center pb-2 border-b border-dashed border-slate-300">
            <h3 className="font-black text-slate-900 text-sm tracking-tight">{tenant?.name || 'Kas Komunitas Warga'}</h3>
            <p className="text-[10px] text-slate-500">Bukti Pembayaran Iuran Sah</p>
            <p className="font-mono text-[9px] text-slate-400 mt-0.5">{receiptNo}</p>
          </div>

          <div className="space-y-1 text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-400 text-[11px]">Nama Pembayar:</span>
              <span className="font-bold text-slate-900">{payment.userName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-[11px]">Jenis Iuran:</span>
              <span className="font-bold text-slate-800">{payment.duesTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-[11px]">Metode:</span>
              <span className="font-semibold uppercase">{payment.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-[11px]">Tanggal Bayar:</span>
              <span>{paymentDate}</span>
            </div>
            {payment.notes && (
              <div className="flex justify-between">
                <span className="text-slate-400 text-[11px]">Catatan:</span>
                <span className="italic">{payment.notes}</span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-dashed border-slate-300 flex items-center justify-between">
            <span className="font-bold text-slate-900 text-xs">TOTAL BAYAR</span>
            <span className="font-black text-blue-600 text-sm">
              Rp {payment.amount.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="pt-2 flex items-center justify-between text-[10px] bg-emerald-50 p-2 rounded-lg border border-emerald-200 text-emerald-800">
            <div className="flex items-center gap-1 font-bold">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span>TERVERIFIKASI LUNAS</span>
            </div>
            <span className="text-emerald-700">Oleh: {payment.verifiedBy || 'Bendahara'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1 print:hidden">
          <button
            onClick={handleCopy}
            className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <Printer size={14} />
            <span>Cetak Bukti</span>
          </button>
        </div>
      </div>
    </div>
  );
}
