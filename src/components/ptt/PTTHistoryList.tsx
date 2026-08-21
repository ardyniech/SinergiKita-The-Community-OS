import React from 'react';
import { Volume2, History } from 'lucide-react';
import { PTTMessage } from '../../hooks/usePTT';

interface PTTHistoryListProps {
  messages: PTTMessage[];
  onPlayAudio: (msg: PTTMessage) => void;
}

export function PTTHistoryList({ messages, onPlayAudio }: PTTHistoryListProps) {
  return (
    <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
      <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
        <History size={16} /> Siaran Suara Terakhir
      </h3>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-center text-slate-400 italic text-xs py-4">Belum ada siaran PTT di saluran ini.</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2"
            >
              <div>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">{msg.senderName}</span>
                <p className="text-[9px] text-slate-400">
                  {msg.timestamp ? new Date(msg.timestamp.toMillis()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Baru saja'}
                </p>
              </div>

              <button
                onClick={() => onPlayAudio(msg)}
                className="min-h-[44px] px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs font-black flex items-center gap-1 hover:bg-emerald-200 transition cursor-pointer"
              >
                <Volume2 size={12} /> Putar
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
