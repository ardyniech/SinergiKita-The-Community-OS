import React from 'react';
import { User, Home, Calendar, Car, Share2, CheckCircle2, LogOut } from 'lucide-react';
import { GuestReport } from '../../../shared/models/guests';
import { getGuestStatusBadge, generateGuestWhatsAppMessage } from '../logic/guestUtils';

interface GuestCardProps {
  report: GuestReport;
  tenantName: string;
  isAdmin: boolean;
  onAcknowledge?: (id: string) => void;
  onMarkDeparted?: (id: string) => void;
}

export const GuestCard: React.FC<GuestCardProps> = ({
  report,
  tenantName,
  isAdmin,
  onAcknowledge,
  onMarkDeparted
}) => {
  const badge = getGuestStatusBadge(report.status);

  const handleShareWA = () => {
    const text = generateGuestWhatsAppMessage({
      tenantName,
      hostName: report.hostName,
      houseNumber: report.houseNumber,
      guestName: report.guestName,
      relationship: report.relationship,
      arrivalDate: report.arrivalDate,
      stayDurationDays: report.stayDurationDays,
      purpose: report.purpose,
      vehicleNumber: report.vehicleNumber
    });
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md border ${badge.color}`}>
            {badge.label}
          </span>
          <h3 className="text-xs font-bold text-slate-900 mt-1">
            Tamu: {report.guestName}
          </h3>
          <p className="text-[10px] text-slate-500">Hubungan: {report.relationship}</p>
        </div>

        <button
          onClick={handleShareWA}
          className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md text-[10px] font-bold shrink-0"
        >
          <Share2 size={11} />
          <span>Bagikan WA</span>
        </button>
      </div>

      <div className="p-2 bg-slate-50 rounded-lg space-y-1 text-[11px] text-slate-600">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-slate-700 font-medium">
            <Home size={12} className="text-teal-600" /> Tuan Rumah: {report.hostName} (No. {report.houseNumber})
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-500 text-[10px]">
          <span className="flex items-center gap-1">
            <Calendar size={11} /> Datang: {report.arrivalDate} ({report.stayDurationDays} Hari)
          </span>
          {report.vehicleNumber && (
            <span className="flex items-center gap-1 font-mono">
              <Car size={11} /> {report.vehicleNumber}
            </span>
          )}
        </div>

        <div className="text-slate-700 pt-0.5">
          <span className="text-slate-400">Keperluan: </span>
          <span className="font-medium">{report.purpose}</span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        {isAdmin && report.status === 'reported' && onAcknowledge && (
          <button
            onClick={() => onAcknowledge(report.id)}
            className="flex items-center gap-1 px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-[10px] font-bold"
          >
            <CheckCircle2 size={12} />
            <span>Verifikasi Laporan</span>
          </button>
        )}

        {report.status !== 'departed' && onMarkDeparted && (
          <button
            onClick={() => onMarkDeparted(report.id)}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-md text-[10px] font-bold"
          >
            <LogOut size={12} />
            <span>Tamu Sudah Pulang</span>
          </button>
        )}
      </div>
    </div>
  );
};
