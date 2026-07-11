import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  fullWidth?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

export const Button = ({ 
  children, 
  loading, 
  variant = 'primary', 
  fullWidth, 
  className = '', 
  ...props 
}: ButtonProps) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-100',
    ghost: 'bg-transparent text-gray-500 hover:bg-gray-50',
  };

  return (
    <button 
      className={`
        px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest 
        flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50
        ${variants[variant]} 
        ${fullWidth ? 'w-full' : ''} 
        ${className}
      `}
      {...props}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : children}
    </button>
  );
};
