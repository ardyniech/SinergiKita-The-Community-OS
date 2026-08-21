import { PollOption, Poll } from '../../../shared/models';

export interface CalculatedPollOption extends PollOption {
  percentage: number;
}

export function calculatePollResults(options: PollOption[], totalVotes: number): CalculatedPollOption[] {
  const safeTotal = Math.max(0, totalVotes || 0);
  return options.map(opt => {
    const votes = opt.voteCount || 0;
    const percentage = safeTotal > 0 ? Math.round((votes / safeTotal) * 100) : 0;
    return {
      ...opt,
      percentage
    };
  });
}

export function formatPollCategory(cat: Poll['category']): string {
  switch (cat) {
    case 'rembuk_rt':
      return 'Rembuk RT / RW';
    case 'pemilihan':
      return 'Pemilihan Pengurus';
    case 'keamanan':
      return 'Keamanan Lingkungan';
    case 'fasilitas':
      return 'Pengadaan Fasilitas';
    case 'anggaran':
      return 'Anggaran & Iuran';
    default:
      return 'Musyawarah';
  }
}

export function generatePollWhatsAppShareText(params: {
  tenantName: string;
  pollTitle: string;
  category: string;
  endDate: string;
  totalVotes: number;
}): string {
  return [
    `🗳️ *REMBUK & SUARA WARGA DIGITAL*`,
    `Komunitas: *${params.tenantName}*`,
    `\n📋 Topik: *${params.pollTitle}* (${params.category})`,
    `📅 Batas Partisipasi: ${params.endDate}`,
    `📊 Total Suara Masuk: *${params.totalVotes} suara*`,
    `\nMari gunakan hak suara Anda secara transparan demi kemajuan bersama di SinergiKita! 🤝`
  ].join('\n');
}
