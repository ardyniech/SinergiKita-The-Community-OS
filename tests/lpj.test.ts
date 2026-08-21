import { describe, it, expect } from 'vitest';
import {
  formatRupiah,
  getMonthName,
  generateLPJCSV,
  generateLPJWhatsAppMessage
} from '../src/modules/lpj/logic/lpjUtils';
import { LPJSummary } from '../src/shared/models/lpj';

describe('LPJ Module Logic', () => {
  const dummySummary: LPJSummary = {
    month: 8,
    year: 2026,
    tenantName: 'RT 05 Sukamaju',
    totalIncome: 15000000,
    totalExpense: 3500000,
    finalBalance: 11500000,
    duesCount: 45,
    lettersCount: 12,
    patrolCount: 20,
    eventsCount: 4,
    guestsCount: 6,
    createdAt: new Date().toISOString()
  };

  it('should format currency correctly', () => {
    expect(formatRupiah(15000000)).toContain('15.000.000');
  });

  it('should return correct month names in Indonesian', () => {
    expect(getMonthName(1)).toBe('Januari');
    expect(getMonthName(8)).toBe('Agustus');
    expect(getMonthName(12)).toBe('Desember');
  });

  it('should generate valid CSV structure', () => {
    const csv = generateLPJCSV(dummySummary);
    expect(csv).toContain('LAPORAN PERTANGGUNGJAWABAN (LPJ) BULANAN');
    expect(csv).toContain('RT 05 Sukamaju');
    expect(csv).toContain('Agustus 2026');
    expect(csv).toContain('15000000');
  });

  it('should generate formatted WhatsApp summary message', () => {
    const msg = generateLPJWhatsAppMessage(dummySummary);
    expect(msg).toContain('RT 05 Sukamaju');
    expect(msg).toContain('Agustus 2026');
    expect(msg).toContain('15.000.000');
    expect(msg).toContain('3.500.000');
    expect(msg).toContain('45 pembayaran');
  });
});
