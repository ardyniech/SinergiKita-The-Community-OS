import { useState, useEffect } from 'react';
import { Transaction } from '../../../shared/models';
import { financeStorage } from '../storage/financeStorage';
import { dispatcher } from '../../../core/dispatcher';

export function useFinance(tenantId: string | null) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;
    return financeStorage.subscribeToTransactions(tenantId, (data) => {
      setTransactions(data);
      setLoading(false);
    });
  }, [tenantId]);

  const totalIncome = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  const systemBalance = totalIncome - totalExpense;

  const recordTransaction = async (data: Partial<Transaction>) => {
    if (!tenantId) return;
    await financeStorage.addTransaction(tenantId, data);
    dispatcher.emit('AUDIT_LOG', `Recorded transaction: ${data.description}`);
  };

  return {
    transactions,
    loading,
    totalIncome,
    totalExpense,
    systemBalance,
    recordTransaction
  };
}
