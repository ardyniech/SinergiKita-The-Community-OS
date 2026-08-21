import React from 'react';
import { ChevronLeft, LayoutGrid } from 'lucide-react';

interface ModuleContainerProps {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}

export const ModuleContainer = ({ title, onBack, children }: ModuleContainerProps) => (
  <div className="min-h-screen pb-6 max-w-lg mx-auto bg-slate-50/60">
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-3 py-2.5 flex items-center gap-2.5 shadow-2xs">
      <button 
        onClick={onBack}
        className="w-9 h-9 bg-slate-50 border border-slate-200/80 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 rounded-2xl flex items-center justify-center text-slate-700 transition-all cursor-pointer shrink-0 active:scale-95"
        title="Kembali ke Beranda"
      >
        <ChevronLeft size={18} />
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full border border-blue-100/80 flex items-center gap-1">
            <LayoutGrid size={10} /> Layanan Warga
          </span>
        </div>
        <h2 className="text-sm font-black text-slate-900 tracking-tight leading-tight mt-0.5 truncate">{title}</h2>
      </div>
    </div>
    <div className="px-2.5 py-3 animate-in slide-in-from-bottom-2 duration-200">
      {children}
    </div>
  </div>
);
