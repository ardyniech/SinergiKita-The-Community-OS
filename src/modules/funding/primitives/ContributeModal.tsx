import React, { useState } from 'react';
import { Loader2, HeartHandshake, X } from 'lucide-react';
import { FundingProject } from '../../../shared/models';

interface ContributeModalProps {
  project: FundingProject;
  submitting: boolean;
  onClose: () => void;
  onContribute: (projectId: string, amount: number, message: string) => Promise<void>;
  onSuccess: (amount: number, message: string) => void;
}

const PRESET_AMOUNTS = [25000, 50000, 100000, 250000];

export function ContributeModal({ project, submitting, onClose, onContribute, onSuccess }: ContributeModalProps) {
  const [amount, setAmount] = useState('50000');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount, 10);
    if (!numAmount || numAmount <= 0) return;

    await onContribute(project.id, numAmount, message.trim() || 'Semangat gotong royong!');
    onSuccess(numAmount, message.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-sm bg-white rounded-xl p-3.5 shadow-xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <HeartHandshake size={16} className="text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900">Salurkan Donasi / Patungan</h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>

        <div className="p-2 bg-indigo-50/60 rounded-lg border border-indigo-100">
          <p className="text-[10px] font-bold text-indigo-900 line-clamp-1">{project.title}</p>
          <p className="text-[10px] text-slate-500">Target: Rp {project.targetAmount.toLocaleString('id-ID')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2.5">
          <div>
            <label className="text-[10px] font-bold text-slate-600">Nominal Donasi (Rp)</label>
            <input
              type="number"
              required
              min="1000"
              step="5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-8.5 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-900 outline-none focus:border-indigo-500 mt-0.5"
            />
            <div className="flex gap-1.5 mt-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(String(preset))}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 whitespace-nowrap"
                >
                  Rp {(preset / 1000)}rb
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600">Pesan / Doa Dukungan (Opsional)</label>
            <input
              type="text"
              placeholder="Contoh: Semoga cepat terwujud untuk kenyamanan bersama"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-8.5 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:border-indigo-500 mt-0.5"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !amount || parseInt(amount, 10) <= 0}
            className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs disabled:opacity-50 mt-1"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <HeartHandshake size={14} />}
            <span>Konfirmasi Donasi Warga</span>
          </button>
        </form>
      </div>
    </div>
  );
}
