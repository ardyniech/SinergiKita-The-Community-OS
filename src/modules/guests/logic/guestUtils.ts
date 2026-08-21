import { GuestStatus } from '../../../shared/models/guests';

export function getGuestStatusBadge(status: GuestStatus): { label: string; color: string } {
  switch (status) {
    case 'reported':
      return { label: 'Terkirim / Dilaporkan', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'acknowledged':
      return { label: 'Diverifikasi RT/Siskamling', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'departed':
      return { label: 'Sudah Kembali', color: 'bg-slate-50 text-slate-600 border-slate-200' };
    default:
      return { label: 'Proses', color: 'bg-slate-50 text-slate-600 border-slate-200' };
  }
}

export function generateGuestWhatsAppMessage(params: {
  tenantName: string;
  hostName: string;
  houseNumber: string;
  guestName: string;
  relationship: string;
  arrivalDate: string;
  stayDurationDays: number;
  purpose: string;
  vehicleNumber?: string;
}): string {
  return `*LAPORAN TAMU 1x24 JAM*\n` +
    `Komunitas: ${params.tenantName}\n` +
    `Tuan Rumah: ${params.hostName} (No. ${params.houseNumber})\n` +
    `Nama Tamu: *${params.guestName}*\n` +
    `Hubungan: ${params.relationship}\n` +
    `Tgl Kedatangan: ${params.arrivalDate} (${params.stayDurationDays} Hari)\n` +
    `Kendaraan: ${params.vehicleNumber || 'Tidak bawa'}\n` +
    `Maksud/Keperluan: ${params.purpose}\n\n` +
    `_Laporan dikirim melalui sistem ketertiban lingkungan SinergiKita._`;
}
