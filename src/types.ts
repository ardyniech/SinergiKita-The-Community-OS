export type CommunityModule = 'finance' | 'social' | 'emergency' | 'koperasi' | 'funding' | 'pos' | 'directory' | 'learning' | 'announcements' | 'chat' | 'marketplace' | 'ptt' | 'ai' | 'insights' | 'stats' | 'tips' | 'reports' | 'map' | 'feed' | 'logs' | 'features' | 'settings' | 'superadmin';

export interface Tenant {
  id: string;
  name: string;
  status: 'pending' | 'approved';
  ownerId: string;
  createdAt: number;
  enabledModules?: CommunityModule[];
  moduleOrder?: CommunityModule[];
  dashboardOrder?: string[];
  type?: 'rt-rw' | 'paguyuban' | 'umkm' | 'ojol' | 'petani' | 'other';
  logoUrl?: string;
}

export interface AppUser {
  id?: string;
  uid: string;
  email: string;
  role: 'superadmin' | 'admin' | 'ketua' | 'bendahara' | 'sekretaris' | 'member';
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
  // Advanced Management
  rating?: number;
  skills?: string[];
  points?: number;
  achievements?: string[];
  isCritical?: boolean;
  observations?: string;
  evaluationNote?: string;
}

export type AppProfile = AppUser;

export interface Transaction {
  id: string;
  amount: number;
  type: 'debit' | 'credit';
  description: string;
  date: string;
}

export interface CommunityData {
  balance: number;
  announcements: string[];
  fundingProjects: FundingProject[];
  marketplaceItems: MarketplaceItem[];
  socialAlerts: SocialAlert[];
}

export interface FundingProject {
  id: string;
  title: string;
  currentSlots: number;
  totalSlots: number;
}

export interface MarketplaceItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  category: 'sparepart' | 'food' | 'service' | 'other';
  sellerName: string;
  sellerUid: string;
  whatsappLink: string;
  createdAt: number;
  tenantId: string;
  isNegotiable?: boolean;
  reviews?: ProductReview[];
}

export interface ProductReview {
  id: string;
  rating: number; // 1-5
  comment: string;
  reviewerName: string;
  reviewerUid: string;
  timestamp: number;
}

export interface SocialAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  helpers?: number;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  category: 'Initiative' | 'Budget' | 'Policy';
  yesVotes: number;
  noVotes: number;
  status: 'active' | 'closed';
}

export interface PendingApproval {
  id: string;
  title: string;
  type: 'member' | 'project' | 'tenant' | 'proposal';
}

export interface Member {
  id: string;
  name: string;
  role: 'Admin' | 'Member';
  email: string;
  isApproved: boolean;
  phoneNumber?: string;
  address?: string;
}

export interface AuditEntry {
  id: string;
  action: string;
  user: string;
  userEmail: string;
  userRole: string;
  timestamp: any; // Firestore Timestamp
  tenantId: string;
}

export interface Message {
  id: string;
  sender: string;
  recipient: string;
  content: string;
  timestamp: string;
}

export interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  frequency: 'monthly' | 'weekly';
  nextBillingDate: string;
  status: 'active' | 'paused';
}
