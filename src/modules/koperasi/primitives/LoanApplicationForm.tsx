import React, { useState } from 'react';
import { Check, Loader2, Calculator } from 'lucide-react';
import { calculateLoanInstallment } from '../logic/koperasiUtils';

interface LoanApplicationFormProps {
  submitting: boolean;
  onApply: (amount: number, tenor: number, purpose: string, guarantor: string) => Promise<void>;
  onCancel: () => void;
}

export function LoanApplicationForm({ submitting, onApply, onCancel }: LoanApplicationFormProps) {
  const [amount, setAmount] = useState('1000000');
  const [tenor, setTenor] = useState('3');
  const [purpose, setPurpose] = useState('');
  const [guarantor, setGuarantor] = useState('');

  const numAmount = Math.max(0, parseInt(amount, 10) || 0);
  const numTenor = Math.max(1, parseInt(tenor, 10) || 1);
  const sim = calculateLoanInstallment(numAmount, numTenor);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0 || !purpose.trim()) return;
    await onApply(numAmount, numTenor, purpose.trim(), guarantor.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="bg-indigo-50/60 border border-indigo-200/80 rounded-xl p-3 space-y-3 animate-in fade-in">
      <div className="flex items-center justify-between pb-1 border-b border-indigo-100">
        <h4 className="text-xs font-bold text-indigo-950">Form Permohonan Pinjaman</h4>
        <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600 text-xs">
          Batal
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-bold text-slate-600">Nominal Pinjaman (Rp)</label>
          <input
            type="number"
            required
            step="50000"
            min="100000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-600">Tenor (Bulan)</label>
          <select
            value={tenor}
            onChange={(e) => setTenor(e.target.value)}
            className="w-full h-9 px-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 outline-none focus:border-indigo-500"
          >
            {[1, 2, 3, 6, 10, 12].map(m => (
              <option key={m} value={m}>{m} Bulan</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold text-slate-600">Tujuan Penggunaan Modal</label>
        <input
          type="text"
          required
          placeholder="Misal: Modal Usaha Warung / Dagang"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="text-[10px] font-bold text-slate-600">Penjamin / Kontak Darurat (Opsional)</label>
        <input
          type="text"
          placeholder="Nama warga penjamin / tetangga"
          value={guarantor}
          onChange={(e) => setGuarantor(e.target.value)}
          className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:border-indigo-500"
        />
      </div>

      <div className="bg-white p-2 rounded-lg border border-indigo-100 text-xs flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-indigo-900 font-semibold text-[11px]">
          <Calculator size={13} className="text-indigo-600" />
          <span>Simulasi Angsuran:</span>
        </div>
        <span className="font-black text-indigo-700">
          Rp {sim.monthlyTotal.toLocaleString('id-ID')} / bulan
        </span>
      </div>

      <button
        type="submit"
        disabled={submitting || numAmount <= 0 || !purpose.trim()}
        className="w-full h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
      >
        {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
        <span>Ajukan Pinjaman Modal</span>
      </button>
    </form>
  );
}
