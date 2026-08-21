import React from 'react';
import { Sparkles, Clock, ArrowLeft } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description?: string;
  onBack?: () => void;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({
  title,
  description = 'Fitur ini disiapkan untuk rilis versi mendatang (Fase 2 Coming Soon).',
  onBack
}) => {
  return (
    <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs text-center space-y-3 my-2">
      <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
        <Clock size={24} />
      </div>
      <div>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 mb-1">
          <Sparkles size={10} />
          <span>Fase 2 — Coming Soon</span>
        </span>
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">{description}</p>
      </div>
      {onBack && (
        <button
          onClick={onBack}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1"
        >
          <ArrowLeft size={12} />
          <span>Kembali ke Dashboard</span>
        </button>
      )}
    </div>
  );
};
