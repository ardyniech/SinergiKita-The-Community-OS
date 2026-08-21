import React from 'react';
import { QrCode, Plus, CheckCircle2, ShieldCheck } from 'lucide-react';
import { DuesBilling, DuesPayment } from '../../../shared/models';
import { BillingItemCard } from './BillingItemCard';

interface DuesBillingListProps {
  billings: DuesBilling[];
  payments: DuesPayment[];
  currentUserId: string;
  isTreasurer: boolean;
  onOpenCreateModal: () => void;
  onPayBilling: (billing: DuesBilling) => void;
  onVerifyPayment: (payment: DuesPayment) => void;
  onViewReceipt?: (payment: DuesPayment, billing: DuesBilling) => void;
  onSendReminder?: (billing: DuesBilling) => void;
}

export function DuesBillingList({
  billings,
  payments,
  currentUserId,
  isTreasurer,
  onOpenCreateModal,
  onPayBilling,
  onVerifyPayment,
  onViewReceipt,
  onSendReminder
}: DuesBillingListProps) {
  const pendingPayments = payments.filter(p => p.status === 'pending');

  return (
    <div className="space-y-3">
      {isTreasurer && pendingPayments.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
            <ShieldCheck size={16} />
            <span>Verifikasi Pembayaran Masuk ({pendingPayments.length})</span>
          </div>
          <div className="divide-y divide-amber-200/60 bg-white rounded-lg border border-amber-200 overflow-hidden">
            {pendingPayments.map(p => (
              <div key={p.id} className="p-2 flex items-center justify-between gap-2 text-xs">
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 truncate">{p.userName}</p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {p.duesTitle} • {p.paymentMethod.toUpperCase()} {p.notes && `(${p.notes})`}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-bold text-emerald-600 text-xs">
                    Rp {p.amount.toLocaleString('id-ID')}
                  </span>
                  <button
                    onClick={() => onVerifyPayment(p)}
                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-0.5 shadow-xs"
                  >
                    <CheckCircle2 size={12} /> Verifikasi
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold text-slate-900">Tagihan & Iuran Komunitas</h3>
        {isTreasurer && (
          <button
            onClick={onOpenCreateModal}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
          >
            <Plus size={14} /> Buat Tagihan
          </button>
        )}
      </div>

      <div className="space-y-2">
        {billings.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-1">
            <QrCode className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-500">Belum ada tagihan iuran aktif.</p>
            <p className="text-[10px] text-slate-400">
              {isTreasurer ? 'Klik "Buat Tagihan" untuk membuat iuran warga.' : 'Iuran berkala akan tampil di sini.'}
            </p>
          </div>
        ) : (
          billings.map(b => (
            <BillingItemCard
              key={b.id}
              billing={b}
              payments={payments}
              currentUserId={currentUserId}
              isTreasurer={isTreasurer}
              onPayBilling={onPayBilling}
              onViewReceipt={onViewReceipt}
              onSendReminder={onSendReminder}
            />
          ))
        )}
      </div>
    </div>
  );
}
