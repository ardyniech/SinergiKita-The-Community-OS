import React from 'react';
import { ShieldAlert, Radio, Eye, Users, AlertOctagon, ArrowRight } from 'lucide-react';
import { useEmergency } from '../../../hooks/useEmergency';

interface OjolSafetyDashboardProps {
  activeDriversCount: number;
  pendingWatchCount: number;
  activeSosCount: number;
  onNavigateToWatch: () => void;
  onNavigateToEmergency: () => void;
  onNavigateToPTT: () => void;
}

export const OjolSafetyDashboard: React.FC<OjolSafetyDashboardProps> = ({
  activeDriversCount,
  pendingWatchCount,
  activeSosCount,
  onNavigateToWatch,
  onNavigateToEmergency,
  onNavigateToPTT,
}) => {
  const { isSending, triggerSOS } = useEmergency();

  return (
    <div className="space-y-3 px-1">
      {/* Tombol SOS Panic Button Utama */}
      <div className="p-4 bg-rose-50 border border-rose-200/60 rounded-2xl text-center space-y-3 shadow-xs">
        <div className="flex items-center justify-center gap-1.5 text-rose-700 font-black text-xs uppercase tracking-wider">
          <AlertOctagon size={16} className="animate-bounce" />
          <span>Sinyal Bahaya Darurat (SOS)</span>
        </div>
        
        <p className="text-[10px] text-rose-600 leading-normal max-w-xs mx-auto">
          Tekan tombol di bawah jika dalam bahaya begal, kecelakaan parah, atau intimidasi fisik di jalan. Seluruh pangkalan akan langsung dikirimi alarm peringatan!
        </p>

        <button
          onClick={triggerSOS}
          disabled={isSending}
          className={`w-28 h-28 rounded-full border-8 border-rose-100 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-widest flex flex-col items-center justify-center transition-all shadow-md active:scale-95 mx-auto disabled:opacity-50 ${
            isSending ? 'animate-pulse' : ''
          }`}
        >
          <ShieldAlert size={32} className="mb-1" />
          <span>{isSending ? 'KIRIM...' : 'DARURAT'}</span>
        </button>
      </div>

      {/* Grid Statistik Pendek */}
      <div className="grid grid-cols-2 gap-2">
        <div 
          onClick={onNavigateToWatch}
          className="p-3 bg-white border border-slate-100 rounded-xl shadow-xs space-y-1 cursor-pointer hover:border-slate-200"
        >
          <span className="text-[10px] text-slate-400 block font-bold">BUTUH PANTAU</span>
          <div className="flex items-center justify-between">
            <span className="text-lg font-black text-slate-800">{pendingWatchCount}</span>
            <span className="text-[9px] text-indigo-600 font-bold flex items-center gap-0.5">
              Pantau <ArrowRight size={10} />
            </span>
          </div>
        </div>

        <div 
          onClick={onNavigateToPTT}
          className="p-3 bg-white border border-slate-100 rounded-xl shadow-xs space-y-1 cursor-pointer hover:border-slate-200"
        >
          <span className="text-[10px] text-slate-400 block font-bold">DRIVERS STANDBY</span>
          <div className="flex items-center justify-between">
            <span className="text-lg font-black text-slate-800">{activeDriversCount}</span>
            <span className="text-[9px] text-cyan-600 font-bold flex items-center gap-0.5">
              Buka HT <ArrowRight size={10} />
            </span>
          </div>
        </div>
      </div>

      {/* Status Darurat Aktif Lainnya */}
      {activeSosCount > 0 && (
        <div 
          onClick={onNavigateToEmergency}
          className="p-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs flex items-center justify-between cursor-pointer animate-pulse"
        >
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} />
            <div>
              <p className="text-[10px] font-black leading-tight">ALARM AKTIF ({activeSosCount})</p>
              <p className="text-[9px] opacity-90 font-medium">Ada rekan pangkalan butuh bantuan mendesak!</p>
            </div>
          </div>
          <ArrowRight size={14} />
        </div>
      )}
    </div>
  );
};
