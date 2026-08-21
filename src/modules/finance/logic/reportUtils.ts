import { Transaction, DuesBilling } from '../../../shared/models';

export interface CategorySummary {
  category: string;
  amount: number;
  percentage: number;
}

export function aggregateByCategory(transactions: Transaction[], type: 'credit' | 'debit'): CategorySummary[] {
  const filtered = transactions.filter(t => t.type === type && t.amount > 0);
  const total = filtered.reduce((acc, curr) => acc + curr.amount, 0);
  if (total === 0) return [];

  const map = new Map<string, number>();
  filtered.forEach(t => {
    const cat = t.category || 'Lainnya';
    map.set(cat, (map.get(cat) || 0) + t.amount);
  });

  return Array.from(map.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: Math.round((amount / total) * 100)
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function generateMonthlyReportText(params: {
  tenantName: string;
  period: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  topExpenses: CategorySummary[];
}): string {
  const lines = [
    `📊 *LAPORAN KAS KOMUNITAS*`,
    `Komunitas: *${params.tenantName}*`,
    `Periode: ${params.period}`,
    `--------------------------------`,
    `💰 *Total Pemasukan:* Rp ${params.totalIncome.toLocaleString('id-ID')}`,
    `💸 *Total Pengeluaran:* Rp ${params.totalExpense.toLocaleString('id-ID')}`,
    `🏦 *Saldo Akhir Kas:* Rp ${params.balance.toLocaleString('id-ID')}`,
    `--------------------------------`
  ];

  if (params.topExpenses.length > 0) {
    lines.push(`📌 *Rincian Pengeluaran Terbesar:*`);
    params.topExpenses.slice(0, 3).forEach((item, idx) => {
      lines.push(`${idx + 1}. ${item.category}: Rp ${item.amount.toLocaleString('id-ID')} (${item.percentage}%)`);
    });
  }

  lines.push(`\n_Laporan diterbitkan secara transparan via SinergiKita._`);
  return lines.join('\n');
}

export function generateDuesReminderText(params: {
  tenantName: string;
  billing: DuesBilling;
  qrisHolder?: string;
  bankName?: string;
  bankAccount?: string;
}): string {
  const lines = [
    `🔔 *PENGINGAT IURAN KOMUNITAS*`,
    `Yth. Warga/Anggota *${params.tenantName}*,`,
    `\nBerikut informasi tagihan iuran aktif:`,
    `📋 *${params.billing.title}*`,
    `📅 Periode: ${params.billing.period}`,
    `💵 Nominal: *Rp ${params.billing.amount.toLocaleString('id-ID')}*`,
    `⏰ Jatuh Tempo: *${params.billing.dueDate}*`,
    `\n💳 *Metode Pembayaran:*`,
    `• Scan QRIS Komunitas di aplikasi SinergiKita`
  ];

  if (params.bankName && params.bankAccount) {
    lines.push(`• Transfer ${params.bankName}: *${params.bankAccount}* (${params.qrisHolder || 'Bendahara'})`);
  }

  lines.push(`\nMohon konfirmasi pembayaran di menu Buku Kas. Terima kasih! 🙏`);
  return lines.join('\n');
}
