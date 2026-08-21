import React from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { useFinanceAddForm } from './useFinanceAddForm';

interface FinanceAddFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
  categories: string[];
}

export function FinanceAddFormModal({ onClose, onSuccess, categories }: FinanceAddFormModalProps) {
  const {
    type,
    setType,
    amount,
    setAmount,
    description,
    setDescription,
    category,
    setCategory,
    submitting,
    handleSubmit
  } = useFinanceAddForm(onClose, onSuccess);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
            Catat Transaksi Buku Kas
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`min-h-[44px] rounded-lg text-xs font-black transition ${
                type === 'income' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
              }`}
            >
              Pemasukan (+)
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`min-h-[44px] rounded-lg text-xs font-black transition ${
                type === 'expense' ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
              }`}
            >
              Pengeluaran (-)
            </button>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase">Nominal (Rp)</label>
            <input
              type="number"
              required
              placeholder="Contoh: 100000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-black tabular-nums"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase">Keterangan Transaksi</label>
            <input
              type="text"
              required
              placeholder="Contoh: Iuran warga RT 05 Masehi"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full min-h-[44px] bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Simpan Transaksi
          </button>
        </form>
      </div>
    </div>
  );
}
