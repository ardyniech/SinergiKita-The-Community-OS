import React from 'react';
import { Users, MapPin, Share2, Plus, Phone, Trash2, Shield } from 'lucide-react';
import { PatrolSchedule, PatrolOfficer } from '../../../shared/models/patrol';
import { getDayLabel, generatePatrolWhatsAppMessage } from '../logic/patrolUtils';

interface DayScheduleCardProps {
  schedule: PatrolSchedule;
  tenantName: string;
  isAdmin: boolean;
  onAddOfficer: () => void;
  onRemoveOfficer: (index: number) => void;
}

export const DayScheduleCard: React.FC<DayScheduleCardProps> = ({
  schedule,
  tenantName,
  isAdmin,
  onAddOfficer,
  onRemoveOfficer
}) => {
  const handleShareWA = () => {
    const text = generatePatrolWhatsAppMessage({
      tenantName,
      day: schedule.day,
      shiftName: schedule.shiftName || 'Shift Malam',
      officers: schedule.officers || [],
      posLocation: schedule.posLocation
    });
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
            {getDayLabel(schedule.day)}
          </span>
          <h3 className="text-xs font-bold text-slate-900 mt-1">
            {schedule.shiftName || 'Shift Ronda Malam (22:00 - 04:00)'}
          </h3>
          <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
            <MapPin size={11} className="text-slate-400" />
            <span>{schedule.posLocation || 'Pos Ronda Utama'}</span>
          </p>
        </div>

        <button
          onClick={handleShareWA}
          className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md text-[10px] font-bold transition-colors"
        >
          <Share2 size={11} />
          <span>Bagikan WA</span>
        </button>
      </div>

      {/* Officers List */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
          <span className="flex items-center gap-1">
            <Users size={12} />
            <span>Petugas Ronda ({schedule.officers?.length || 0} orang)</span>
          </span>
          {isAdmin && (
            <button
              onClick={onAddOfficer}
              className="flex items-center gap-0.5 text-emerald-600 hover:text-emerald-800 text-[10px]"
            >
              <Plus size={12} /> Tambah Petugas
            </button>
          )}
        </div>

        {(!schedule.officers || schedule.officers.length === 0) ? (
          <div className="p-3 bg-slate-50 rounded-lg text-center text-[11px] text-slate-400">
            Belum ada jadwal petugas ronda untuk hari ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-1.5">
            {schedule.officers.map((officer, idx) => (
              <div
                key={idx}
                className="p-2 bg-slate-50 rounded-lg flex items-center justify-between text-[11px]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate flex items-center gap-1">
                      {officer.name}
                      {officer.isLeader && (
                        <span className="px-1 py-0.2 bg-amber-100 text-amber-700 text-[8px] font-bold rounded">
                          Danru
                        </span>
                      )}
                    </p>
                    <p className="text-[9px] text-slate-400">
                      Rumah: No. {officer.houseNumber || '-'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {officer.phone && (
                    <a
                      href={`https://wa.me/${officer.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                      title="Hubungi WA"
                    >
                      <Phone size={12} />
                    </a>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => onRemoveOfficer(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
