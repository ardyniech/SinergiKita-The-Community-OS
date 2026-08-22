import React from 'react';
import { MapPin, Radio } from 'lucide-react';
import type { ActiveDriver } from '../storage/ojolStats';

interface Props {
  drivers: ActiveDriver[];
  currentUserId?: string;
}

export const AssemblyZoneMap: React.FC<Props> = ({ drivers, currentUserId }) => {
  const online = drivers.filter((d) => d.uid !== currentUserId);

  return (
    <div className="bg-white p-3 border border-slate-100 rounded-xl shadow-xs space-y-2.5 px-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <MapPin size={14} className="text-rose-500 animate-bounce" />
          <span>Peta Live Driver Online</span>
        </div>
        <span className="text-[9px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <Radio size={10} className="text-emerald-500" />{drivers.length} Online
        </span>
      </div>

      <p className="text-[10px] text-slate-400 leading-normal px-1">
        Rekan driver yang sedang berbagi lokasi secara live. Aktifkan GPS & izinkan pelacakan agar Anda tampil di sini.
      </p>

      <div className="space-y-2">
        {online.length === 0 ? (
          <div className="p-3 text-center text-[10px] text-slate-400 bg-slate-50 rounded-xl">
            Belum ada rekan yang berbagi lokasi saat ini.
          </div>
        ) : (
          online.map((d) => (
            <div key={d.uid} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-start gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 shrink-0"><Radio size={14} /></div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 leading-tight">{d.userName}</h4>
                  <div className="flex items-center gap-1.5 text-[9px] text-slate-400 mt-0.5">
                    <MapPin size={11} />
                    <span>{d.lat.toFixed(4)}, {d.lng.toFixed(4)}</span>
                  </div>
                </div>
              </div>
              <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Live
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AssemblyZoneMap;
