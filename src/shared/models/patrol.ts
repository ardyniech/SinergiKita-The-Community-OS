export type PatrolDay = 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu' | 'minggu';

export interface PatrolOfficer {
  userId?: string;
  name: string;
  houseNumber?: string;
  phone?: string;
  isLeader?: boolean;
}

export interface PatrolSchedule {
  id: string;
  tenantId: string;
  day: PatrolDay;
  shiftName: string;
  officers: PatrolOfficer[];
  posLocation?: string;
  notes?: string;
}

export interface PatrolCheckin {
  id: string;
  tenantId: string;
  scheduleId?: string;
  userId: string;
  userName: string;
  houseNumber?: string;
  date: string;
  checkinTime: any;
  status: 'hadir' | 'izin' | 'digantikan';
  substituteName?: string;
  report?: string;
}
