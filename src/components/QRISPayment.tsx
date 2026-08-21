import React, { useState } from 'react';
import { Copy, Check, QrCode, ShieldCheck, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface QRISPaymentProps {
  amount?: number;
  title?: string;
  onPaymentConfirm?: () => void;
}

export default function QRISPayment({
  amount = 50000,
  title = 'Pembayaran Kas / Iuran Warga',
  onPaymentConfirm
}: QRISPaymentProps) {
  const { tenant } = useAuth();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const accountName = tenant?.qrisAccountName || `KAS RESMI ${tenant?.name || 'KOMUNITAS'}`;
  const qrUrl = tenant?.qrisImageUrl || 
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`QRIS-${tenant?.id || 'COMMUNITY'}-${amount}`)}`;

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(amount.toString());
    setCopied(true);
    showToast('Nominal pembayaran disalin!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white p-3.5 rounded-2xl shadow-xs border border-slate-200/80 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-1.5">
          <QrCode size={16} className="text-emerald-600" />
          <h3 className="text-xs font-bold text-slate-800">{title}</h3>
        </div>
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
          QRIS Standar
        </span>
      </div>

      <div className="flex flex-col items-center text-center space-y-2">
        <div className="p-2 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner">
          <img 
            src={qrUrl} 
            alt="QRIS Pembayaran Kas"
            className="w-36 h-36 object-contain rounded-lg"
          />
        </div>

        <div className="space-y-0.5">
          <p className="text-xs font-black text-slate-900">{accountName}</p>
          <p className="text-[10px] text-slate-500">Mendukung BCA, Mandiri, BRI, BNI, GoPay, OVO, Dana & LinkAja</p>
        </div>

        <div className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
          <div className="text-left">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Total Nominal Kas</span>
            <span className="text-xs font-black text-slate-900 font-mono">
              Rp {amount.toLocaleString('id-ID')}
            </span>
          </div>

          <button
            onClick={handleCopyAmount}
            className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 text-slate-700 hover:text-emerald-600 rounded-lg text-[10px] font-bold transition-colors shadow-xs"
          >
            {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            <span>{copied ? 'Tersalin' : 'Salin Nominal'}</span>
          </button>
        </div>
      </div>

      <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-2 text-[10px] text-amber-800 leading-relaxed">
        <Info size={14} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span>Setelah melakukan transfer QRIS, Bendahara akan melakukan verifikasi manual dan mencatat bukti ke dalam <strong>Buku Kas Transparan</strong>.</span>
        </div>
      </div>

      {onPaymentConfirm && (
        <button
          onClick={onPaymentConfirm}
          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
        >
          <ShieldCheck size={14} />
          <span>Konfirmasi Sudah Bayar ke Bendahara</span>
        </button>
      )}
    </div>
  );
}
