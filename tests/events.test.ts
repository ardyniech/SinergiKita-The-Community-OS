import { describe, it, expect } from 'vitest';
import {
  getCategoryLabel,
  getCategoryBadge,
  generateEventWhatsAppMessage
} from '../src/modules/events/logic/eventUtils';

describe('Events Module Logic', () => {
  it('should format category labels correctly', () => {
    expect(getCategoryLabel('kerja_bakti')).toBe('Kerja Bakti');
    expect(getCategoryLabel('posyandu')).toBe('Posyandu & Kesehatan');
    expect(getCategoryLabel('rapat')).toBe('Rapat RT/RW');
  });

  it('should return valid category badge colors', () => {
    const badge = getCategoryBadge('kerja_bakti');
    expect(badge.label).toBe('Kerja Bakti');
    expect(badge.color).toContain('emerald');
  });

  it('should generate formatted WhatsApp invitation message', () => {
    const msg = generateEventWhatsAppMessage({
      tenantName: 'RT 05 Sukamaju',
      title: 'Kerja Bakti Bersihkan Saluran',
      category: 'kerja_bakti',
      date: '2026-08-25',
      time: '07:30',
      location: 'Lapangan RT',
      description: 'Harap membawa cangkul',
      organizer: 'Ketua RT'
    });

    expect(msg).toContain('RT 05 Sukamaju');
    expect(msg).toContain('Kerja Bakti Bersihkan Saluran');
    expect(msg).toContain('07:30 WIB');
    expect(msg).toContain('Lapangan RT');
    expect(msg).toContain('Harap membawa cangkul');
  });
});
