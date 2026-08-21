import React from 'react';
import { Mic, Loader2 } from 'lucide-react';

interface PTTButtonProps {
  isRecording: boolean;
  isUploading: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export function PTTButton({
  isRecording,
  isUploading,
  onStartRecording,
  onStopRecording
}: PTTButtonProps) {
  return (
    <div className="flex flex-col items-center justify-center p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
      <button
        onMouseDown={onStartRecording}
        onMouseUp={onStopRecording}
        onMouseLeave={onStopRecording}
        onMouseOut={onStopRecording}
        onTouchStart={onStartRecording}
        onTouchEnd={onStopRecording}
        disabled={isUploading}
        className={`w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all shadow-lg active:scale-95 cursor-pointer ${
          isRecording
            ? 'bg-rose-600 text-white animate-pulse ring-8 ring-rose-200 dark:ring-rose-950'
            : isUploading
            ? 'bg-slate-400 text-white'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white ring-4 ring-emerald-100 dark:ring-emerald-950'
        }`}
      >
        {isUploading ? (
          <Loader2 size={32} className="animate-spin" />
        ) : (
          <>
            <Mic size={32} />
            <span className="text-[10px] font-black uppercase mt-1">
              {isRecording ? 'Bicara...' : 'Tekan BicarA'}
            </span>
          </>
        )}
      </button>

      <p className="text-[11px] font-bold text-slate-500 text-center">
        {isRecording ? 'Lepas tombol untuk mengirim pesan suara.' : 'Tahan tombol di atas untuk mengirim siaran PTT ke seluruh warga.'}
      </p>
    </div>
  );
}
