import { useState, useEffect } from 'react';
import { GuestReport, GuestStatus } from '../../../shared/models/guests';
import { AppUser } from '../../../shared/models/auth';
import { subscribeGuests, submitGuestReport, updateGuestStatus } from '../storage/guestsStorage';

export function useGuests(tenantId?: string, user?: AppUser | null) {
  const [reports, setReports] = useState<GuestReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) {
      setLoading(false);
      return;
    }
    const unsub = subscribeGuests(
      tenantId,
      (data) => {
        setReports(data);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, [tenantId]);

  const handleReportGuest = async (params: {
    guestName: string;
    guestNik?: string;
    guestPhone?: string;
    relationship: string;
    arrivalDate: string;
    stayDurationDays: number;
    vehicleNumber?: string;
    purpose: string;
  }) => {
    if (!tenantId || !user) throw new Error('Pengguna belum login');
    return submitGuestReport({
      tenantId,
      userId: user.uid,
      hostName: user.displayName || 'Warga',
      houseNumber: user.houseNumber || user.address || '-',
      status: 'reported',
      ...params
    });
  };

  const handleAcknowledge = async (id: string) => {
    await updateGuestStatus(id, 'acknowledged');
  };

  const handleMarkDeparted = async (id: string) => {
    await updateGuestStatus(id, 'departed');
  };

  return {
    reports,
    myReports: reports.filter(r => r.userId === user?.uid),
    activeCount: reports.filter(r => r.status !== 'departed').length,
    loading,
    reportGuest: handleReportGuest,
    acknowledgeGuest: handleAcknowledge,
    markDeparted: handleMarkDeparted
  };
}
