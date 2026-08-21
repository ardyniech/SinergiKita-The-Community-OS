import React from 'react';
import { Radio, Volume2 } from 'lucide-react';
import { PTTMessage } from '../../hooks/usePTT';

interface PTTHeaderProps {
  activeSpeaker: PTTMessage | null;
}

export function PTTHeader({ activeSpeaker }: PTTHeaderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Radio className="text-emerald-600" size={20} />
        <h2 className="text-sm font-black uppercase text-slate-800 dark:text-slate-100">
          Radio Handy Talkie (PTT)
        </h2>
      </div>

      {activeSpeaker && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3 animate-pulse">
          <Volume2 className="text-emerald-600 animate-bounce" size={20} />
          <div>
            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Sedang Mengudara:</span>
            <p className="text-xs font-black text-slate-800 dark:text-slate-100">{activeSpeaker.senderName}</p>
          </div>
        </div>
      )}
    </div>
  );
}
