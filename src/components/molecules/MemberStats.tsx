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
    <div className="mb-6">
      <div className="flex justify-between items-end mb-2">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-gray-900 uppercase tracking-tighter">Status Distribusi</span>
          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5">Komposisi Keanggotaan</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-black text-gray-900 leading-none">{stats.total}</span>
          <span className="text-[8px] font-black text-gray-400 uppercase">Warga</span>
        </div>
      </div>
      
      <div className="h-2 w-full flex rounded-full overflow-hidden bg-gray-100 mb-3 shadow-inner">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(stats.active / stats.total) * 100}%` }}
          className="bg-green-500 h-full"
        />
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(stats.pending / stats.total) * 100}%` }}
          className="bg-amber-500 h-full border-l border-white/20"
        />
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(stats.inactive / stats.total) * 100}%` }}
          className="bg-rose-500 h-full border-l border-white/20"
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span className="text-[8px] font-black text-gray-500 uppercase tracking-tight">Aktif: <span className="text-gray-900">{stats.active}</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className="text-[8px] font-black text-gray-500 uppercase tracking-tight">Pending: <span className="text-gray-900">{stats.pending}</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span className="text-[8px] font-black text-gray-500 uppercase tracking-tight">Suspended: <span className="text-gray-900">{stats.inactive}</span></span>
        </div>
      </div>
    </div>
  );
}
