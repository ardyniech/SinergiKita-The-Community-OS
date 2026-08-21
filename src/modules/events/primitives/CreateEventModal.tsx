import React, { useState } from 'react';
import { X, Calendar, Plus, AlertCircle } from 'lucide-react';
import { EventCategory } from '../../../shared/models/events';
import { getCategoryLabel } from '../logic/eventUtils';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    category: EventCategory;
    date: string;
    time: string;
    location: string;
    description?: string;
  }) => Promise<void>;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('kerja_bakti');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('08:00');
  const [location, setLocation] = useState('Balai Warga RT/RW');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim()) {
      setError('Judul dan lokasi kegiatan wajib diisi');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onSubmit({ title, category, date, time, location, description });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal membuat agenda');
    } finally {
      setLoading(false);
    }
  };

  const categories: EventCategory[] = [
    'kerja_bakti', 'rapat', 'posyandu', 'senam', 'keagamaan', 'perayaan', 'umum'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
        <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900">Buat Agenda Kegiatan Warga</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:bg-slate-200 rounded-full">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3.5 space-y-2.5">
          {error && (
            <div className="p-2 bg-rose-50 text-rose-700 text-[11px] rounded-lg flex items-center gap-1.5">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-1">Judul Agenda / Acara</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Kerja Bakti Bersihkan Saluran Air"
              className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-1">Kategori Kegiatan</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as EventCategory)}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-1">Tanggal</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-1">Jam (WIB)</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-1">Lokasi Kegiatan</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Contoh: Lapangan Serbaguna RT 03"
              className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-1">Keterangan / Imbauan (Opsional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Harap membawa cangkul dan perlengkapan kebersihan masing-masing."
              rows={2}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs disabled:opacity-50"
            >
              <Plus size={13} />
              <span>{loading ? 'Menyimpan...' : 'Terbitkan Agenda'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
