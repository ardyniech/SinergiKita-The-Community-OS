import { describe, it, expect } from 'vitest';
import { isSuperAdminEmail } from '../server/utils/superadmin';

describe('Security & SuperAdmin Helpers', () => {
  it('identifies superadmin emails correctly', () => {
    expect(isSuperAdminEmail('ardy.syafii@gmail.com')).toBe(true);
    expect(isSuperAdminEmail('ARDY.syafii@gmail.com')).toBe(true);
    expect(isSuperAdminEmail('random.user@gmail.com')).toBe(false);
    expect(isSuperAdminEmail(null)).toBe(false);
  });
});
