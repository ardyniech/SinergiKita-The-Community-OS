import React, { useState } from 'react';
import { Plus, Navigation } from 'lucide-react';

interface Props {
  isSubmitting: boolean;
  onSubmit: (destination: string) => void;
}

export const WatchRequestForm: React.FC<Props> = ({ isSubmitting, onSubmit }) => {
  const [destination, setDestination] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;
    onSubmit(destination);
    setDestination('');
  };

  return (
    <form onSubmit={submit} className="p-3 bg-white border border-slate-100 rounded-xl shadow-xs space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
        <Navigation size={14} className="text-indigo-600 animate-pulse" />
        <span>Minta Pantau Perjalanan (Jalur Rawan)</span>
      </div>
      <div className="flex gap-2">
        <input
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Contoh: Kalideres ke Cengkareng (jalan gelap)"
          className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs focus:outline-none focus:border-indigo-500 placeholder-slate-400"
          disabled={isSubmitting}
        />
        <button type="submit" disabled={isSubmitting} className="px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95 disabled:opacity-50">
          <Plus size={14} /><span>Kirim</span>
        </button>
      </div>
    </form>
  );
};
