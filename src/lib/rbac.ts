import { AppUser } from '../types';
import { SUPERADMIN_EMAILS } from './permissions';

export type UserRole = 'superadmin' | 'admin' | 'ketua' | 'bendahara' | 'sekretaris' | 'satgas' | 'member';

export const isMasterAdmin = (user: AppUser | null | undefined): boolean => {
  if (!user) return false;
  return user.role === 'superadmin' || SUPERADMIN_EMAILS.includes(user.email || '');
};

export const isTenantAdmin = (user: AppUser | null | undefined): boolean => {
  if (!user) return false;
  const adminRoles: UserRole[] = ['admin', 'ketua', 'bendahara', 'sekretaris'];
  return adminRoles.includes(user.role) || isMasterAdmin(user);
};

export const isMemberOnly = (user: AppUser | null | undefined): boolean => {
  if (!user) return true;
  return !isTenantAdmin(user);
};

export interface RolePermissions {
  canApproveTenants: boolean;
  canManageTenantSettings: boolean;
  canApproveMembers: boolean;
  canManageFinance: boolean;
  canManageMarketplace: boolean;
  canPostAnnouncements: boolean;
  canTriggerSOS: boolean;
  canParticipateChat: boolean;
}

export function getRolePermissions(user: AppUser | null | undefined): RolePermissions {
  const master = isMasterAdmin(user);
  const tenantAdmin = isTenantAdmin(user);

  if (master) {
    return {
      canApproveTenants: true,
      canManageTenantSettings: true,
      canApproveMembers: true,
      canManageFinance: true,
      canManageMarketplace: true,
      canPostAnnouncements: true,
      canTriggerSOS: true,
      canParticipateChat: true,
    };
  }

  if (tenantAdmin) {
    return {
      canApproveTenants: false,
      canManageTenantSettings: true,
      canApproveMembers: true,
      canManageFinance: true,
      canManageMarketplace: true,
      canPostAnnouncements: true,
      canTriggerSOS: true,
      canParticipateChat: true,
    };
  }

  // Member
  return {
    canApproveTenants: false,
    canManageTenantSettings: false,
    canApproveMembers: false,
    canManageFinance: false,
    canManageMarketplace: true, // Members can post products
    canPostAnnouncements: false,
    canTriggerSOS: true,
    canParticipateChat: true,
  };
}
