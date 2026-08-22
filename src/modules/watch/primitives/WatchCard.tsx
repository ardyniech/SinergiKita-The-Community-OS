import React from 'react';
import { Eye, ShieldCheck, MapPin, Check, User, Clock } from 'lucide-react';
import { WatchRequest } from '../../../shared/models/watchRequests';

interface WatchCardProps {
  request: WatchRequest;
  currentUserId: string;
  onConfirm: (id: string) => void;
  onComplete: (id: string) => void;
}

export const WatchCard: React.FC<WatchCardProps> = ({
  request,
  currentUserId,
  onConfirm,
  onComplete,
}) => {
  const isOwn = request.requesterId === currentUserId;
  const isWatching = request.status === 'watching';
  
  // Format waktu sederhana
  const timeStr = request.createdAt 
    ? new Date(request.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className={`p-3 bg-white border rounded-xl shadow-xs transition-all space-y-2.5 ${
      isWatching ? 'border-indigo-200 bg-indigo-50/10' : 'border-slate-100'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs">
            {request.requesterName?.charAt(0) || <User size={12} />}
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">{request.requesterName}</h4>
            <div className="flex items-center gap-1 text-[9px] text-slate-400">
              <Clock size={10} />
              <span>Minta Pantau jam {timeStr}</span>
            </div>
          </div>
        </div>

        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
          isWatching
            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
            : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          {isWatching ? 'SEDANG DIPANTAU' : 'BUTUH PANTAU'}
        </span>
      </div>

      {request.destinationNote && (
        <div className="flex items-start gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-100">
          <MapPin size={12} className="text-slate-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-600 leading-normal">
            <span className="font-semibold text-slate-700">Rute:</span> {request.destinationNote}
          </p>
        </div>
      )}

      {isWatching && request.watcherName && (
        <div className="flex items-center gap-1.5 text-[9px] text-indigo-600 font-medium px-1">
          <ShieldCheck size={11} />
          <span>Dipantau oleh: <span className="font-bold">{request.watcherName}</span></span>
        </div>
      )}

      <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-50">
        {isOwn ? (
          request.status !== 'done' && (
            <button
              onClick={() => onComplete(request.id)}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1"
            >
              <Check size={11} />
              <span>Saya Sudah Sampai Aman</span>
            </button>
          )
        ) : (
          !isWatching && (
            <button
              onClick={() => onConfirm(request.id)}
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1"
            >
              <Eye size={11} />
              <span>Pantau Rekan Ini</span>
            </button>
          )
        )}
      </div>
    </div>
  );
};
