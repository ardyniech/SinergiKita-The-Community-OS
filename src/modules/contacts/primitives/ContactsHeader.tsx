import React from 'react';
import { PhoneCall, Plus } from 'lucide-react';

interface ContactsHeaderProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onAddNew: () => void;
  isAdmin: boolean;
}

export const ContactsHeader: React.FC<ContactsHeaderProps> = ({
  selectedCategory,
  onSelectCategory,
  onAddNew,
  isAdmin
}) => {
  const categories = [
    { key: 'all', label: 'Semua' },
    { key: 'darurat', label: 'Darurat' },
    { key: 'kesehatan', label: 'Kesehatan' },
    { key: 'keamanan', label: 'Keamanan' },
    { key: 'layanan_publik', label: 'Layanan Publik' },
    { key: 'fasilitas_rt', label: 'Fasilitas RT' },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <PhoneCall size={18} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900">Kontak Darurat & Fasilitas</h2>
            <p className="text-[10px] text-slate-500">Puskesmas, Polsek, PLN, Pemadam & RT</p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={onAddNew}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition-colors"
          >
            <Plus size={13} />
            <span>Tambah Kontak</span>
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
                ? 'bg-white text-rose-700 shadow-xs'
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
