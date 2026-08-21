import { Tenant } from '../types';

export const getMemberLabel = (tenantType?: Tenant['type']) => {
  switch (tenantType) {
    case 'rt-rw':
      return 'Warga';
    case 'ojol':
    case 'paguyuban':
    case 'petani':
    case 'umkm':
      return 'Anggota';
    default:
      return 'Warga';
  }
};

export const getAdminLabel = (tenantType?: Tenant['type']) => {
  switch (tenantType) {
    case 'rt-rw':
      return 'Ketua/Pengurus';
    case 'ojol':
    case 'paguyuban':
    case 'petani':
    case 'umkm':
      return 'Admin/Koordinator';
    default:
      return 'Admin';
  }
};

export const getCommunityLabel = (tenantType?: Tenant['type']) => {
  switch (tenantType) {
    case 'rt-rw':
      return 'RT/RW';
    case 'ojol':
      return 'Komunitas Ojol';
    case 'paguyuban':
      return 'Paguyuban';
    case 'petani':
      return 'Kelompok Tani';
    case 'umkm':
      return 'Sentra UMKM';
    default:
      return 'Komunitas';
  }
};
