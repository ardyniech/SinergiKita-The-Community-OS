import { describe, it, expect } from 'vitest';
import { Transaction } from '../../../shared/models';

export function calculateFinanceSummary(transactions: Partial<Transaction>[]) {
  const totalIncome = transactions
    .filter(t => t.type === 'credit' && typeof t.amount === 'number' && t.amount > 0)
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'debit' && typeof t.amount === 'number' && t.amount > 0)
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const systemBalance = totalIncome - totalExpense;

  return { totalIncome, totalExpense, systemBalance };
}

describe('Finance Summary Logic', () => {
  it('happy path: correctly sums income, expenses, and net balance', () => {
    const txs: Partial<Transaction>[] = [
      { type: 'credit', amount: 500000 },
      { type: 'credit', amount: 250000 },
      { type: 'debit', amount: 150000 }
    ];
    const res = calculateFinanceSummary(txs);
    expect(res.totalIncome).toBe(750000);
    expect(res.totalExpense).toBe(150000);
    expect(res.systemBalance).toBe(600000);
  });

  it('error & edge path: handles empty transactions array safely', () => {
    const res = calculateFinanceSummary([]);
    expect(res.totalIncome).toBe(0);
    expect(res.totalExpense).toBe(0);
    expect(res.systemBalance).toBe(0);
  });

  it('edge path: filters out negative or non-number amounts', () => {
    const txs: any[] = [
      { type: 'credit', amount: -5000 },
      { type: 'credit', amount: null },
      { type: 'credit', amount: 100000 },
      { type: 'debit', amount: 20000 }
    ];
    const res = calculateFinanceSummary(txs);
    expect(res.totalIncome).toBe(100000);
    expect(res.totalExpense).toBe(20000);
    expect(res.systemBalance).toBe(80000);
  });
});
