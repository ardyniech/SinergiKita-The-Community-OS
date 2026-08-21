import React, { useState } from 'react';
import { PlusCircle, X, Check } from 'lucide-react';
import { Transaction } from '../../../shared/models';

interface TransactionFormProps {
  onAdd: (data: Partial<Transaction>) => Promise<void>;
  onCancel: () => void;
  recordedByName?: string;
}

export function TransactionForm({ onAdd, onCancel, recordedByName }: TransactionFormProps) {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'credit' | 'debit'>('credit');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim() || !amount || Number(amount) <= 0) return;
    setSubmitting(true);
    try {
      await onAdd({
        description: desc.trim(),
        amount: Number(amount),
        type,
        date,
        status: 'completed',
        recordedBy: recordedByName || 'Bendahara'
      });
      onCancel();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-blue-200 rounded-xl p-3 shadow-sm space-y-2.5 animate-in fade-in">
      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
        <div className="flex items-center gap-1.5 text-blue-700">
          <PlusCircle size={16} />
          <h4 className="text-xs font-bold">Catat Mutasi Kas Baru</h4>
        </div>
        <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600 p-1">
          <X size={16} />
        </button>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500">Keterangan Transaksi</label>
        <input
          type="text"
          required
          placeholder="Contoh: Beli Lampu Pos Ronda / Iuran Sukarela"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500">Jumlah (Rp)</label>
          <input
            type="number"
            required
            min="1000"
            placeholder="50000"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500">Jenis Mutasi</label>
          <select
            value={type}
            onChange={e => setType(e.target.value as 'credit' | 'debit')}
            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
          >
            <option value="credit">Pemasukan (+)</option>
            <option value="debit">Pengeluaran (-)</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500">Tanggal</label>
        <input
          type="date"
          required
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
        />
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs text-slate-600 font-semibold hover:bg-slate-100 rounded-lg"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1"
        >
          <Check size={14} />
          {submitting ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}
