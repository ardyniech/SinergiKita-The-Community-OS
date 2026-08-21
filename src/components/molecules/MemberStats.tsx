import { motion } from 'motion/react';

interface MemberStatsProps {
  stats: {
    active: number;
    pending: number;
    inactive: number;
    total: number;
  };
}

export function MemberStats({ stats }: MemberStatsProps) {
  if (stats.total === 0) return null;

  return (
    <div className="p-4 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/60 shadow-3d-sm">
      <div className="flex justify-between items-end mb-3">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.15em]">Registry Analytics</span>
          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1 opacity-70">Distribution Metrics</span>
        </div>
        <div className="flex items-baseline gap-1 bg-slate-900 text-white px-2.5 py-1 rounded-lg shadow-3d-sm scale-90 origin-bottom-right">
          <span className="text-sm font-black leading-none">{stats.total}</span>
          <span className="text-[7px] font-black uppercase tracking-widest opacity-80">Units</span>
        </div>
      </div>
      
      <div className="h-2.5 w-full flex rounded-full overflow-hidden bg-slate-100/50 mb-4 shadow-inner border border-slate-200/50">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(stats.active / stats.total) * 100}%` }}
          className="bg-emerald-500 h-full shadow-[0_0_8px_rgba(16,185,129,0.4)]"
        />
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(stats.pending / stats.total) * 100}%` }}
          className="bg-amber-500 h-full border-l border-white/40 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
        />
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(stats.inactive / stats.total) * 100}%` }}
          className="bg-rose-500 h-full border-l border-white/40 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Active: <span className="text-slate-900 font-black">{stats.active}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]" />
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Pending: <span className="text-slate-900 font-black">{stats.pending}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.5)]" />
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Suspended: <span className="text-slate-900 font-black">{stats.inactive}</span></span>
        </div>
      </div>
    </div>
  );
}
