import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface ModuleContainerProps {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}

export const ModuleContainer = ({ title, onBack, children }: ModuleContainerProps) => (
  <div className="min-h-screen pb-6 max-w-lg mx-auto bg-slate-50/50">
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-2.5 py-2 flex items-center gap-2.5 relative shadow-xs">
      {/* Top accent glowing line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500 to-blue-500" />
      
      <button 
        onClick={onBack}
        className="min-h-[44px] min-w-[44px] bg-slate-50 border border-slate-200 hover:border-cyan-300 rounded-lg flex items-center justify-center text-slate-800 hover:bg-white hover:text-cyan-600 transition-all cursor-pointer shrink-0"
        title="Kembali"
      >
        <ChevronLeft size={18} />
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] font-mono text-cyan-600 font-bold uppercase tracking-wider bg-cyan-50 px-1 rounded border border-cyan-150/50">
            MODULE_ENV
          </span>
        </div>
        <h2 className="text-xs font-black text-slate-800 uppercase tracking-tight leading-tight mt-0.5 truncate">{title}</h2>
      </div>
    </div>
    <div className="px-2 py-2.5 animate-in slide-in-from-bottom-2 duration-300">
      {children}
    </div>
  </div>
);
