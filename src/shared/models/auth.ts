export type UserRole = 'superadmin' | 'admin' | 'ketua' | 'bendahara' | 'sekretaris' | 'member';

export interface Tenant {
  id: string;
  name: string;
  status: 'pending' | 'approved';
  ownerId: string;
  createdAt: number;
  enabledModules?: string[];
  unlockedModules?: string[];
  moduleOrder?: string[];
  dashboardOrder?: string[];
  type?: 'rt-rw' | 'paguyuban' | 'umkm' | 'ojol' | 'petani' | 'other';
  logoUrl?: string;
  templateButtons?: { id: string; label: string; content: string }[];
}

export interface AppUser {
  id?: string;
  uid: string;
  email: string;
  role: UserRole;
  tenantId: string | null;
  tenantName?: string | null;
  isApproved?: boolean;
  isInvitation?: boolean;
  registeredBy?: string;
  createdAt?: any;
  status?: 'active' | 'pending' | 'inactive';
  phoneNumber?: string;
  address?: string;
  displayName?: string;
  photoURL?: string;
  rating?: number;
  skills?: string[];
  points?: number;
  achievements?: string[];
  isCritical?: boolean;
  observations?: string;
  evaluationNote?: string;
}

export type AppProfile = AppUser;
