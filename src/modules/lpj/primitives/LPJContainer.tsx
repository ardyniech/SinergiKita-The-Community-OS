import React, { useState } from 'react';
import { LPJHeader } from './LPJHeader';
import { LPJSummaryCard } from './LPJSummaryCard';
import { LPJPrintPreview } from './LPJPrintPreview';
import { useLPJ } from '../logic/useLPJ';
import { useAuth } from '../../../context/AuthContext';
import { isAdmin as checkAdmin } from '../../../lib/permissions';
import { FileCheck, ShieldAlert } from 'lucide-react';

export const LPJContainer: React.FC = () => {
  const { profile, tenant } = useAuth();
  const {
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    summary,
    loading,
    refresh
  } = useLPJ(tenant?.id, tenant?.name);

  const [showPrintModal, setShowPrintModal] = useState(false);
  const isAdmin = checkAdmin(profile);

  if (!isAdmin) {
    return (
      <div className="p-6 text-center bg-white border border-slate-200/80 rounded-2xl space-y-2">
        <ShieldAlert size={32} className="mx-auto text-amber-500" />
        <h3 className="text-xs font-bold text-slate-800">Akses Terbatas Pengurus</h3>
        <p className="text-[11px] text-slate-500">
          Hanya Pengurus RT/RW dan Administrasi yang dapat menyusun & mengekspor Laporan Pertanggungjawaban (LPJ).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-6">
      <LPJHeader
        month={selectedMonth}
        year={selectedYear}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
        onRefresh={refresh}
        loading={loading}
      />

      {loading || !summary ? (
        <div className="p-8 text-center text-xs text-slate-400">
          Mengompilasi Laporan Pertanggungjawaban Bulanan...
        </div>
      ) : (
        <LPJSummaryCard
          summary={summary}
          onOpenPrintModal={() => setShowPrintModal(true)}
        />
      )}

      {summary && (
        <LPJPrintPreview
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          summary={summary}
          leaderName={profile?.displayName || 'Ketua RT / RW'}
        />
      )}
    </div>
  );
};
