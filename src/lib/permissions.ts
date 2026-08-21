import { AppUser } from '../types';

export const ADMIN_ROLES = ['admin', 'ketua', 'bendahara', 'sekretaris'];

const envSuperAdmins = (import.meta as any).env?.VITE_SUPERADMIN_EMAILS;
export const SUPERADMIN_EMAILS = envSuperAdmins 
  ? envSuperAdmins.split(',').map((e: string) => e.trim()) 
  : ['ardy.syafii@gmail.com', 'ardy.syafii@sinergikita.id'];

export const isAdmin = (profile: AppUser | null | undefined): boolean => {
  if (!profile) return false;
  const hasAdminRole = ADMIN_ROLES.includes(profile.role) || profile.role === 'superadmin';
  const isEmailSuperAdmin = SUPERADMIN_EMAILS.includes(profile.email || '');
  return (hasAdminRole && profile.isApproved) || isEmailSuperAdmin;
};

export const isSuperAdmin = (profile: AppUser | null | undefined): boolean => {
  if (!profile) return false;
  return (profile.role === 'superadmin' && profile.isApproved) || SUPERADMIN_EMAILS.includes(profile.email || '');
};

export const getRoleLabel = (role: string): string => {
  switch (role) {
    case 'superadmin': return 'Super Admin (Master Owner)';
    case 'admin': return 'Tenant Admin (Community Manager)';
    case 'ketua': return 'Ketua';
    case 'bendahara': return 'Bendahara';
    case 'sekretaris': return 'Sekretaris';
    case 'member': return 'Member (General User)';
    default: return role;
  }
};
