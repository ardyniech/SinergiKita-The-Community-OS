import { LPJSummary } from '../../../shared/models/lpj';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function getMonthName(month: number): string {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return months[month - 1] || 'Januari';
}

export function generateLPJCSV(data: LPJSummary): string {
  const periodStr = `${getMonthName(data.month)} ${data.year}`;
  const rows = [
    ['LAPORAN PERTANGGUNGJAWABAN (LPJ) BULANAN'],
    ['Komunitas', data.tenantName],
    ['Periode', periodStr],
    ['Tanggal Cetak', new Date().toLocaleDateString('id-ID')],
    [''],
    ['RINGKASAN KEUANGAN'],
    ['Total Pemasukan Kas', data.totalIncome],
    ['Total Pengeluaran Kas', data.totalExpense],
    ['Saldo Kas Akhir', data.finalBalance],
    [''],
    ['STATISTIK PELAYANAN & KEGIATAN'],
    ['Total Pembayaran Iuran Warga', data.duesCount],
    ['Surat Pengantar Diterbitkan', data.lettersCount],
    ['Kegiatan Patroli Ronda', data.patrolCount],
    ['Agenda Kegiatan Warga', data.eventsCount],
    ['Laporan Tamu Menginap', data.guestsCount]
  ];

  return rows.map(r => r.map(cell => `"${cell}"`).join(',')).join('\n');
}

export function generateLPJWhatsAppMessage(data: LPJSummary): string {
  const periodStr = `${getMonthName(data.month)} ${data.year}`;
  return `*RINGKASAN LPJ BULANAN RT/RW*\n` +
    `Komunitas: *${data.tenantName}*\n` +
    `Periode: *${periodStr}*\n\n` +
    `📊 *REKAPITULASI KEUANGAN:*\n` +
    `• Pemasukan: ${formatRupiah(data.totalIncome)}\n` +
    `• Pengeluaran: ${formatRupiah(data.totalExpense)}\n` +
    `• Saldo Akhir Kas: *${formatRupiah(data.finalBalance)}*\n\n` +
    `📑 *REKAPITULASI AKTIVITAS:*\n` +
    `• Transaksi Iuran: ${data.duesCount} pembayaran\n` +
    `• Surat Pengantar: ${data.lettersCount} berkas\n` +
    `• Shift Patroli Ronda: ${data.patrolCount} jadwal\n` +
    `• Agenda Warga: ${data.eventsCount} kegiatan\n` +
    `• Tamu Menginap: ${data.guestsCount} laporan\n\n` +
    `_Laporan resmi telah disahkan oleh Pengurus RT/RW. Transparansi demi kemajuan bersama._`;
}
