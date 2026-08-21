import { ContactCategory } from '../../../shared/models/contacts';

export function getContactCategoryBadge(category: ContactCategory): { label: string; color: string } {
  switch (category) {
    case 'darurat':
      return { label: 'Darurat Utama', color: 'bg-rose-50 text-rose-700 border-rose-200' };
    case 'kesehatan':
      return { label: 'Puskesmas / RS / Ambulans', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'keamanan':
      return { label: 'Polsek / Koramil / Babinsa', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    case 'layanan_publik':
      return { label: 'PLN / PDAM / Pemadam / SAR', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'fasilitas_rt':
      return { label: 'Fasilitas & Pos RT/RW', color: 'bg-teal-50 text-teal-700 border-teal-200' };
    default:
      return { label: 'Kontak Warga', color: 'bg-slate-50 text-slate-700 border-slate-200' };
  }
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    return '62' + cleaned.slice(1);
  }
  return cleaned;
}
