import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface ModuleContainerProps {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}

export const ModuleContainer = ({ title, onBack, children }: ModuleContainerProps) => (
  <div className="min-h-screen pb-6 max-w-lg mx-auto bg-slate-50/50">
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 py-2.5 flex items-center gap-3 relative shadow-sm">
      {/* Top accent glowing line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500 to-blue-500" />
      
      <button 
        onClick={onBack}
        className="w-8 h-8 bg-slate-50 border border-slate-200 hover:border-cyan-300 rounded-lg flex items-center justify-center text-slate-800 hover:bg-white hover:text-cyan-600 hover:shadow-[0_0_8px_rgba(6,182,212,0.15)] transition-all cursor-pointer"
        title="Kembali"
      >
        <ChevronLeft size={16} />
      </button>
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] font-mono text-cyan-600 font-bold uppercase tracking-wider bg-cyan-50 px-1 rounded border border-cyan-150/50">
            MODULE_ENV
          </span>
        </div>
        <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-widest leading-none mt-1">{title}</h2>
      </div>
    </div>
    <div className="px-2 py-3 animate-in slide-in-from-bottom-2 duration-300">
      {children}
    </div>
  </div>
);
