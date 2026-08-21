import { EventCategory } from '../../../shared/models/events';

export function getCategoryLabel(category: EventCategory): string {
  switch (category) {
    case 'kerja_bakti': return 'Kerja Bakti';
    case 'rapat': return 'Rapat RT/RW';
    case 'posyandu': return 'Posyandu & Kesehatan';
    case 'senam': return 'Senam & Olahraga';
    case 'keagamaan': return 'Pengajian & Keagamaan';
    case 'perayaan': return 'Peringatan & Perayaan';
    default: return 'Kegiatan Umum';
  }
}

export function getCategoryBadge(category: EventCategory): { label: string; color: string } {
  switch (category) {
    case 'kerja_bakti':
      return { label: getCategoryLabel(category), color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'rapat':
      return { label: getCategoryLabel(category), color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    case 'posyandu':
      return { label: getCategoryLabel(category), color: 'bg-rose-50 text-rose-700 border-rose-200' };
    case 'senam':
      return { label: getCategoryLabel(category), color: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'keagamaan':
      return { label: getCategoryLabel(category), color: 'bg-teal-50 text-teal-700 border-teal-200' };
    case 'perayaan':
      return { label: getCategoryLabel(category), color: 'bg-purple-50 text-purple-700 border-purple-200' };
    default:
      return { label: getCategoryLabel(category), color: 'bg-slate-50 text-slate-700 border-slate-200' };
  }
}

export function generateEventWhatsAppMessage(params: {
  tenantName: string;
  title: string;
  category: EventCategory;
  date: string;
  time: string;
  location: string;
  description?: string;
  organizer: string;
}): string {
  const catLabel = getCategoryLabel(params.category);
  return `*UNDANGAN KEGIATAN WARGA*\n` +
    `Komunitas: ${params.tenantName}\n` +
    `Acara: *${params.title}*\n` +
    `Kategori: ${catLabel}\n` +
    `Waktu: ${params.date} | Pukul ${params.time} WIB\n` +
    `Lokasi: ${params.location}\n` +
    `Penyelenggara: ${params.organizer}\n` +
    (params.description ? `Keterangan: ${params.description}\n\n` : '\n') +
    `_Kehadiran dan partisipasi Bapak/Ibu/Saudara sangat diharapkan. Terima kasih._`;
}
