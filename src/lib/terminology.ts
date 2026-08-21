import { Tenant } from '../types';

export type LabelKey = 'member' | 'admin' | 'community' | 'event' | 'emergency' | 'treasury' | 'ideas' | 'location' | 'patrol';

const DICTIONARY: Record<string, Record<LabelKey, string>> = {
  'rt-rw': {
    member: 'Warga',
    admin: 'Pengurus / Ketua RT',
    community: 'Lingkungan RT/RW',
    event: 'Kegiatan Warga',
    emergency: 'SOS Darurat RT',
    treasury: 'Kas Warga',
    ideas: 'Gagasan Warga',
    location: 'Posisi Siskamling',
    patrol: 'Ronda Siskamling'
  },
  'ojol': {
    member: 'Mitra Driver',
    admin: 'Koordinator Pangkalan',
    community: 'Komunitas Ojol',
    event: 'Kopdar Driver',
    emergency: 'SOS Pangkalan',
    treasury: 'Kas Driver',
    ideas: 'Aspirasi Driver',
    location: 'Peta Pandu Live',
    patrol: 'Satgas Patroli'
  },
  'paguyuban': {
    member: 'Anggota',
    admin: 'Pengurus Paguyuban',
    community: 'Paguyuban',
    event: 'Acara Paguyuban',
    emergency: 'Bantuan Darurat',
    treasury: 'Kas Paguyuban',
    ideas: 'Sumbang Saran',
    location: 'Lokasi Anggota',
    patrol: 'Satgas Keamanan'
  },
  'umkm': {
    member: 'Anggota UMKM',
    admin: 'Pengurus Koperasi/Sentra',
    community: 'Sentra UMKM',
    event: 'Bazar / Pameran',
    emergency: 'Bantuan Darurat',
    treasury: 'Kas Koperasi',
    ideas: 'Inovasi Produk',
    location: 'Lokasi Lapak',
    patrol: 'Keamanan Pasar'
  },
  'petani': {
    member: 'Anggota Tani',
    admin: 'Pengurus Gapoktan',
    community: 'Kelompok Tani',
    event: 'Rembuk Tani',
    emergency: 'Bantuan Hama/Darurat',
    treasury: 'Kas Kelompok',
    ideas: 'Inovasi Tani',
    location: 'Peta Lahan',
    patrol: 'Patroli Lahan'
  }
};

const GLOBAL_FALLBACK: Record<LabelKey, string> = {
  member: 'Anggota',
  admin: 'Pengurus',
  community: 'Komunitas',
  event: 'Agenda',
  emergency: 'SOS Darurat',
  treasury: 'Kas Komunitas',
  ideas: 'Gagasan',
  location: 'Peta Lokasi',
  patrol: 'Patroli'
};

export const t = (key: LabelKey, tenantType?: Tenant['type']): string => {
  if (tenantType && DICTIONARY[tenantType] && DICTIONARY[tenantType][key]) {
    return DICTIONARY[tenantType][key];
  }
  return GLOBAL_FALLBACK[key] || key;
};

export const getMemberLabel = (tenantType?: Tenant['type']) => t('member', tenantType);
export const getAdminLabel = (tenantType?: Tenant['type']) => t('admin', tenantType);
export const getCommunityLabel = (tenantType?: Tenant['type']) => t('community', tenantType);
