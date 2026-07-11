import { AppUser } from '../types';

export const ADMIN_ROLES = ['superadmin', 'admin', 'ketua', 'bendahara', 'sekretaris'];

export const SUPERADMIN_EMAILS = ['ardy.syafii@gmail.com', 'ardy.syafii@sinergikita.id'];

export const isAdmin = (profile: AppUser | null | undefined): boolean => {
  if (!profile) return false;
  return ADMIN_ROLES.includes(profile.role) || SUPERADMIN_EMAILS.includes(profile.email || '');
};

export const isSuperAdmin = (profile: AppUser | null | undefined): boolean => {
  if (!profile) return false;
  return profile.role === 'superadmin' || SUPERADMIN_EMAILS.includes(profile.email || '');
};

export const getRoleLabel = (role: string): string => {
  switch (role) {
    case 'superadmin': return 'Super Admin';
    case 'admin': return 'Admin';
    case 'ketua': return 'Ketua';
    case 'bendahara': return 'Bendahara';
    case 'sekretaris': return 'Sekretaris';
    case 'member': return 'Warga';
    default: return role;
  }
};
