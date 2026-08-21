import React, { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';

interface DepositFormProps {
  onDeposit: (amount: number, note: string) => Promise<void>;
  submitting: boolean;
}

export function DepositForm({ onDeposit, submitting }: DepositFormProps) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    await onDeposit(Number(amount), note || 'Simpanan Sukarela');
    setAmount('');
    setNote('');
  };

  return (
    <div className="card-3d p-4 bg-white/60 border-white/80 shadow-3d-sm space-y-4">
      <div className="flex flex-col">
        <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.1em]">Setoran Modal</h3>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1 opacity-70">Penguatan Likuiditas Komunitas</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Nominal (Rp)</label>
          <input
            type="number"
            required
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full h-12 px-4 bg-white/50 border border-slate-200 rounded-2xl text-[13px] font-black outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-slate-300"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Deskripsi</label>
          <input
            type="text"
            placeholder="Contoh: Simpanan Wajib Mei"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full h-12 px-4 bg-white/50 border border-slate-200 rounded-2xl text-[11px] font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-slate-300"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !amount}
          className="btn-3d w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-3d-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:grayscale"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} 
          Verifikasi Setoran
        </button>
      </form>
    </div>
  );
}
