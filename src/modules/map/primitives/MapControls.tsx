import React from 'react';
import { Users, AlertTriangle, Navigation, Loader2 } from 'lucide-react';

interface MapControlsProps {
  showMembers: boolean;
  setShowMembers: (val: boolean | ((prev: boolean) => boolean)) => void;
  showIncidents: boolean;
  setShowIncidents: (val: boolean | ((prev: boolean) => boolean)) => void;
  activeMembersCount: number;
  alertsCount: number;
  loading: boolean;
  onRecenter: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  showMembers,
  setShowMembers,
  showIncidents,
  setShowIncidents,
  activeMembersCount,
  alertsCount,
  loading,
  onRecenter
}) => {
  return (
    <>
      {/* Map Control Header overlay */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-800 shadow-sm flex items-center gap-1.5 pointer-events-auto">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-wider text-green-400 font-mono">Radar GPS Aktif</span>
        </div>

        <div className="flex gap-1.5 pointer-events-auto">
          {/* Quick Filter Controls */}
          <button
            onClick={() => setShowMembers(prev => !prev)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-bold uppercase transition-all shadow-sm border ${
              showMembers 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-white text-slate-400 border-slate-100 line-through'
            }`}
          >
            <Users size={10} />
            <span>Anggota / Ojol ({activeMembersCount})</span>
          </button>

          <button
            onClick={() => setShowIncidents(prev => !prev)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-bold uppercase transition-all shadow-sm border ${
              showIncidents 
                ? 'bg-rose-50 text-rose-700 border-rose-200' 
                : 'bg-white text-slate-400 border-slate-100 line-through'
            }`}
          >
            <AlertTriangle size={10} />
            <span>Laporan ({alertsCount})</span>
          </button>

          <button
            onClick={onRecenter}
            className="flex items-center justify-center w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
            title="Temukan Saya"
          >
            <Navigation size={11} className="transform rotate-45 text-cyan-600" />
          </button>
        </div>
      </div>

      {/* Overlay Loading State */}
      {loading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-30">
          <div className="flex flex-col items-center gap-1.5 bg-white p-3 rounded-xl border border-slate-100 shadow-lg">
            <Loader2 className="animate-spin text-cyan-600" size={18} />
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest font-mono">Menghubungkan GPS...</span>
          </div>
        </div>
      )}

      {/* Footnote status overlay */}
      <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg border border-slate-200 shadow-sm pointer-events-none">
        <span className="text-[7px] font-bold text-slate-500 uppercase tracking-wide font-mono">
          Free OpenStreetMap • Real-Time GPS Active ({activeMembersCount + alertsCount} Pins)
        </span>
      </div>
    </>
  );
};
