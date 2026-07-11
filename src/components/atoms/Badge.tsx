import { LucideIcon } from 'lucide-react';

interface BadgeProps {
  icon?: LucideIcon;
  label: string;
  variant?: 'blue' | 'green' | 'rose' | 'orange' | 'gray';
  className?: string;
}

export const Badge = ({ icon: Icon, label, variant = 'blue', className = '' }: BadgeProps) => {
  const variants = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    gray: 'bg-gray-50 text-gray-400 border-gray-100',
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${variants[variant]} ${className}`}>
      {Icon && <Icon size={10} />}
      {label}
    </div>
  );
};
