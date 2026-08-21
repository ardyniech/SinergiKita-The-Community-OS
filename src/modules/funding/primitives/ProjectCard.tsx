import React from 'react';
import { Users, HeartHandshake, TrendingUp } from 'lucide-react';
import { FundingProject } from '../../../shared/models';

interface ProjectCardProps {
  project: FundingProject;
  onContribute: (project: FundingProject) => void;
}

export function ProjectCard({ project, onContribute }: ProjectCardProps) {
  const percent = Math.min(100, Math.round((project.collectedAmount / project.targetAmount) * 100));

  return (
    <div className="card-3d p-4 bg-white/60 border-white/60 shadow-3d-sm space-y-4 hover:shadow-3d-lg transition-all group">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 text-[8px] font-black uppercase tracking-widest">
            {project.category}
          </span>
          <h3 className="text-[13px] font-black text-slate-900 mt-1.5 uppercase tracking-tight truncate">{project.title}</h3>
          <p className="text-[10px] font-bold text-slate-500 mt-1 line-clamp-2 leading-snug opacity-80">{project.description}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Terkumpul</span>
            <span className="text-sm font-black text-emerald-600 tabular-nums">Rp {project.collectedAmount.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Target</span>
            <span className="text-[11px] font-black text-slate-400 tabular-nums">Rp {project.targetAmount.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div className="w-full bg-slate-100/50 h-2.5 rounded-full overflow-hidden shadow-inner border border-slate-200/50">
          <div 
            className="bg-emerald-500 h-full transition-all duration-700 shadow-[0_0_8px_rgba(16,185,129,0.4)] relative" 
            style={{ width: `${percent}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase tracking-widest">
            <TrendingUp size={10} /> {percent}% Tercapai
          </div>
          <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">
            <Users size={10} /> 12+ Warga Patungan
          </div>
        </div>
      </div>

      <button
        onClick={() => onContribute(project)}
        className="btn-3d w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-3d-sm transition active:translate-y-0.5"
      >
        <HeartHandshake size={16} /> Ikut Patungan Warga
      </button>
    </div>
  );
}
