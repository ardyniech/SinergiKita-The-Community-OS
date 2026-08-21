import React, { useState } from 'react';
import { Loader2, Plus, X, Trash2 } from 'lucide-react';
import { Poll } from '../../../shared/models';

interface CreatePollModalProps {
  submitting: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Poll>) => Promise<void>;
}

export function CreatePollModal({ submitting, onClose, onSubmit }: CreatePollModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Poll['category']>('rembuk_rt');
  const [options, setOptions] = useState<string[]>(['Setuju', 'Tidak Setuju']);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);

  const handleAddOption = () => { if (options.length < 5) setOptions([...options, '']); };
  const handleRemoveOption = (idx: number) => { if (options.length > 2) setOptions(options.filter((_, i) => i !== idx)); };
  const handleOptionChange = (idx: number, val: string) => {
    const next = [...options];
    next[idx] = val;
    setOptions(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = options.map(o => o.trim()).filter(Boolean);
    if (!title.trim() || valid.length < 2) return;
    await onSubmit({
      title: title.trim(), category, endDate,
      options: valid.map((text, idx) => ({ id: `opt_${idx + 1}`, text, voteCount: 0 }))
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-sm bg-white rounded-xl p-3.5 shadow-xl border border-slate-200 space-y-2.5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-900">Buat Rembuk & E-Voting</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          <div>
            <label className="text-[10px] font-bold text-slate-600">Topik / Pertanyaan Musyawarah</label>
            <input
              type="text" required placeholder="Contoh: Jadwal Kerja Bakti Bulanan"
              value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full h-8.5 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:border-indigo-500 mt-0.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-600">Kategori</label>
              <select
                value={category} onChange={(e) => setCategory(e.target.value as any)}
                className="w-full h-8.5 px-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 mt-0.5"
              >
                <option value="rembuk_rt">Rembuk RT / RW</option>
                <option value="pemilihan">Pemilihan Pengurus</option>
                <option value="keamanan">Keamanan</option>
                <option value="fasilitas">Fasilitas</option>
                <option value="anggaran">Anggaran</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-600">Batas Waktu</label>
              <input
                type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-8.5 px-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-indigo-500 mt-0.5"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-600">Pilihan (Min 2, Max 5)</label>
              {options.length < 5 && (
                <button type="button" onClick={handleAddOption} className="text-[10px] font-bold text-indigo-600 hover:underline">+ Tambah Opsi</button>
              )}
            </div>
            <div className="space-y-1.5 mt-1">
              {options.map((opt, idx) => (
                <div key={idx} className="flex gap-1.5 items-center">
                  <input
                    type="text" required placeholder={`Pilihan ${idx + 1}`} value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    className="flex-1 h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:border-indigo-500"
                  />
                  {options.length > 2 && (
                    <button type="button" onClick={() => handleRemoveOption(idx)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit" disabled={submitting || !title.trim()}
            className="w-full h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs disabled:opacity-50 mt-1"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            <span>Publikasikan Rembuk</span>
          </button>
        </form>
      </div>
    </div>
  );
}
