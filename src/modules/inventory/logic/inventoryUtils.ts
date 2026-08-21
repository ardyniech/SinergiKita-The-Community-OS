import { InventoryCondition, LoanStatus } from '../../../shared/models';

export function getConditionBadge(condition: InventoryCondition): { label: string; color: string } {
  switch (condition) {
    case 'good':
      return { label: 'Kondisi Baik', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    case 'fair':
      return { label: 'Cukup Baik', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    case 'needs_repair':
      return { label: 'Perlu Servis', color: 'text-rose-700 bg-rose-50 border-rose-200' };
    default:
      return { label: 'Normal', color: 'text-slate-700 bg-slate-50 border-slate-200' };
  }
}

export function getLoanStatusBadge(status: LoanStatus): { label: string; color: string } {
  switch (status) {
    case 'requested':
      return { label: 'Menunggu Persetujuan', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    case 'approved':
      return { label: 'Disetujui', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    case 'in_use':
      return { label: 'Sedang Dipakai', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
    case 'returned':
      return { label: 'Sudah Dikembalikan', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    case 'rejected':
      return { label: 'Ditolak', color: 'text-rose-700 bg-rose-50 border-rose-200' };
    default:
      return { label: status, color: 'text-slate-700 bg-slate-50 border-slate-200' };
  }
}

export function formatInventoryCategory(category: string): string {
  switch (category) {
    case 'tenda_kursi':
      return 'Tenda & Kursi';
    case 'sound_elektronik':
      return 'Sound & Elektronik';
    case 'alat_kebersihan':
      return 'Alat Kebersihan';
    case 'perkakas':
      return 'Perkakas Kerja';
    default:
      return 'Lainnya';
  }
}

export function generateBorrowWhatsAppMessage(params: {
  tenantName: string;
  itemName: string;
  quantity: number;
  borrowerName: string;
  borrowerHouseNo: string;
  startDate: string;
  endDate: string;
  purpose: string;
}): string {
  return [
    `📦 *PERMOHONAN PINJAM LOGISTIK/INVENTARIS WARGA*`,
    `Komunitas: *${params.tenantName}*`,
    `\n👤 Nama Peminjam: *${params.borrowerName}* (Blok/No: ${params.borrowerHouseNo || '-'})`,
    `📋 Barang: *${params.itemName}*`,
    `🔢 Jumlah: *${params.quantity} unit*`,
    `📅 Jadwal: ${params.startDate} s/d ${params.endDate}`,
    `🎯 Keperluan: ${params.purpose}`,
    `\nMohon konfirmasi dan verifikasi ketersediaan barang. Terima kasih! 🙏`
  ].join('\n');
}
