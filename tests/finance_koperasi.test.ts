import { describe, it, expect } from 'vitest';

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

  it('computes funding progress percentage and caps at 100% properly', () => {
    const project1 = { current: 1500000, target: 3000000 };
    const project2 = { current: 4000000, target: 3000000 };

    const percent1 = Math.min(100, Math.round((project1.current / project1.target) * 100));
    const percent2 = Math.min(100, Math.round((project2.current / project2.target) * 100));

    expect(percent1).toBe(50);
    expect(percent2).toBe(100);
  });

  it('calculates average product reviews score correctly', () => {
    const reviews = [
      { rating: 5 },
      { rating: 4 },
      { rating: 4 },
      { rating: 5 }
    ];

    const averageRating = (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1);
    expect(averageRating).toBe('4.5');
  });
});
