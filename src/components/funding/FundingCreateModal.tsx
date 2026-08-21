import React, { useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface FundingCreateModalProps {
  onClose: () => void;
  onSubmit: (data: { title: string; target: number; category: string; description: string }) => Promise<void>;
}

export function FundingCreateModal({ onClose, onSubmit }: FundingCreateModalProps) {
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [category, setCategory] = useState('Sosial & Fasilitas');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numTarget = Number(target);
    if (!title.trim() || isNaN(numTarget) || numTarget <= 0) {
      showToast("Judul dan target wajib diisi");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), target: numTarget, category, description: description.trim() });
      onClose();
    } catch (err) {
      showToast("Gagal menerbitkan inisiatif");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
            Terbitkan Inisiatif Patungan Baru
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase">Nama Inisiatif</label>
            <input
              type="text"
              required
              placeholder="Contoh: Perbaikan Pos Kamling RT 03"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase">Target Dana (Rp)</label>
            <input
              type="number"
              required
              placeholder="Contoh: 2500000"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
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
              <option value="Sosial & Fasilitas">Sosial & Fasilitas</option>
              <option value="Kegiatan Warga">Kegiatan Warga</option>
              <option value="Bencana & Tanggap">Bencana & Tanggap</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase">Deskripsi Ringkas</label>
            <textarea
              rows={3}
              placeholder="Jelaskan kebutuhan dan tujuan patungan ini..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Terbitkan Inisiatif
          </button>
        </form>
      </div>
    </div>
  );
}
