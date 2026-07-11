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
      className="flex flex-col p-3 rounded-xl border border-gray-100 bg-gray-50/30 hover:bg-white hover:shadow-md hover:border-blue-100 transition-all text-left group"
    >
      <div className={`w-7 h-7 ${bg} ${color} rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
        <Icon size={14} />
      </div>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">{label}</p>
          <p className="text-base font-black text-gray-900 leading-none">{value}</p>
        </div>
        <ChevronRight size={12} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
      </div>
    </button>
  );
}
