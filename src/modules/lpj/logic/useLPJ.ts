import { useState, useEffect } from 'react';
import { LPJSummary } from '../../../shared/models/lpj';
import { fetchLPJSummary } from '../storage/lpjStorage';

export function useLPJ(tenantId?: string, tenantName?: string) {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [summary, setSummary] = useState<LPJSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    if (!tenantId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await fetchLPJSummary(
      tenantId,
      tenantName || 'Komunitas Warga',
      selectedMonth,
      selectedYear
    );
    setSummary(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [tenantId, selectedMonth, selectedYear]);

  return {
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    summary,
    loading,
    refresh: loadData
  };
}
