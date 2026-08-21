import React from 'react';
import { FileCheck, RefreshCw } from 'lucide-react';
import { getMonthName } from '../logic/lpjUtils';

interface LPJHeaderProps {
  month: number;
  year: number;
  onMonthChange: (m: number) => void;
  onYearChange: (y: number) => void;
  onRefresh: () => void;
  loading: boolean;
}

export const LPJHeader: React.FC<LPJHeaderProps> = ({
  month,
  year,
  onMonthChange,
  onYearChange,
  onRefresh,
  loading
}) => {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = [2025, 2026, 2027];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FileCheck size={18} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900">Laporan Pertanggungjawaban (LPJ)</h2>
            <p className="text-[10px] text-slate-500">Rekapitulasi Keuangan, Dues, Surat & Ronda</p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-1.5 text-slate-500 hover:text-indigo-600 bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
        <select
          value={month}
          onChange={(e) => onMonthChange(Number(e.target.value))}
          className="flex-1 text-xs p-1.5 rounded-md border-none bg-white font-bold text-slate-700 focus:outline-none"
        >
          {months.map((m) => (
            <option key={m} value={m}>{getMonthName(m)}</option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => onYearChange(Number(e.target.value))}
          className="w-20 text-xs p-1.5 rounded-md border-none bg-white font-bold text-slate-700 focus:outline-none"
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
    </div>
  );
};
