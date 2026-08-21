import React, { useState } from 'react';
import { X, QrCode, Check } from 'lucide-react';
import { Tenant, DuesBilling } from '../../../shared/models';
import { QrisDisplayCard } from './QrisDisplayCard';

interface QrisPaymentModalProps {
  tenant: Tenant | null;
  billings: DuesBilling[];
  selectedBilling?: DuesBilling | null;
  userName: string;
  userId: string;
  onSubmitPayment: (data: { duesId: string; duesTitle: string; amount: number; paymentMethod: 'qris' | 'transfer' | 'cash'; notes?: string }) => Promise<void>;
  onClose: () => void;
}

export function QrisPaymentModal({
  tenant, billings, selectedBilling, onSubmitPayment, onClose
}: QrisPaymentModalProps) {
  const [activeDuesId, setActiveDuesId] = useState<string>(selectedBilling?.id || billings[0]?.id || 'custom');
  const activeBilling = billings.find(b => b.id === activeDuesId);
  const [customAmount, setCustomAmount] = useState<string>(selectedBilling?.amount?.toString() || billings[0]?.amount?.toString() || '25000');
  const [method, setMethod] = useState<'qris' | 'transfer' | 'cash'>('qris');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const amountToPay = activeBilling ? activeBilling.amount : Number(customAmount) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amountToPay <= 0) return;
    setSubmitting(true);
    try {
      await onSubmitPayment({
        duesId: activeDuesId,
        duesTitle: activeBilling?.title || 'Iuran Kas Komunitas',
        amount: amountToPay,
        paymentMethod: method,
        notes: notes.trim() || undefined
      });
      setSubmitted(true);
      setTimeout(onClose, 1500);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-sm w-full p-4 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-2.5">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
          <div className="flex items-center gap-1.5 text-blue-600">
            <QrCode size={18} />
            <h3 className="text-xs font-bold text-slate-900">Pembayaran Iuran Kas</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1"><X size={16} /></button>
        </div>

        {submitted ? (
          <div className="py-6 text-center space-y-1.5">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto"><Check size={20} /></div>
            <h4 className="text-xs font-bold text-slate-900">Konfirmasi Terkirim!</h4>
            <p className="text-[10px] text-slate-500">Bendahara akan memverifikasi pembayaran Anda.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2">
            {billings.length > 0 && (
              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-slate-500">Pilih Tagihan</label>
                <select
                  value={activeDuesId}
                  onChange={e => {
                    setActiveDuesId(e.target.value);
                    const b = billings.find(item => item.id === e.target.value);
                    if (b) setCustomAmount(b.amount.toString());
                  }}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                >
                  {billings.map(b => (
                    <option key={b.id} value={b.id}>{b.title} (Rp {b.amount.toLocaleString('id-ID')})</option>
                  ))}
                  <option value="custom">Iuran Sukarela / Nominal Lain</option>
                </select>
              </div>
            )}

            <QrisDisplayCard tenant={tenant} />

            <div className="space-y-0.5">
              <label className="text-[10px] font-bold text-slate-500">Metode Bayar</label>
              <div className="grid grid-cols-3 gap-1">
                {(['qris', 'transfer', 'cash'] as const).map(m => (
                  <button
                    key={m} type="button" onClick={() => setMethod(m)}
                    className={`py-1 rounded-lg text-xs font-bold capitalize transition-colors ${
                      method === m ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {m === 'qris' ? 'QRIS' : m === 'transfer' ? 'Transfer' : 'Tunai'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-0.5">
              <label className="text-[10px] font-bold text-slate-500">Catatan / Alamat Rumah</label>
              <input
                type="text" placeholder="Contoh: Blok B No 4" value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
              />
            </div>

            <button
              type="submit" disabled={submitting}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1 transition-colors"
            >
              <Check size={14} />
              {submitting ? 'Mengirim...' : `Konfirmasi Bayar Rp ${amountToPay.toLocaleString('id-ID')}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
