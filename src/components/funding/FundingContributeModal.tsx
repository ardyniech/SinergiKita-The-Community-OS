import React, { useState } from 'react';
import { X, HeartHandshake, Loader2 } from 'lucide-react';
import { FundingProject } from '../../types';
import { useToast } from '../../context/ToastContext';

interface FundingContributeModalProps {
  project: FundingProject;
  onClose: () => void;
  onSubmit: (project: FundingProject, amount: number) => Promise<void>;
}

export function FundingContributeModal({ project, onClose, onSubmit }: FundingContributeModalProps) {
  const { showToast } = useToast();
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showToast("Nominal patungan tidak valid");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(project, numAmount);
      onClose();
    } catch (err) {
      showToast("Gagal memproses patungan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
            Patungan Inisiatif
          </h3>
          <button onClick={onClose} className="text-slate-400 p-1"><X size={16} /></button>
        </div>

        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-100 dark:border-emerald-900">
          <h4 className="text-xs font-black text-emerald-800 dark:text-emerald-300">{project.title}</h4>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
            Target: Rp {project.target.toLocaleString('id-ID')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase">Nominal Patungan (Rp)</label>
            <input
              type="number"
              required
              placeholder="Contoh: 50000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-black tabular-nums"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <HeartHandshake size={14} />} Konfirmasi Patungan
          </button>
        </form>
      </div>
    </div>
  );
}
