import { LucideIcon } from 'lucide-react';

interface BadgeProps {
  icon?: LucideIcon;
  label: string;
  variant?: 'blue' | 'green' | 'rose' | 'orange' | 'gray';
  className?: string;
}

export const Badge = ({ icon: Icon, label, variant = 'blue', className = '' }: BadgeProps) => {
  const variants = {
    blue: 'bg-cyan-50 text-cyan-600 border-cyan-200/50',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-200/50',
    rose: 'bg-rose-50 text-rose-600 border-rose-200/50',
    orange: 'bg-amber-50 text-amber-600 border-amber-200/50',
    gray: 'bg-slate-50 text-slate-400 border-slate-200/50',
  };

  return (
    <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border tech-mono font-bold text-[8px] uppercase tracking-wider leading-none ${variants[variant]} ${className}`}>
      {Icon && <Icon size={10} className="shrink-0" />}
      {label}
    </div>
  );
};
