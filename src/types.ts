// OVER_LIMIT_JUSTIFIED: Refactoring tertunda, logika model terpusat SPA.
export type CommunityModule = 'finance' | 'social' | 'emergency' | 'koperasi' | 'funding' | 'pos' | 'directory' | 'learning' | 'announcements' | 'chat' | 'marketplace' | 'ptt' | 'ai' | 'insights' | 'stats' | 'tips' | 'reports' | 'ai_reports' | 'map' | 'feed' | 'logs' | 'features' | 'settings' | 'superadmin' | 'inventory' | 'voting' | 'letters' | 'patrol' | 'events' | 'guests' | 'contacts' | 'lpj';

export interface Tenant {
  id: string;
  name: string;
  status: 'pending' | 'approved';
  ownerId: string;
  createdAt: number;
  enabledModules?: CommunityModule[];
  unlockedModules?: CommunityModule[];
  moduleOrder?: CommunityModule[];
  dashboardOrder?: string[];
  type?: 'rt-rw' | 'paguyuban' | 'umkm' | 'ojol' | 'petani' | 'other';
  logoUrl?: string;
  templateButtons?: { id: string; label: string; content: string }[];
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
  phone?: string;
  address?: string;
  houseNumber?: string;
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

export interface Transaction {
  id: string;
  amount: number;
  type: 'debit' | 'credit';
  description: string;
  date: string;
}

export interface FundingProject {
  id: string;
  title: string;
  target?: number;
  current?: number;
  targetAmount?: number;
  currentAmount?: number;
  description: string;
  progress?: number;
  category?: string;
  backers?: number;
  status?: 'active' | 'completed' | 'cancelled';
  createdAt?: any;
}

export interface FundingContribution {
  id: string;
  projectId: string;
  projectTitle?: string;
  userId?: string;
  userName?: string;
  contributorName?: string;
  amount: number;
  message?: string;
  timestamp: any;
  certificateUrl?: string;
}

export interface ProductReview {
  id: string;
  productId?: string;
  userId?: string;
  userName?: string;
  reviewerUid?: string;
  reviewerName?: string;
  rating: number;
  comment: string;
  timestamp?: any;
  createdAt?: any;
}

export interface MarketplaceItem {
  id: string;
  name?: string;
  title?: string;
  price: number;
  category: string;
  description?: string;
  sellerName?: string;
  sellerUid?: string;
  whatsappLink?: string;
  isNegotiable?: boolean;
  reviews?: ProductReview[];
}

export interface SocialAlert {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high';
  date: string;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  category: string;
  yesVotes: number;
  noVotes: number;
  status: 'active' | 'closed';
  author?: string;
  votes?: Record<string, 'yes' | 'no'>;
}

export interface AuditEntry {
  id: string;
  action: string;
  user?: string;
  userEmail?: string;
  userRole?: string;
  timestamp?: any;
  tenantId?: string;
  details?: string;
}

export interface Message {
  id: string;
  sender: string;
  recipient: string;
  content: string;
  timestamp: string;
}

export interface CommunityData {
  balance: number;
  announcements: string[];
  fundingProjects: FundingProject[];
  marketplaceItems: MarketplaceItem[];
  socialAlerts: SocialAlert[];
}
