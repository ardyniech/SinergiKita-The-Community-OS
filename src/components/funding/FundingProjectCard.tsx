import React from 'react';
import { Users, HeartHandshake } from 'lucide-react';
import { FundingProject } from '../../types';

interface FundingProjectCardProps {
  project: FundingProject;
  onContribute: (project: FundingProject) => void;
}

export function FundingProjectCard({ project, onContribute }: FundingProjectCardProps) {
  const percent = Math.min(100, Math.round((project.current / project.target) * 100));

  return (
    <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
      <div className="flex justify-between items-start gap-2">
        <div>
          <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded text-[9px] font-bold uppercase">
            {project.category}
          </span>
          <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 mt-1">{project.title}</h3>
          <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{project.description}</p>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-bold">
          <span className="text-slate-500">Terkumpul: <strong className="text-emerald-600">Rp {project.current.toLocaleString('id-ID')}</strong></span>
          <span className="text-slate-400">Target: Rp {project.target.toLocaleString('id-ID')}</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${percent}%` }} />
        </div>
        <div className="flex justify-between items-center text-[9px] text-slate-400">
          <span>{percent}% Tercapai</span>
          <span className="flex items-center gap-1"><Users size={10} /> {project.backers} Warga Patungan</span>
        </div>
      </div>

      <button
        onClick={() => onContribute(project)}
        className="w-full min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer"
      >
        <HeartHandshake size={14} /> Ikut Patungan Warga
      </button>
    </div>
  );
}
