import React from 'react';
import { useAudit } from '../context/AuditContext';
import { Clock, Circle } from 'lucide-react';
import { getRoleLabel } from '../lib/permissions';

export default function ActivityLog() {
  const { logs } = useAudit();

  const formatTimestamp = (ts: any) => {
    if (!ts) return '...';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
          <Clock size={18} />
        </div>
        <div>
          <h2 className="text-sm font-black text-gray-900 tracking-tight uppercase">Timeline Aktivitas</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5">Catatan Administrasi Terbaru</p>
        </div>
      </div>

      <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-100 before:to-transparent">
        {logs.slice(0, 10).map((log) => (
          <div key={log.id} className="relative flex items-start gap-4 group">
            {/* Timeline dot */}
            <div className="absolute left-5 -translate-x-1/2 mt-1.5 w-3 h-3 rounded-full border-2 border-white bg-blue-500 shadow-sm z-10 group-hover:scale-125 transition-transform" />
            
            <div className="ml-8 flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-xs font-black text-gray-900 truncate">{log.user}</span>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-bold uppercase tracking-tighter shrink-0">
                    {getRoleLabel(log.userRole)}
                  </span>
                </div>
                <time className="text-[9px] font-bold text-gray-400 uppercase italic shrink-0">
                  {formatTimestamp(log.timestamp)}
                </time>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 group-hover:bg-white group-hover:shadow-md transition-all duration-300">
                <p className="text-[11px] text-gray-600 leading-snug">
                  {log.action}
                </p>
              </div>
            </div>
          </div>
        ))}

        {logs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 opacity-40">
            <Circle className="text-gray-300 mb-2" size={32} />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Belum ada aktivitas</p>
          </div>
        )}
      </div>
    </div>
  );
}
