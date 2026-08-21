import React from 'react';
import { QrCode, CheckCircle2, Clock, AlertCircle, FileText, BellRing } from 'lucide-react';
import { DuesBilling, DuesPayment } from '../../../shared/models';

interface BillingItemCardProps {
  billing: DuesBilling;
  payments: DuesPayment[];
  currentUserId: string;
  isTreasurer?: boolean;
  onPayBilling: (billing: DuesBilling) => void;
  onViewReceipt?: (payment: DuesPayment, billing: DuesBilling) => void;
  onSendReminder?: (billing: DuesBilling) => void;
}

export function BillingItemCard({
  billing,
  payments,
  currentUserId,
  isTreasurer,
  onPayBilling,
  onViewReceipt,
  onSendReminder
}: BillingItemCardProps) {
  const userPayment = payments.find(p => p.duesId === billing.id && p.userId === currentUserId);
  const isVerified = userPayment?.status === 'verified';
  const isPending = userPayment?.status === 'pending';

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs space-y-2">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h4 className="text-xs font-bold text-slate-900 truncate">{billing.title}</h4>
          <p className="text-[10px] text-slate-500">
            Periode: <span className="font-semibold text-slate-700">{billing.period}</span> • Batas: {billing.dueDate}
          </p>
        </div>
        <p className="text-xs font-black text-blue-600 shrink-0">Rp {billing.amount.toLocaleString('id-ID')}</p>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
        <div>
          {isVerified ? (
            <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
              <CheckCircle2 size={13} /> Lunas
            </span>
          ) : isPending ? (
            <span className="inline-flex items-center gap-1 text-amber-600 font-bold text-[11px]">
              <Clock size={13} /> Menunggu Verifikasi
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-rose-500 font-semibold text-[11px]">
              <AlertCircle size={13} /> Belum Bayar
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {isTreasurer && onSendReminder && (
            <button
              onClick={() => onSendReminder(billing)}
              className="p-1 text-amber-600 hover:bg-amber-50 rounded-lg text-xs font-medium transition-colors"
              title="Kirim Pengingat WA"
            >
              <BellRing size={14} />
            </button>
          )}

          {isVerified && userPayment && onViewReceipt ? (
            <button
              onClick={() => onViewReceipt(userPayment, billing)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <FileText size={13} className="text-blue-600" /> Kuitansi
            </button>
          ) : !isVerified ? (
            <button
              onClick={() => onPayBilling(billing)}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
            >
              <QrCode size={13} /> {isPending ? 'Konfirmasi Ulang' : 'Bayar QRIS'}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
