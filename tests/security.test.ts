import { describe, it, expect, beforeAll } from 'vitest';
import { isSuperAdminEmail } from '../server/utils/superadmin';

beforeAll(() => {
  process.env.SUPERADMIN_EMAILS = 'ardy.syafii@gmail.com,ardy.syafii@sinergikita.id';
});

describe('superadmin email authz', () => {
  it('matches configured superadmin emails (case-insensitive)', () => {
    expect(isSuperAdminEmail('ardy.syafii@gmail.com')).toBe(true);
    expect(isSuperAdminEmail('ARDY.syafii@gmail.com')).toBe(true);
    expect(isSuperAdminEmail('random.user@gmail.com')).toBe(false);
    expect(isSuperAdminEmail(null)).toBe(false);
    expect(isSuperAdminEmail(undefined)).toBe(false);
  });
});
