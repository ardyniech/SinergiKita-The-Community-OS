import { LetterType, LetterRequestStatus } from '../../../shared/models/letters';

export function formatLetterType(type: LetterType): string {
  switch (type) {
    case 'pengantar_skck': return 'Surat Pengantar SKCK';
    case 'domisili': return 'Surat Keterangan Domisili';
    case 'keterangan_usaha': return 'Surat Keterangan Usaha (SKU)';
    case 'keterangan_tidak_mampu': return 'Keterangan Tidak Mampu (SKTM)';
    case 'keterangan_kematian': return 'Surat Keterangan Kematian';
    case 'keterangan_kelahiran': return 'Surat Keterangan Kelahiran';
    case 'pengantar_umum': return 'Surat Pengantar Umum';
    default: return 'Surat Pengantar';
  }
}

export function getLetterStatusBadge(status: LetterRequestStatus): { label: string; color: string } {
  switch (status) {
    case 'submitted':
      return { label: 'Menunggu Persetujuan', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'approved':
      return { label: 'Disetujui / Terbit', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'completed':
      return { label: 'Selesai & Diambil', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'rejected':
      return { label: 'Ditolak', color: 'bg-rose-50 text-rose-700 border-rose-200' };
    default:
      return { label: 'Proses', color: 'bg-slate-50 text-slate-700 border-slate-200' };
  }
}

export function generateLetterNumber(type: LetterType, index: number): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const code = type.substring(0, 3).toUpperCase();
  const num = String(index).padStart(3, '0');
  return `${num}/SK-${code}/${month}/${year}`;
}

export function generateLetterWhatsAppMessage(params: {
  tenantName: string;
  citizenName: string;
  letterType: LetterType;
  purpose: string;
  houseNumber: string;
}): string {
  const letterName = formatLetterType(params.letterType);
  return `*PENGAJUAN SURAT PENGANTAR RT/RW*\n` +
    `Komunitas: ${params.tenantName}\n` +
    `Pemohon: ${params.citizenName} (No. Rumah: ${params.houseNumber})\n` +
    `Jenis Surat: ${letterName}\n` +
    `Keperluan: ${params.purpose}\n\n` +
    `_Mohon bantuan Bapak/Ibu Pengurus untuk memproses surat pengantar ini. Terima kasih._`;
}
