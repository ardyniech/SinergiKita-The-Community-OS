import { PatrolDay } from '../../../shared/models/patrol';

export function getDayLabel(day: PatrolDay): string {
  switch (day) {
    case 'senin': return 'Senin Malam';
    case 'selasa': return 'Selasa Malam';
    case 'rabu': return 'Rabu Malam';
    case 'kamis': return 'Kamis Malam';
    case 'jumat': return 'Jum\'at Malam';
    case 'sabtu': return 'Sabtu Malam (Malam Minggu)';
    case 'minggu': return 'Minggu Malam';
    default: return day;
  }
}

export function getCurrentPatrolDay(): PatrolDay {
  const days: PatrolDay[] = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
  const dayIndex = new Date().getDay();
  return days[dayIndex];
}

export function generatePatrolWhatsAppMessage(params: {
  tenantName: string;
  day: PatrolDay;
  shiftName: string;
  officers: { name: string; houseNumber?: string }[];
  posLocation?: string;
}): string {
  const dayName = getDayLabel(params.day);
  const officerList = params.officers.map((o, i) => `${i + 1}. ${o.name} (No. ${o.houseNumber || '-'})`).join('\n');

  return `*JADWAL RONDA SISKAMLING*\n` +
    `Komunitas: ${params.tenantName}\n` +
    `Hari: ${dayName} (${params.shiftName})\n` +
    `Lokasi Pos: ${params.posLocation || 'Pos Ronda Utama'}\n\n` +
    `*Petugas Jaga:*\n${officerList || '- Belum ada petugas -'}\n\n` +
    `_Mari bersama jaga keamanan dan ketertiban lingkungan kita. Salam SinergiKita._`;
}
