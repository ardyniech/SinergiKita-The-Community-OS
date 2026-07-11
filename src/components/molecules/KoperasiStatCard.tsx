import { LucideIcon } from 'lucide-react';

interface KoperasiStatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
}

export function KoperasiStatCard({ label, value, icon: Icon, color }: KoperasiStatCardProps) {
  return (
    <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
      <Icon size={16} className={`${color} mb-1`} />
      <p className="text-[9px] font-bold text-gray-400 uppercase">{label}</p>
      <p className="text-xs font-black text-gray-900 truncate">{value}</p>
    </div>
  );
}
