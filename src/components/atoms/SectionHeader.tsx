import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  colorClass?: string;
  bgClass?: string;
}

export const SectionHeader = ({ title, subtitle, icon: Icon, colorClass = "text-blue-600", bgClass = "bg-blue-50" }: SectionHeaderProps) => (
  <div className="flex items-center gap-3 mb-4">
    <div className={`w-9 h-9 ${bgClass} rounded-xl flex items-center justify-center ${colorClass}`}>
      <Icon size={20} />
    </div>
    <div>
      <h2 className="text-base font-black text-gray-900 tracking-tight leading-none">{title}</h2>
      {subtitle && <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-1">{subtitle}</p>}
    </div>
  </div>
);
