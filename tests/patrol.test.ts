import { describe, it, expect } from 'vitest';
import {
  getDayLabel,
  generatePatrolWhatsAppMessage
} from '../src/modules/patrol/logic/patrolUtils';

describe('Patrol Module Logic', () => {
  it('should return human readable Indonesian patrol day labels', () => {
    expect(getDayLabel('senin')).toBe('Senin Malam');
    expect(getDayLabel('sabtu')).toBe('Sabtu Malam (Malam Minggu)');
    expect(getDayLabel('minggu')).toBe('Minggu Malam');
  });

  it('should generate formatted WhatsApp schedule message', () => {
    const msg = generatePatrolWhatsAppMessage({
      tenantName: 'RT 05 Sukamaju',
      day: 'sabtu',
      shiftName: 'Shift Malam (22:00 - 04:00)',
      officers: [
        { name: 'Pak Budi', houseNumber: 'A1/02' },
        { name: 'Pak Ahmad', houseNumber: 'A1/05' }
      ],
      posLocation: 'Pos Kamling Depan'
    });

    expect(msg).toContain('RT 05 Sukamaju');
    expect(msg).toContain('Sabtu Malam');
    expect(msg).toContain('Pos Kamling Depan');
    expect(msg).toContain('Pak Budi');
    expect(msg).toContain('Pak Ahmad');
  });

  it('should handle empty officers gracefully in WhatsApp message', () => {
    const msg = generatePatrolWhatsAppMessage({
      tenantName: 'RT 05 Sukamaju',
      day: 'senin',
      shiftName: 'Shift Malam',
      officers: []
    });

    expect(msg).toContain('- Belum ada petugas -');
  });
});
