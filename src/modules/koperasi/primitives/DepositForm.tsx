import React, { useState } from 'react';
import { Plus, Loader2, PiggyBank } from 'lucide-react';

interface DepositFormProps {
  onDeposit: (amount: number, note: string) => Promise<void>;
  submitting: boolean;
}

const DEPOSIT_PRESETS = [20000, 50000, 100000, 200000];

export function DepositForm({ onDeposit, submitting }: DepositFormProps) {
  const [depositType, setDepositType] = useState('Simpanan Wajib');
  const [amount, setAmount] = useState('50000');
  const [note, setNote] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount, 10);
    if (!numAmount || numAmount <= 0) return;
    const fullNote = note.trim() ? `${depositType} - ${note.trim()}` : depositType;
    await onDeposit(numAmount, fullNote);
    setNote('');
  };

  return (
    <div className="bg-white/80 border border-slate-200/80 rounded-xl p-3 shadow-xs space-y-3">
      <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <PiggyBank size={16} />
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-900">Setor Simpanan Koperasi</h3>
          <p className="text-[10px] text-slate-500">Kuatkan modal bersama dan tingkatkan porsi SHU Anda</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-[10px] font-bold text-slate-600">Jenis Simpanan</label>
          <div className="grid grid-cols-3 gap-1.5 mt-1">
            {['Simpanan Wajib', 'Simpanan Sukarela', 'Simpanan Pokok'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setDepositType(type)}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-bold text-center border transition-all ${
                  depositType === type
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {type.replace('Simpanan ', '')}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-600">Nominal Setoran (Rp)</label>
          <input
            type="number"
            required
            min="1000"
            step="1000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 outline-none focus:border-emerald-500 mt-1"
          />
          <div className="flex gap-1.5 mt-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {DEPOSIT_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(String(preset))}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-semibold text-slate-700 whitespace-nowrap"
              >
                Rp {(preset / 1000)}rb
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-600">Catatan / Periode (Opsional)</label>
          <input
            type="text"
            placeholder="Contoh: Iuran Wajib Bulan Agustus"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:border-emerald-500 mt-1"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !amount || parseInt(amount, 10) <= 0}
          className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
        >
          {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          <span>Konfirmasi Setoran</span>
        </button>
      </form>
    </div>
  );
}
