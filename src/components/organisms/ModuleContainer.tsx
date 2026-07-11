import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface ModuleContainerProps {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}

export const ModuleContainer = ({ title, onBack, children }: ModuleContainerProps) => (
  <div className="min-h-screen bg-gray-50/50 pb-8">
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center gap-3">
      <button 
        onClick={onBack}
        className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center text-gray-900 hover:bg-gray-100 transition-colors"
      >
        <ChevronLeft size={18} />
      </button>
      <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">{title}</h2>
    </div>
    <div className="px-4 py-4 animate-in slide-in-from-bottom-2 duration-500">
      {children}
    </div>
  </div>
);
