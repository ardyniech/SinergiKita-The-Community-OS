export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const envAdmins = process.env.SUPERADMIN_EMAILS || process.env.VITE_SUPERADMIN_EMAILS || '';
  const list = envAdmins.split(',').map(e => e.trim().toLowerCase());
  return list.includes(email.toLowerCase());
}
