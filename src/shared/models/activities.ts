export type ActivityCategory = 
  | 'kerja_bakti' 
  | 'rapat_rt' 
  | 'posyandu' 
  | 'senam' 
  | 'pengajian' 
  | 'peringatan_hari_besar' 
  | 'lainnya';

export interface ActivityRSVP {
  userId: string;
  userName: string;
  houseNumber?: string;
  status: 'hadir' | 'izin' | 'ragu';
  notes?: string;
  updatedAt: any;
}

export interface CommunityActivity {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  category: ActivityCategory;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location: string;
  organizer: string;
  equipmentNeeds?: string[];
  rsvps?: Record<string, ActivityRSVP>;
  totalAttending?: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: any;
}
