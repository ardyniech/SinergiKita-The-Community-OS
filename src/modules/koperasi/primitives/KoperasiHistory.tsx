import React from 'react';
import { KoperasiRecord } from '../../../shared/models';
import { History, ArrowDownLeft, AlertCircle } from 'lucide-react';

interface KoperasiHistoryProps {
  records: KoperasiRecord[];
  loading: boolean;
}

export function KoperasiHistory({ records, loading }: KoperasiHistoryProps) {
  if (loading) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col px-1">
        <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-wider">Log Transaksi Koperasi</h3>
        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1 opacity-70">Audit Jejak Gotong Royong</p>
      </div>

      <div className="card-3d bg-white/80 border-white/60 shadow-3d-sm divide-y divide-slate-100 overflow-hidden">
        {records.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle size={24} className="mx-auto mb-2 text-slate-200" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Belum Ada Transaksi</p>
          </div>
        ) : (
          records.map(r => (
            <div key={r.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-all group">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-white shadow-3d-sm border border-slate-100 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                  <ArrowDownLeft size={18} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tight truncate">{r.note || 'Setoran Simpanan'}</h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate">{r.userName} • {r.timestamp?.toDate ? r.timestamp.toDate().toLocaleDateString('id-ID') : 'Baru'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[13px] font-black text-emerald-600 tabular-nums">+ Rp {r.amount.toLocaleString()}</p>
                <p className="text-[8px] font-black text-emerald-500/60 uppercase tracking-tighter">Settled</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
