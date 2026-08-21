import React from 'react';
import { ShieldAlert, BellRing } from 'lucide-react';

interface EmergencyHeaderProps {
  activeCount: number;
}

export function EmergencyHeader({ activeCount }: EmergencyHeaderProps) {
  return (
    <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
          <ShieldAlert size={18} />
        </div>
        <div>
          <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase">
            Sistem Tanggap Darurat (SOS)
          </h2>
          <p className="text-[10px] text-slate-500">Tombol Bahaya Siaga 24 Jam</p>
        </div>
      </div>

      {activeCount > 0 && (
        <span className="px-2.5 py-1 bg-rose-600 text-white rounded-full text-[10px] font-black animate-pulse flex items-center gap-1">
          <BellRing size={12} /> {activeCount} DARURAT
        </span>
      )}
    </div>
  );
}
