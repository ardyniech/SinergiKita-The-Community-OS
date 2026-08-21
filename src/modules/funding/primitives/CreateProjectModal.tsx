import React, { useState } from 'react';
import { Loader2, Plus, X } from 'lucide-react';
import { FundingProject } from '../../../shared/models';

interface CreateProjectModalProps {
  submitting: boolean;
  onClose: () => void;
  onCreate: (data: Partial<FundingProject>) => Promise<void>;
}

export function CreateProjectModal({ submitting, onClose, onCreate }: CreateProjectModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('5000000');
  const [category, setCategory] = useState<FundingProject['category']>('social');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numTarget = parseInt(targetAmount, 10);
    if (!title.trim() || !numTarget || numTarget <= 0) return;

    await onCreate({
      title: title.trim(),
      description: description.trim(),
      targetAmount: numTarget,
      category,
      deadline: deadline || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-sm bg-white rounded-xl p-3.5 shadow-xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-900">Buat Inisiatif Crowdfunding</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2.5">
          <div>
            <label className="text-[10px] font-bold text-slate-600">Nama Inisiatif / Proyek</label>
            <input
              type="text"
              required
              placeholder="Contoh: Renovasi Pos Ronda RT 05"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-8.5 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:border-indigo-500 mt-0.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-600">Target Dana (Rp)</label>
              <input
                type="number"
                required
                min="10000"
                step="50000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full h-8.5 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 mt-0.5"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-600">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full h-8.5 px-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 mt-0.5"
              >
                <option value="social">Sosial</option>
                <option value="infrastructure">Fasilitas/Fisik</option>
                <option value="event">Acara Warga</option>
                <option value="business">Usaha Bersama</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600">Deskripsi & Rincian Penggunaan</label>
            <textarea
              required
              rows={2}
              placeholder="Jelaskan kebutuhan proyek dan transparansi anggaran..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:border-indigo-500 mt-0.5 resize-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600">Target Tanggal Selesai (Opsional)</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full h-8.5 px-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:border-indigo-500 mt-0.5"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !title.trim()}
            className="w-full h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs disabled:opacity-50 mt-1"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            <span>Publikasikan Proyek</span>
          </button>
        </form>
      </div>
    </div>
  );
}
