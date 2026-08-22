import React, { useState } from 'react';
import { MapPin, Users, Navigation, CheckCircle } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

interface Zone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  activeRidersCount: number;
}

interface AssemblyZoneMapProps {
  zones: Zone[];
}

export const AssemblyZoneMap: React.FC<AssemblyZoneMapProps> = ({ zones }) => {
  const { showToast } = useToast();
  const [checkedInZone, setCheckedInZone] = useState<string | null>(null);
  const [localZones, setLocalZones] = useState<Zone[]>(zones);

  const handleCheckIn = (zoneId: string, zoneName: string) => {
    if (checkedInZone === zoneId) {
      // Check out
      setCheckedInZone(null);
      setLocalZones(prev => prev.map(z => z.id === zoneId ? { ...z, activeRidersCount: z.activeRidersCount - 1 } : z));
      showToast(`Berhasil keluar dari ${zoneName}`);
    } else {
      // Check in
      if (checkedInZone) {
        // First check out of current
        const currentId = checkedInZone;
        setLocalZones(prev => prev.map(z => z.id === currentId ? { ...z, activeRidersCount: z.activeRidersCount - 1 } : z));
      }
      setCheckedInZone(zoneId);
      setLocalZones(prev => prev.map(z => z.id === zoneId ? { ...z, activeRidersCount: z.activeRidersCount + 1 } : z));
      showToast(`Berhasil Check-In di ${zoneName}! Status Anda aktif di sini.`);
    }
  };

  return (
    <div className="bg-white p-3 border border-slate-100 rounded-xl shadow-xs space-y-2.5 px-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <MapPin size={14} className="text-rose-500 animate-bounce" />
          <span>Peta Zona Kumpul & Posko Rehat</span>
        </div>
        <span className="text-[9px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
          Garda Pangkalan
        </span>
      </div>

      <p className="text-[10px] text-slate-400 leading-normal px-1">
        Daftar zona pangkalan resmi dan tempat istirahat aktif. Lakukan Check-In agar rekan lain tahu Anda sedang standby di sana.
      </p>

      <div className="space-y-2">
        {localZones.map((zone) => {
          const isCheckedIn = checkedInZone === zone.id;
          return (
            <div
              key={zone.id}
              className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                isCheckedIn 
                  ? 'border-emerald-200 bg-emerald-50/15' 
                  : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
              }`}
            >
              <div className="flex items-start gap-2">
                <div className={`p-1.5 rounded-lg shrink-0 ${isCheckedIn ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                  <Navigation size={14} className="rotate-45" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 leading-tight">{zone.name}</h4>
                  <div className="flex items-center gap-1.5 text-[9px] text-slate-400 mt-0.5">
                    <Users size={11} />
                    <span>{zone.activeRidersCount} Driver aktif</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleCheckIn(zone.id, zone.name)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                  isCheckedIn
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {isCheckedIn && <CheckCircle size={10} />}
                <span>{isCheckedIn ? 'Aktif' : 'Check-In'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
