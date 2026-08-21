import React from 'react';
import { ShieldAlert, UserCheck, Calendar, Radio } from 'lucide-react';
import { PatrolDay } from '../../../shared/models/patrol';

interface PatrolHeaderProps {
  selectedDay: PatrolDay;
  onSelectDay: (day: PatrolDay) => void;
  onOpenCheckin: () => void;
  onOpenHT?: () => void;
}

export const PatrolHeader: React.FC<PatrolHeaderProps> = ({
  selectedDay,
  onSelectDay,
  onOpenCheckin,
  onOpenHT
}) => {
  const days: { key: PatrolDay; label: string }[] = [
    { key: 'senin', label: 'Sen' },
    { key: 'selasa', label: 'Sel' },
    { key: 'rabu', label: 'Rab' },
    { key: 'kamis', label: 'Kam' },
    { key: 'jumat', label: 'Jum' },
    { key: 'sabtu', label: 'Sab' },
    { key: 'minggu', label: 'Min' },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldAlert size={18} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900">Jadwal Ronda & Siskamling</h2>
            <p className="text-[10px] text-slate-500">Patroli Keamanan Malam Warga</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenCheckin}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition-colors"
          >
            <UserCheck size={13} />
            <span>Presensi Ronda</span>
          </button>
        </div>
      </div>

      {/* Day Selector */}
      <div className="flex p-0.5 bg-slate-100 rounded-lg overflow-x-auto gap-0.5">
        {days.map((d) => (
          <button
            key={d.key}
            onClick={() => onSelectDay(d.key)}
            className={`flex-1 min-w-[40px] py-1.5 text-[11px] font-bold rounded-md transition-all text-center ${
              selectedDay === d.key
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
};
