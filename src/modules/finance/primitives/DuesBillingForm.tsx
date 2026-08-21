import React, { useState } from 'react';
import { PlusCircle, X, Check } from 'lucide-react';
import { DuesBilling } from '../../../shared/models';

interface DuesBillingFormProps {
  onCreate: (data: Omit<DuesBilling, 'id' | 'createdAt' | 'tenantId'>) => Promise<void>;
  onCancel: () => void;
  creatorName: string;
}

export function DuesBillingForm({ onCreate, onCancel, creatorName }: DuesBillingFormProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState('Bulan Ini');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0) return;
    setSubmitting(true);
    try {
      await onCreate({
        title: title.trim(),
        amount: Number(amount),
        period: period.trim(),
        dueDate,
        createdBy: creatorName,
        status: 'active'
      });
      onCancel();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl max-w-sm w-full p-4 shadow-xl border border-slate-200 space-y-2.5">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
          <div className="flex items-center gap-1.5 text-blue-600">
            <PlusCircle size={17} />
            <h3 className="text-xs font-bold text-slate-900">Buat Tagihan Kas Warga</h3>
          </div>
          <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-0.5">
          <label className="text-[10px] font-bold text-slate-500">Nama Iuran</label>
          <input
            type="text" required placeholder="Contoh: Iuran Kebersihan & Keamanan"
            value={title} onChange={e => setTitle(e.target.value)}
            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-0.5">
            <label className="text-[10px] font-bold text-slate-500">Nominal (Rp)</label>
            <input
              type="number" required min="1000" placeholder="25000"
              value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
            />
          </div>
          <div className="space-y-0.5">
            <label className="text-[10px] font-bold text-slate-500">Periode</label>
            <input
              type="text" required placeholder="Agustus 2026"
              value={period} onChange={e => setPeriod(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
            />
          </div>
        </div>

        <div className="space-y-0.5">
          <label className="text-[10px] font-bold text-slate-500">Batas Waktu</label>
          <input
            type="date" required value={dueDate} onChange={e => setDueDate(e.target.value)}
            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button type="button" onClick={onCancel} className="px-3 py-1.5 text-xs text-slate-600 font-semibold hover:bg-slate-100 rounded-lg">
            Batal
          </button>
          <button type="submit" disabled={submitting} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1">
            <Check size={14} />
            {submitting ? 'Menyimpan...' : 'Terbitkan Tagihan'}
          </button>
        </div>
      </form>
    </div>
  );
}
