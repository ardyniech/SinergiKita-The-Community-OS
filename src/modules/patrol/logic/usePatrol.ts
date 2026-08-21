import { useState, useEffect } from 'react';
import { PatrolSchedule, PatrolCheckin, PatrolDay, PatrolOfficer } from '../../../shared/models/patrol';
import { AppUser } from '../../../shared/models/auth';
import { 
  subscribePatrolSchedules, 
  subscribePatrolCheckins, 
  saveSchedule, 
  submitCheckin 
} from '../storage/patrolStorage';
import { getCurrentPatrolDay } from './patrolUtils';

export function usePatrol(tenantId?: string, user?: AppUser | null) {
  const [schedules, setSchedules] = useState<PatrolSchedule[]>([]);
  const [checkins, setCheckins] = useState<PatrolCheckin[]>([]);
  const [selectedDay, setSelectedDay] = useState<PatrolDay>(getCurrentPatrolDay());
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!tenantId) {
      setLoading(false);
      return;
    }
    const unsubSched = subscribePatrolSchedules(
      tenantId,
      (data) => {
        setSchedules(data);
        setLoading(false);
      },
      () => setLoading(false)
    );

    const unsubCheckin = subscribePatrolCheckins(
      tenantId,
      todayStr,
      (data) => setCheckins(data),
      () => {}
    );

    return () => {
      unsubSched();
      unsubCheckin();
    };
  }, [tenantId, todayStr]);

  const currentSchedule = schedules.find(s => s.day === selectedDay) || {
    id: `${tenantId}_${selectedDay}`,
    tenantId: tenantId || '',
    day: selectedDay,
    shiftName: 'Shift Malam (22.00 - 04.00)',
    officers: [],
    posLocation: 'Pos Ronda Utama'
  };

  const handleUpdateOfficers = async (day: PatrolDay, officers: PatrolOfficer[], posLocation?: string) => {
    if (!tenantId) return;
    await saveSchedule(tenantId, day, {
      shiftName: currentSchedule.shiftName || 'Shift Malam',
      officers,
      posLocation: posLocation || currentSchedule.posLocation || 'Pos Ronda'
    });
  };

  const handleCheckin = async (status: 'hadir' | 'izin' | 'digantikan', report?: string, substituteName?: string) => {
    if (!tenantId || !user) throw new Error('User belum login');
    return submitCheckin({
      tenantId,
      userId: user.uid,
      userName: user.displayName || 'Warga',
      houseNumber: user.houseNumber || user.address || '-',
      date: todayStr,
      status,
      report,
      substituteName
    });
  };

  return {
    schedules,
    checkins,
    selectedDay,
    setSelectedDay,
    currentSchedule,
    loading,
    updateOfficers: handleUpdateOfficers,
    checkin: handleCheckin
  };
}
