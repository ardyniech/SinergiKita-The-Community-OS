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
      className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-xs hover:shadow-md hover:border-blue-200 active:scale-[0.97] transition-all text-left group relative overflow-hidden cursor-pointer"
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className={`w-7 h-7 ${bg} ${color} rounded-lg flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}>
          <Icon size={14} />
        </div>
        <div className="w-4.5 h-4.5 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors">
          <ChevronRight size={10} className="text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
        </div>
      </div>

      <div>
        <p className="text-[10px] font-bold text-slate-500 truncate mb-0.5">{label}</p>
        <p className="text-base font-black text-slate-900 leading-tight tracking-tight">{value}</p>
      </div>
    </button>
  );
}
