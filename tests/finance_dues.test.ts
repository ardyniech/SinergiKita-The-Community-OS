import { describe, it, expect } from 'vitest';
import { calculateFinanceSummary } from '../src/modules/finance/tests/finance.test';
import { aggregateByCategory, generateMonthlyReportText, generateDuesReminderText } from '../src/modules/finance/logic/reportUtils';
import { Transaction, DuesBilling } from '../src/shared/models';

export function formatReceiptNumber(paymentId: string, year: number = 2026): string {
  const safeId = (paymentId || '000').slice(0, 6).toUpperCase();
  return `KWT-${safeId}-${year}`;
}

export function buildReceiptShareText(params: {
  receiptNo: string;
  tenantName: string;
  userName: string;
  duesTitle: string;
  amount: number;
  paymentMethod: string;
  verifiedBy: string;
}): string {
  return `KUITANSI: ${params.receiptNo} - ${params.duesTitle} - Rp ${params.amount.toLocaleString('id-ID')} (${params.userName})`;
}

describe('Dues and Ledger Calculations', () => {
  it('happy path: calculates ledger totals and verified dues correctly', () => {
    const transactions = [
      { type: 'credit' as const, amount: 25000 },
      { type: 'credit' as const, amount: 50000 },
      { type: 'debit' as const, amount: 15000 }
    ];
    const summary = calculateFinanceSummary(transactions);
    expect(summary.totalIncome).toBe(75000);
    expect(summary.totalExpense).toBe(15000);
    expect(summary.systemBalance).toBe(60000);
  });

  it('error path: handles invalid and negative amounts safely', () => {
    const transactions = [
      { type: 'credit' as const, amount: -1000 },
      { type: 'debit' as const, amount: 0 }
    ];
    const summary = calculateFinanceSummary(transactions);
    expect(summary.totalIncome).toBe(0);
    expect(summary.totalExpense).toBe(0);
    expect(summary.systemBalance).toBe(0);
  });

  it('aggregates transactions by category with percentages and proper sorting', () => {
    const txs: Transaction[] = [
      { id: '1', tenantId: 't1', type: 'debit', amount: 30000, category: 'Kebersihan', description: 'Sampah', date: '2026-08-20', recordedBy: 'u1', recordedByName: 'Admin', createdAt: null as any },
      { id: '2', tenantId: 't1', type: 'debit', amount: 30000, category: 'Kebersihan', description: 'Sapu', date: '2026-08-21', recordedBy: 'u1', recordedByName: 'Admin', createdAt: null as any },
      { id: '3', tenantId: 't1', type: 'debit', amount: 140000, category: 'Keamanan', description: 'Pos Ronda', date: '2026-08-21', recordedBy: 'u1', recordedByName: 'Admin', createdAt: null as any }
    ];
    const agg = aggregateByCategory(txs, 'debit');
    expect(agg.length).toBe(2);
    expect(agg[0].category).toBe('Keamanan');
    expect(agg[0].amount).toBe(140000);
    expect(agg[0].percentage).toBe(70); // 140000 / 200000 = 70%
    expect(agg[1].category).toBe('Kebersihan');
    expect(agg[1].amount).toBe(60000);
    expect(agg[1].percentage).toBe(30); // 60000 / 200000 = 30%
  });

  it('handles empty category aggregation without errors', () => {
    const agg = aggregateByCategory([], 'debit');
    expect(agg).toEqual([]);
  });

  it('generates monthly report broadcast text formatted for WhatsApp', () => {
    const text = generateMonthlyReportText({
      tenantName: 'RT 05 RW 02',
      period: 'Agustus 2026',
      totalIncome: 1000000,
      totalExpense: 400000,
      balance: 600000,
      topExpenses: [{ category: 'Keamanan', amount: 400000, percentage: 100 }]
    });
    expect(text).toContain('RT 05 RW 02');
    expect(text).toContain('Agustus 2026');
    expect(text).toContain('1.000.000');
    expect(text).toContain('Keamanan: Rp 400.000 (100%)');
  });

  it('generates dues reminder WhatsApp text correctly', () => {
    const billing: DuesBilling = {
      id: 'b1',
      tenantId: 't1',
      title: 'Iuran Sampah & Keamanan',
      amount: 35000,
      period: 'Agustus 2026',
      dueDate: '2026-08-31',
      createdBy: 'u1',
      creatorName: 'Bendahara',
      status: 'active',
      createdAt: null as any
    };
    const reminder = generateDuesReminderText({
      tenantName: 'RT 05 RW 02',
      billing,
      bankName: 'BCA',
      bankAccount: '1234567890',
      qrisHolder: 'Kas RT 05'
    });
    expect(reminder).toContain('Iuran Sampah & Keamanan');
    expect(reminder).toContain('35.000');
    expect(reminder).toContain('BCA: *1234567890*');
  });
});
