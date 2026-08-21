import React, { useState } from 'react';
import { PatrolHeader } from './PatrolHeader';
import { DayScheduleCard } from './DayScheduleCard';
import { CheckinModal } from './CheckinModal';
import { AddOfficerModal } from './AddOfficerModal';
import { usePatrol } from '../logic/usePatrol';
import { useAuth } from '../../../context/AuthContext';
import { isAdmin as checkAdmin } from '../../../lib/permissions';
import { UserCheck, ShieldCheck } from 'lucide-react';

export const PatrolContainer: React.FC = () => {
  const { profile, tenant } = useAuth();
  const { 
    selectedDay, 
    setSelectedDay, 
    currentSchedule, 
    checkins, 
    loading, 
    updateOfficers, 
    checkin 
  } = usePatrol(tenant?.id, profile);

  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [showAddOfficerModal, setShowAddOfficerModal] = useState(false);

  const isAdmin = checkAdmin(profile);

  const handleAddOfficer = async (newOfficer: any) => {
    const updated = [...(currentSchedule.officers || []), newOfficer];
    await updateOfficers(selectedDay, updated, currentSchedule.posLocation);
  };

  const handleRemoveOfficer = async (index: number) => {
    const updated = (currentSchedule.officers || []).filter((_, idx) => idx !== index);
    await updateOfficers(selectedDay, updated, currentSchedule.posLocation);
  };

  return (
    <div className="space-y-3 pb-6">
      <PatrolHeader
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
        onOpenCheckin={() => setShowCheckinModal(true)}
      />

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Memuat jadwal ronda...</div>
      ) : (
        <DayScheduleCard
          schedule={currentSchedule}
          tenantName={tenant?.name || 'Komunitas Warga'}
          isAdmin={isAdmin}
          onAddOfficer={() => setShowAddOfficerModal(true)}
          onRemoveOfficer={handleRemoveOfficer}
        />
      )}

      {/* Live Check-ins Today */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Presensi Ronda Hari Ini ({checkins.length})</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {new Date().toLocaleDateString('id-ID', { dateStyle: 'medium' })}
          </span>
        </div>

        {checkins.length === 0 ? (
          <p className="text-[11px] text-slate-400 text-center py-2 bg-slate-50 rounded-lg">
            Belum ada presensi petugas ronda untuk malam ini.
          </p>
        ) : (
          <div className="space-y-1">
            {checkins.map((c) => (
              <div
                key={c.id}
                className="p-2 bg-slate-50 rounded-lg flex items-center justify-between text-[11px]"
              >
                <div>
                  <span className="font-bold text-slate-800">{c.userName}</span>
                  <span className="text-slate-400 text-[10px]"> (No. {c.houseNumber || '-'})</span>
                  {c.report && <p className="text-[10px] text-slate-500 mt-0.5">&ldquo;{c.report}&rdquo;</p>}
                </div>
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded capitalize bg-emerald-100 text-emerald-800">
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <CheckinModal
        isOpen={showCheckinModal}
        onClose={() => setShowCheckinModal(false)}
        onSubmit={async (status, rep, sub) => { await checkin(status, rep, sub); }}
        userName={profile?.displayName || 'Warga'}
      />

      <AddOfficerModal
        isOpen={showAddOfficerModal}
        onClose={() => setShowAddOfficerModal(false)}
        onAdd={handleAddOfficer}
      />
    </div>
  );
};
