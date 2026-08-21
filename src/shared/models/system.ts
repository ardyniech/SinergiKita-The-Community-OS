export type CommunityModule = 'finance' | 'social' | 'emergency' | 'koperasi' | 'funding' | 'pos' | 'directory' | 'learning' | 'announcements' | 'chat' | 'marketplace' | 'ptt' | 'ai' | 'insights' | 'stats' | 'tips' | 'reports' | 'map' | 'feed' | 'logs' | 'features' | 'settings' | 'superadmin';

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

export interface PendingApproval {
  id: string;
  title: string;
  type: 'member' | 'project' | 'tenant' | 'proposal';
}
