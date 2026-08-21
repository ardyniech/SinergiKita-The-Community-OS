import React from 'react';
import { Contribution, FundingProject } from '../../../shared/models';
import { Award, Heart, Inbox } from 'lucide-react';

interface MyContributionsListProps {
  contributions: Contribution[];
  projects: FundingProject[];
  onViewCert: (contrib: Contribution, projectTitle: string) => void;
}

export function MyContributionsList({ contributions, projects, onViewCert }: MyContributionsListProps) {
  const projectMap = new Map(projects.map(p => [p.id, p.title]));

  if (contributions.length === 0) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-xl space-y-1">
        <Heart className="w-8 h-8 text-slate-300 mx-auto" />
        <p className="text-xs font-semibold text-slate-600">Belum Ada Riwayat Donasi</p>
        <p className="text-[10px] text-slate-400">Pilih proyek aktif di atas untuk mulai bergotong royong.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold text-slate-900">Riwayat Dukungan & Donasi Anda</h3>
        <span className="text-[10px] text-slate-400">{contributions.length} Transaksi</span>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-xl divide-y divide-slate-100 overflow-hidden shadow-xs">
        {contributions.map((c) => {
          const projectTitle = projectMap.get(c.projectId) || 'Proyek Warga';
          return (
            <div key={c.id} className="p-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="min-w-0 pr-2">
                <h4 className="text-xs font-bold text-slate-900 truncate">{projectTitle}</h4>
                <p className="text-[10px] text-slate-400 truncate">
                  {c.message ? `"${c.message}" • ` : ''}
                  {c.timestamp?.toDate ? c.timestamp.toDate().toLocaleDateString('id-ID') : 'Baru saja'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <p className="text-xs font-black text-emerald-600 tabular-nums">
                    Rp {c.amount.toLocaleString('id-ID')}
                  </p>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-100">
                    Tersalurkan
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onViewCert(c, projectTitle)}
                  className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg border border-amber-200 transition-colors"
                  title="Lihat Piagam Apresiasi"
                >
                  <Award size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
