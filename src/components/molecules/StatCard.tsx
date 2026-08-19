import { ChevronRight, LucideIcon } from 'lucide-react';

interface StatCardProps {
  id: string;
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bg: string;
  onClick: (id: any) => void;
}

export function StatCard({ id, label, value, icon: Icon, color, bg, onClick }: StatCardProps) {
  return (
    <button
      onClick={() => onClick(id)}
      className="tech-card p-3 rounded-xl border border-slate-200 bg-white active:scale-[0.97] transition-all text-left group relative overflow-hidden cursor-pointer"
    >
      <div className="absolute top-0 right-0 px-1.5 py-0.5 bg-slate-50 border-b border-l border-slate-200 rounded-bl-md text-[6px] font-mono font-bold text-slate-300">
        SYS_METRIC
      </div>
      
      <div className={`w-7 h-7 ${bg} ${color} rounded-lg flex items-center justify-center mb-2 shrink-0 border border-slate-200/50 group-hover:bg-white group-hover:shadow-[0_0_8px_rgba(6,182,212,0.2)] transition-all`}>
        <Icon size={14} className="group-hover:text-cyan-600 transition-colors" />
      </div>
      
      <div className="flex justify-between items-end w-full">
        <div className="min-w-0">
          <p className="text-[7px] font-mono font-bold text-slate-400 uppercase tracking-widest leading-none mb-1 group-hover:text-cyan-600 transition-colors">{label}</p>
          <p className="text-sm font-mono font-black text-slate-900 leading-none tracking-tight">{value}</p>
        </div>
        <div className="w-5 h-5 rounded bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:border-cyan-200 group-hover:bg-cyan-50 transition-colors">
          <ChevronRight size={10} className="text-slate-300 group-hover:text-cyan-600 transition-colors shrink-0" />
        </div>
      </div>
    </button>
  );
}
