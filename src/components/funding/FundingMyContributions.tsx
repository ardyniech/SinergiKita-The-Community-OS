import React from 'react';
import { Award, FileText } from 'lucide-react';
import { FundingContribution } from '../../types';

interface FundingMyContributionsProps {
  contributions: FundingContribution[];
  onOpenCertificate: (contribution: FundingContribution) => void;
}

export function FundingMyContributions({ contributions, onOpenCertificate }: FundingMyContributionsProps) {
  return (
    <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
      <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
        <Award size={16} className="text-amber-500" /> Riwayat Patungan & Piagam Penghargaan
      </h3>

      <div className="space-y-2">
        {contributions.length === 0 ? (
          <div className="p-3.5 text-center text-slate-400 italic text-xs">
            Anda belum pernah berpartisipasi dalam patungan inisiatif warga.
          </div>
        ) : (
          contributions.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2"
            >
              <div>
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">{item.projectTitle}</h4>
                <p className="text-[10px] text-emerald-600 font-bold tabular-nums">
                  Rp {item.amount.toLocaleString('id-ID')}
                </p>
              </div>

              <button
                onClick={() => onOpenCertificate(item)}
                className="min-h-[44px] px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-black flex items-center gap-1 hover:bg-amber-100 transition cursor-pointer"
              >
                <FileText size={12} /> Unduh Piagam
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
