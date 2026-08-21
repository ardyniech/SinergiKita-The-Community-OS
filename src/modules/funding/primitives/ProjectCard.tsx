import React, { useState } from 'react';
import { Users, HeartHandshake, TrendingUp, Share2, Check } from 'lucide-react';
import { FundingProject } from '../../../shared/models';
import { calculateProjectProgress, generateProjectShareText } from '../logic/fundingUtils';

interface ProjectCardProps {
  project: FundingProject;
  tenantName?: string;
  onContribute: (project: FundingProject) => void;
}

export function ProjectCard({ project, tenantName = 'Komunitas Warga', onContribute }: ProjectCardProps) {
  const [copied, setCopied] = useState(false);
  const progress = calculateProjectProgress(project.collectedAmount, project.targetAmount);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = generateProjectShareText({
      tenantName,
      projectTitle: project.title,
      category: project.category,
      targetAmount: project.targetAmount,
      collectedAmount: project.collectedAmount,
      percent: progress.percent
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs space-y-3">
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100 text-[10px] font-bold capitalize">
              {project.category}
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
              {progress.donorBadge}
            </span>
          </div>
          <h3 className="text-xs font-bold text-slate-900 mt-1 truncate">{project.title}</h3>
          <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">{project.description}</p>
        </div>

        <button
          type="button"
          onClick={handleShare}
          className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition-colors shrink-0"
          title="Bagikan ke WhatsApp"
        >
          {copied ? <Check size={13} className="text-emerald-600" /> : <Share2 size={13} />}
        </button>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-end text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Terkumpul</span>
            <span className="font-black text-emerald-600">Rp {project.collectedAmount.toLocaleString('id-ID')}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-medium">Target</span>
            <span className="font-bold text-slate-700">Rp {project.targetAmount.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
            style={{ width: `${progress.percent}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[10px] text-slate-500">
          <span className="font-bold text-emerald-700 flex items-center gap-1">
            <TrendingUp size={11} /> {progress.percent}% Tercapai
          </span>
          <span>Sisa: Rp {progress.remainingAmount.toLocaleString('id-ID')}</span>
        </div>
      </div>

      <button
        onClick={() => onContribute(project)}
        className="w-full h-8.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
      >
        <HeartHandshake size={14} />
        <span>Ikut Donasi / Patungan</span>
      </button>
    </div>
  );
}
