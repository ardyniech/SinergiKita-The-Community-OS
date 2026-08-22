export interface GlossaryKeys {
  member: string;
  members: string;
  iuran: string;
  patungan: string;
  laporan: string;
  pengumuman: string;
  salam: string;
  obrolan: string;
}

export const GLOSSARIES: Record<'formal' | 'family' | 'ojol' | 'casual', GlossaryKeys> = {
  formal: {
    member: 'Warga',
    members: 'Daftar Warga',
    iuran: 'Iuran Kas',
    patungan: 'Patungan Dana',
    laporan: 'Laporan Resmi',
    pengumuman: 'Warta Pengumuman',
    salam: 'Selamat Datang Bapak/Ibu',
    obrolan: 'Obrolan Komunitas'
  },
  family: {
    member: 'Tetangga',
    members: 'Keluarga Tetangga',
    iuran: 'Kas Gotong Royong',
    patungan: 'Urunan Kekeluargaan',
    laporan: 'Aduan Saling Jaga',
    pengumuman: 'Kabar Tetangga',
    salam: 'Halo Tetangga, Sehat Selalu!',
    obrolan: 'Ruang Silaturahmi'
  },
  ojol: {
    member: 'Rider/Sobat',
    members: 'Garda Pangkalan',
    iuran: 'Uang Kas Solidaritas',
    patungan: 'Donasi Satu Aspal',
    laporan: 'Laporan Kondisi',
    pengumuman: 'Kabar Pangkalan',
    salam: 'Salam Satu Aspal, Ndan!',
    obrolan: 'Frekuensi Kopi Darat'
  },
  casual: {
    member: 'Sobat/Bro',
    members: 'Circle Kita',
    iuran: 'Kas Santai',
    patungan: 'Saweran Kumpul',
    laporan: 'Aduan Cepat',
    pengumuman: 'Kabar Pengumuman',
    salam: 'Yo! Wassup Sobat!',
    obrolan: 'Grup Nongkrong'
  }
};

export function getGlossary(style?: 'formal' | 'family' | 'ojol' | 'casual'): GlossaryKeys {
  return GLOSSARIES[style || 'formal'] || GLOSSARIES.formal;
}
