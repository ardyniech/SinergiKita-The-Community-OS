import React from 'react';

interface ComingSoonProps {
  title: string;
  desc?: string;
}

export function ComingSoon({ title, desc }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 my-3">
      <span className="text-2xl mb-2">🚧</span>
      <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">{title}</h3>
      <p className="text-[10px] sm:text-xs mt-1 max-w-xs text-slate-500">{desc || "Fitur sedang dalam tahap pengembangan dan akan segera hadir."}</p>
    </div>
  );
}
