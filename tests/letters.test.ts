import { describe, it, expect } from 'vitest';
import {
  formatLetterType,
  getLetterStatusBadge,
  generateLetterNumber,
  generateLetterWhatsAppMessage
} from '../src/modules/letters/logic/letterUtils';

describe('Letters Module Logic', () => {
  it('should format letter types correctly', () => {
    expect(formatLetterType('domisili')).toBe('Surat Keterangan Domisili');
    expect(formatLetterType('pengantar_skck')).toBe('Surat Pengantar SKCK');
    expect(formatLetterType('keterangan_usaha')).toBe('Surat Keterangan Usaha (SKU)');
    expect(formatLetterType('keterangan_tidak_mampu')).toBe('Keterangan Tidak Mampu (SKTM)');
  });

  it('should return appropriate status badges', () => {
    expect(getLetterStatusBadge('submitted').label).toBe('Menunggu Persetujuan');
    expect(getLetterStatusBadge('approved').label).toBe('Disetujui / Terbit');
    expect(getLetterStatusBadge('rejected').label).toBe('Ditolak');
    expect(getLetterStatusBadge('completed').label).toBe('Selesai & Diambil');
  });

  it('should generate standardized official letter number', () => {
    const num = generateLetterNumber('domisili', 12);
    expect(num).toMatch(/^012\/SK-DOM\/\d{2}\/\d{4}$/);
  });

  it('should generate formatted WhatsApp message for letter request', () => {
    const msg = generateLetterWhatsAppMessage({
      tenantName: 'RT 05 Sukamaju',
      citizenName: 'Pak Joko',
      letterType: 'domisili',
      purpose: 'Buka rekening bank',
      houseNumber: 'Blok C/12'
    });

    expect(msg).toContain('RT 05 Sukamaju');
    expect(msg).toContain('Pak Joko');
    expect(msg).toContain('Surat Keterangan Domisili');
    expect(msg).toContain('Buka rekening bank');
    expect(msg).toContain('Blok C/12');
  });
});
