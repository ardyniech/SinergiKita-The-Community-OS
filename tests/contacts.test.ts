import { describe, it, expect } from 'vitest';
import {
  getContactCategoryBadge,
  formatPhoneNumber
} from '../src/modules/contacts/logic/contactUtils';

describe('Contacts Module Logic', () => {
  it('should return appropriate badge labels and colors for contact categories', () => {
    expect(getContactCategoryBadge('darurat').label).toBe('Darurat Utama');
    expect(getContactCategoryBadge('kesehatan').label).toBe('Puskesmas / RS / Ambulans');
    expect(getContactCategoryBadge('keamanan').label).toBe('Polsek / Koramil / Babinsa');
  });

  it('should format Indonesian phone numbers properly for WhatsApp links', () => {
    expect(formatPhoneNumber('08123456789')).toBe('628123456789');
    expect(formatPhoneNumber('+628123456789')).toBe('628123456789');
  });
});
