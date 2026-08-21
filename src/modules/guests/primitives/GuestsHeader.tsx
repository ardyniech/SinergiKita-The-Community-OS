import React from 'react';
import { UserPlus, Plus, ShieldCheck } from 'lucide-react';

interface GuestsHeaderProps {
  activeTab: 'my' | 'manage';
  onTabChange: (tab: 'my' | 'manage') => void;
  onReportNew: () => void;
  isAdmin: boolean;
  activeCount: number;
}

export const GuestsHeader: React.FC<GuestsHeaderProps> = ({
  activeTab,
  onTabChange,
  onReportNew,
  isAdmin,
  activeCount
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
            <UserPlus size={18} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900">Wajib Lapor Tamu 1x24 Jam</h2>
            <p className="text-[10px] text-slate-500">Ketertiban & Keamanan Lingkungan</p>
          </div>
        </div>

        <button
          onClick={onReportNew}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition-colors"
        >
          <Plus size={13} />
          <span>Lapor Tamu</span>
        </button>
      </div>

      {isAdmin && (
        <div className="flex p-0.5 bg-slate-100 rounded-lg">
          <button
            onClick={() => onTabChange('my')}
            className={`flex-1 py-1.5 text-[11px] font-bold rounded-md transition-all ${
              activeTab === 'my' ? 'bg-white text-teal-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Laporan Saya
          </button>
          <button
            onClick={() => onTabChange('manage')}
            className={`flex-1 py-1.5 text-[11px] font-bold rounded-md transition-all flex items-center justify-center gap-1 ${
              activeTab === 'manage' ? 'bg-white text-teal-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ShieldCheck size={12} />
            <span>Semua Tamu Menginap</span>
            {activeCount > 0 && (
              <span className="px-1.5 py-0.2 bg-teal-600 text-white text-[9px] font-bold rounded-full">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
