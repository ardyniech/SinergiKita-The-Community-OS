export type EventCategory = 'kerja_bakti' | 'rapat' | 'posyandu' | 'senam' | 'keagamaan' | 'perayaan' | 'umum';

export interface CommunityEvent {
  id: string;
  tenantId: string;
  title: string;
  category: EventCategory;
  date: string;
  time: string;
  location: string;
  description?: string;
  organizer: string;
  rsvpCount?: number;
  attendees?: string[];
  createdAt: any;
}
