import { describe, it, expect } from 'vitest';
import { isAdmin, getRoleLabel } from '../src/lib/permissions';
import { isMasterAdmin, isTenantAdmin, getRolePermissions } from '../src/lib/rbac';

describe('RBAC & Permission Helpers', () => {
  it('identifies superadmin correctly', () => {
    const user = { uid: '1', email: 'ardy.syafii@gmail.com', role: 'superadmin' as any, tenantId: 't1' };
    expect(isMasterAdmin(user)).toBe(true);
    expect(isAdmin(user)).toBe(true);
  });

  it('identifies tenant admin correctly', () => {
    const user = { uid: '2', email: 'budi@gmail.com', role: 'admin' as any, tenantId: 't1' };
    expect(isTenantAdmin(user)).toBe(true);
    expect(isMasterAdmin(user)).toBe(false);
    expect(isAdmin(user)).toBe(true);
  });

  it('identifies regular member correctly', () => {
    const user = { uid: '3', email: 'warga@gmail.com', role: 'member' as any, tenantId: 't1' };
    expect(isTenantAdmin(user)).toBe(false);
    expect(isMasterAdmin(user)).toBe(false);
    expect(isAdmin(user)).toBe(false);
    
    const perms = getRolePermissions(user);
    expect(perms.canApproveMembers).toBe(false);
    expect(perms.canManageFinance).toBe(false);
    expect(perms.canTriggerSOS).toBe(true);
  });

  it('returns correct role labels', () => {
    expect(getRoleLabel('superadmin')).toContain('Super Admin');
    expect(getRoleLabel('admin')).toContain('Tenant Admin');
    expect(getRoleLabel('member')).toContain('Member');
  });
});
