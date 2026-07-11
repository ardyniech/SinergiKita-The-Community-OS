import { useAudit } from '../context/AuditContext';
import { getRoleLabel } from '../lib/permissions';
import { User, ShieldCheck, Clock } from 'lucide-react';

export default function AuditLog() {
  const { logs } = useAudit();

  const formatTimestamp = (ts: any) => {
    if (!ts) return '...';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500">
          <Clock size={16} />
        </div>
        <div>
          <h2 className="text-xs font-black text-gray-900 tracking-tight uppercase">Log Aktivitas</h2>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5">Audit Trail</p>
        </div>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {logs.map(log => (
          <div key={log.id} className="flex gap-2.5 p-2.5 bg-gray-50/50 rounded-xl border border-gray-100 transition-hover hover:bg-white hover:shadow-sm">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
              ['ketua', 'bendahara', 'sekretaris', 'admin', 'superadmin'].includes(log.userRole) 
                ? 'bg-orange-100 text-orange-600' 
                : 'bg-blue-100 text-blue-600'
            }`}>
              {['ketua', 'bendahara', 'sekretaris', 'admin', 'superadmin'].includes(log.userRole) ? <ShieldCheck size={12} /> : <User size={12} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-0.5">
                <span className="text-[10px] font-black text-gray-900 leading-none">
                  {log.user}
                </span>
                <span className="text-[8px] font-bold text-gray-400 uppercase">
                  {formatTimestamp(log.timestamp)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600 uppercase tracking-tighter">
                  {getRoleLabel(log.userRole)}
                </span>
              </div>
              <p className="text-[10px] text-gray-600 leading-snug">
                {log.action}
              </p>
            </div>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Kosong</p>
          </div>
        )}
      </div>
    </div>
  );
}
