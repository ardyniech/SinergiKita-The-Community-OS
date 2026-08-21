import React from 'react';
import { FileText, Plus, ShieldCheck } from 'lucide-react';

interface LetterHeaderProps {
  activeTab: 'my' | 'manage';
  onTabChange: (tab: 'my' | 'manage') => void;
  onRequestNew: () => void;
  isAdmin: boolean;
  pendingCount: number;
}

export const LetterHeader: React.FC<LetterHeaderProps> = ({
  activeTab,
  onTabChange,
  onRequestNew,
  isAdmin,
  pendingCount
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FileText size={18} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900">Layanan Surat RT/RW</h2>
            <p className="text-[10px] text-slate-500">Pengantar & Keterangan Resmi Warga</p>
          </div>
        </div>

        <button
          onClick={onRequestNew}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition-colors"
        >
          <Plus size={13} />
          <span>Ajukan Surat</span>
        </button>
      </div>

      {isAdmin && (
        <div className="flex p-0.5 bg-slate-100 rounded-lg">
          <button
            onClick={() => onTabChange('my')}
            className={`flex-1 py-1.5 text-[11px] font-bold rounded-md transition-all ${
              activeTab === 'my' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Pengajuan Saya
          </button>
          <button
            onClick={() => onTabChange('manage')}
            className={`flex-1 py-1.5 text-[11px] font-bold rounded-md transition-all flex items-center justify-center gap-1 ${
              activeTab === 'manage' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ShieldCheck size={12} />
            <span>Verifikasi Pengurus</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[9px] font-bold rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
