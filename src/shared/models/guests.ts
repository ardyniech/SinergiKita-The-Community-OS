export type GuestStatus = 'reported' | 'acknowledged' | 'departed';

export interface GuestReport {
  id: string;
  tenantId: string;
  userId: string;
  hostName: string;
  houseNumber: string;
  guestName: string;
  guestNik?: string;
  guestPhone?: string;
  relationship: string;
  arrivalDate: string;
  stayDurationDays: number;
  vehicleNumber?: string;
  purpose: string;
  status: GuestStatus;
  notes?: string;
  createdAt: any;
}
