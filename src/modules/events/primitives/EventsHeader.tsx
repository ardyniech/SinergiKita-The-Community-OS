import React from 'react';
import { Calendar, Plus } from 'lucide-react';
import { EventCategory } from '../../../shared/models/events';

interface EventsHeaderProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onCreateNew: () => void;
  isAdmin: boolean;
}

export const EventsHeader: React.FC<EventsHeaderProps> = ({
  selectedCategory,
  onSelectCategory,
  onCreateNew,
  isAdmin
}) => {
  const categories: { key: string; label: string }[] = [
    { key: 'all', label: 'Semua' },
    { key: 'kerja_bakti', label: 'Kerja Bakti' },
    { key: 'rapat', label: 'Rapat' },
    { key: 'posyandu', label: 'Posyandu' },
    { key: 'senam', label: 'Senam' },
    { key: 'keagamaan', label: 'Keagamaan' },
    { key: 'perayaan', label: 'Perayaan' },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Calendar size={18} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900">Agenda & Kegiatan Warga</h2>
            <p className="text-[10px] text-slate-500">Kerja Bakti, Posyandu, Rapat & Acara RT</p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={onCreateNew}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition-colors"
          >
            <Plus size={13} />
            <span>Buat Agenda</span>
          </button>
        )}
      </div>

      <div className="flex p-0.5 bg-slate-100 rounded-lg overflow-x-auto gap-0.5 scrollbar-none">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => onSelectCategory(c.key)}
            className={`whitespace-nowrap px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
              selectedCategory === c.key
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
};
