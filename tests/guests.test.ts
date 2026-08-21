import { describe, it, expect } from 'vitest';
import {
  getGuestStatusBadge,
  generateGuestWhatsAppMessage
} from '../src/modules/guests/logic/guestUtils';

describe('Guests Module Logic', () => {
  it('should return appropriate status badges for guest reports', () => {
    expect(getGuestStatusBadge('reported').label).toBe('Terkirim / Dilaporkan');
    expect(getGuestStatusBadge('acknowledged').label).toBe('Diverifikasi RT/Siskamling');
    expect(getGuestStatusBadge('departed').label).toBe('Sudah Kembali');
  });

  it('should generate formatted WhatsApp guest report message', () => {
    const msg = generateGuestWhatsAppMessage({
      tenantName: 'RT 05 Sukamaju',
      hostName: 'Pak Joko',
      houseNumber: 'A1/05',
      guestName: 'Budi Santoso',
      relationship: 'Saudara / Kerabat',
      arrivalDate: '2026-08-21',
      stayDurationDays: 3,
      purpose: 'Silaturahmi keluarga',
      vehicleNumber: 'B 1234 CD'
    });

    expect(msg).toContain('RT 05 Sukamaju');
    expect(msg).toContain('Pak Joko');
    expect(msg).toContain('Budi Santoso');
    expect(msg).toContain('A1/05');
    expect(msg).toContain('3 Hari');
    expect(msg).toContain('B 1234 CD');
  });
});
