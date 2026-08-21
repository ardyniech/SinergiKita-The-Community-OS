import React, { useState } from 'react';
import { GuestsHeader } from './GuestsHeader';
import { GuestCard } from './GuestCard';
import { ReportGuestModal } from './ReportGuestModal';
import { useGuests } from '../logic/useGuests';
import { useAuth } from '../../../context/AuthContext';
import { isAdmin as checkAdmin } from '../../../lib/permissions';
import { UserPlus, Inbox } from 'lucide-react';

export const GuestsContainer: React.FC = () => {
  const { profile, tenant } = useAuth();
  const {
    reports,
    myReports,
    activeCount,
    loading,
    reportGuest,
    acknowledgeGuest,
    markDeparted
  } = useGuests(tenant?.id, profile);

  const [activeTab, setActiveTab] = useState<'my' | 'manage'>('my');
  const [showReportModal, setShowReportModal] = useState(false);
  const isAdmin = checkAdmin(profile);

  const displayedReports = activeTab === 'manage' && isAdmin ? reports : myReports;

  return (
    <div className="space-y-3 pb-6">
      <GuestsHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onReportNew={() => setShowReportModal(true)}
        isAdmin={isAdmin}
        activeCount={activeCount}
      />

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Memuat data laporan tamu...</div>
      ) : displayedReports.length === 0 ? (
        <div className="p-8 text-center bg-white border border-slate-200/80 rounded-xl space-y-1.5">
          <Inbox size={28} className="mx-auto text-slate-300" />
          <h4 className="text-xs font-bold text-slate-700">Belum Ada Laporan Tamu</h4>
          <p className="text-[11px] text-slate-400">
            {activeTab === 'manage'
              ? 'Belum ada tamu menginap yang dilaporkan warga.'
              : 'Apabila Anda kedatangan tamu menginap >24 jam, klik tombol "Lapor Tamu".'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayedReports.map((r) => (
            <GuestCard
              key={r.id}
              report={r}
              tenantName={tenant?.name || 'Komunitas Warga'}
              isAdmin={isAdmin}
              onAcknowledge={acknowledgeGuest}
              onMarkDeparted={markDeparted}
            />
          ))}
        </div>
      )}

      <ReportGuestModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={async (data) => { await reportGuest(data); }}
      />
    </div>
  );
};
