import React from 'react';

interface BadgeProps {
  label: string;
  variant?: 'blue' | 'green' | 'orange' | 'rose' | 'gray' | 'emerald';
  icon?: any;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'blue', icon: Icon, className = '' }) => {
  const variants = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-green-50 text-green-700 border-green-100',
    orange: 'bg-orange-50 text-orange-700 border-orange-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
    gray: 'bg-gray-50 text-gray-700 border-gray-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100'
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-tighter shadow-3d-sm ${variants[variant]} ${className}`}>
      {Icon && <Icon size={10} />}
      {label}
    </span>
  );
};
