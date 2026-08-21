import { describe, it, expect } from 'vitest';
import { calculateSHU, calculateLoanInstallment } from '../src/modules/koperasi/logic/koperasiUtils';

describe('Financial & Cooperative Computation Logic', () => {
  it('calculates net cash balance accurately', () => {
    const transactions = [
      { type: 'income', amount: '500000' },
      { type: 'income', amount: '250000' },
      { type: 'expense', amount: '120000' },
      { type: 'expense', amount: '80000' },
    ];

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + parseFloat(t.amount), 0);
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + parseFloat(t.amount), 0);
    const netBalance = income - expense;

    expect(income).toBe(750000);
    expect(expense).toBe(200000);
    expect(netBalance).toBe(550000);
  });

  it('aggregates koperasi deposit pool accurately without double counting', () => {
    const records = [
      { uid: 'u1', type: 'deposit', amount: 50000, status: 'completed' },
      { uid: 'u1', type: 'deposit', amount: 100000, status: 'completed' },
      { uid: 'u2', type: 'deposit', amount: 200000, status: 'completed' },
      { uid: 'u3', type: 'deposit', amount: 50000, status: 'pending' },
    ];

    const user1Deposits = records
      .filter(r => r.uid === 'u1' && r.type === 'deposit' && r.status === 'completed')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalPool = records
      .filter(r => r.type === 'deposit' && r.status === 'completed')
      .reduce((acc, curr) => acc + curr.amount, 0);

    expect(user1Deposits).toBe(150000);
    expect(totalPool).toBe(350000);
  });

  it('happy path: calculateSHU calculates accurate dividends according to pool percentage', () => {
    const result = calculateSHU({
      totalSHU: 10000000, // 10 juta
      userSavings: 1000000, // 1 juta (10% dari 10 juta total kas simpanan)
      totalSavingsPool: 10000000,
      savingAllocationPercent: 40 // 40% alokasi jasa modal = 4 juta
    });

    // 10% dari 4 juta = 400.000
    expect(result.jasaSimpanan).toBe(400000);
    expect(result.totalSHUUser).toBe(400000);
    expect(result.savingSharePercent).toBe(10);
  });

  it('error & edge path: calculateSHU handles zero or negative totalSHU and empty pools', () => {
    const zeroResult = calculateSHU({
      totalSHU: 0,
      userSavings: 1000000,
      totalSavingsPool: 5000000
    });
    expect(zeroResult.totalSHUUser).toBe(0);

    const emptyPoolResult = calculateSHU({
      totalSHU: 5000000,
      userSavings: 0,
      totalSavingsPool: 0
    });
    expect(emptyPoolResult.totalSHUUser).toBe(0);
  });

  it('happy path: calculateLoanInstallment computes monthly principal and total correctly', () => {
    const sim = calculateLoanInstallment(3000000, 6, 1); // 3 juta, 6 bulan, 1% jasa flat per bulan
    // 3jt / 6 = 500.000 pokok + (3jt * 1%) 30.000 jasa = 530.000 / bln
    expect(sim.monthlyPrincipal).toBe(500000);
    expect(sim.monthlyFee).toBe(30000);
    expect(sim.monthlyTotal).toBe(530000);
    expect(sim.totalRepayment).toBe(3180000);
  });

  it('error path: calculateLoanInstallment handles zero or negative loan safely', () => {
    const zeroLoan = calculateLoanInstallment(0, 3);
    expect(zeroLoan.monthlyTotal).toBe(0);
    expect(zeroLoan.totalRepayment).toBe(0);

    const zeroTenor = calculateLoanInstallment(1000000, 0);
    expect(zeroTenor.monthlyTotal).toBe(0);
  });
});
