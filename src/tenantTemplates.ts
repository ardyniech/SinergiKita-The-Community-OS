import { CommunityModule } from './types';

export interface TenantTemplate {
  id: string;
  type: 'rt-rw' | 'paguyuban' | 'umkm' | 'ojol' | 'petani' | 'other';
  title: string;
  description: string;
  memberLabel: string; // e.g. "Warga" vs "Anggota" vs "Mitra"
  enabledModules: CommunityModule[];
  defaultModuleOrder: CommunityModule[];
}

export const TENANT_TEMPLATES: Record<string, TenantTemplate> = {
  'rt-rw': {
    id: 'rt-rw',
    type: 'rt-rw',
    title: 'Lingkungan RT / RW',
    description: 'Untuk tata kelola lingkungan perumahan, iuran kas, surat pengantar, siskamling & LPJ',
    memberLabel: 'Warga',
    enabledModules: ['finance', 'emergency', 'letters', 'patrol', 'events', 'guests', 'contacts', 'lpj', 'voting', 'announcements', 'chat'],
    defaultModuleOrder: ['finance', 'emergency', 'letters', 'patrol', 'lpj', 'voting', 'events', 'guests', 'contacts', 'announcements', 'chat']
  },
  'paguyuban': {
    id: 'paguyuban',
    type: 'paguyuban',
    title: 'Paguyuban & Komunitas',
    description: 'Untuk perkumpulan sosial, kas harian, pendaftaran event, voting & diskusi',
    memberLabel: 'Anggota',
    enabledModules: ['finance', 'social', 'koperasi', 'funding', 'events', 'voting', 'announcements', 'chat', 'marketplace'],
    defaultModuleOrder: ['finance', 'social', 'events', 'koperasi', 'funding', 'voting', 'announcements', 'chat', 'marketplace']
  },
  'umkm': {
    id: 'umkm',
    type: 'umkm',
    title: 'Sentra UMKM & Koperasi',
    description: 'Untuk koperasi bersama, kasir POS, simpan pinjam, dan katalog produk lokal',
    memberLabel: 'Anggota UMKM',
    enabledModules: ['finance', 'pos', 'koperasi', 'inventory', 'marketplace', 'funding', 'announcements', 'chat'],
    defaultModuleOrder: ['pos', 'finance', 'koperasi', 'marketplace', 'inventory', 'funding', 'announcements', 'chat']
  },
  'ojol': {
    id: 'ojol',
    type: 'ojol',
    title: 'Komunitas Driver / Ojol',
    description: 'Untuk pangkalan driver, HT Walkie-Talkie (PTT), alarm darurat, kas & bantuan sosial',
    memberLabel: 'Mitra Driver',
    enabledModules: ['ptt', 'emergency', 'finance', 'funding', 'contacts', 'chat', 'announcements'],
    defaultModuleOrder: ['ptt', 'emergency', 'finance', 'funding', 'contacts', 'chat', 'announcements']
  },
  'petani': {
    id: 'petani',
    type: 'petani',
    title: 'Kelompok Tani / Nelayan',
    description: 'Untuk gabungan kelompok tani (Gapoktan), inventaris alsintan, dan pembiayaan bersama',
    memberLabel: 'Anggota Tani',
    enabledModules: ['finance', 'inventory', 'koperasi', 'funding', 'events', 'announcements', 'chat'],
    defaultModuleOrder: ['finance', 'inventory', 'koperasi', 'funding', 'events', 'announcements', 'chat']
  },
  'other': {
    id: 'other',
    type: 'other',
    title: 'Komunitas Umum',
    description: 'Konfigurasi fleksibel untuk berbagai bentuk organisasi dan perkumpulan',
    memberLabel: 'Anggota',
    enabledModules: ['finance', 'social', 'emergency', 'events', 'announcements', 'chat', 'directory'],
    defaultModuleOrder: ['finance', 'social', 'emergency', 'events', 'announcements', 'chat', 'directory']
  }
};
