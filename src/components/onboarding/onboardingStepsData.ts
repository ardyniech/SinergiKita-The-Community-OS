export interface OnboardingStep {
  id: number;
  title: string;
  badge: string;
  description: string;
  iconName: 'UserCheck' | 'Siren' | 'Wallet' | 'Store' | 'Sparkles';
  highlights: string[];
  actionLabel: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: 'Selamat Datang di SinergiKita! 👋',
    badge: 'Langkah 1 dari 4',
    description: 'Halo Warga! SinergiKita adalah rumah digital untuk mempererat tali silaturahmi, keamanan, dan ekonomi warga lingkungan kita.',
    iconName: 'Sparkles',
    highlights: [
      'Identitas digital warga terverifikasi',
      'Kemudahan komunikasi antar warga RT/RW',
      'Informasi warta & pengumuman resmi'
    ],
    actionLabel: 'Yuk, Lanjut!'
  },
  {
    id: 2,
    title: 'Keamanan Lingkungan & Alarm SOS 🚨',
    badge: 'Langkah 2 dari 4',
    description: 'Butuh bantuan darurat di lingkungan? Cukup satu sentuhan pada tombol SOS untuk mengirim sinyal posisi darurat ke seluruh warga.',
    iconName: 'Siren',
    highlights: [
      'Respon cepat situasi darurat & medis',
      'Peta lokasi kejadian secara real-time',
      'Jaringan Handy Talkie digital warga'
    ],
    actionLabel: 'Paham, Lanjut!'
  },
  {
    id: 3,
    title: 'Transparansi Kas & Koperasi 💰',
    badge: 'Langkah 3 dari 4',
    description: 'Pantau laporan iuran kas warga secara terbuka serta nikmati fasilitas Koperasi Simpan Pinjam milik bersama.',
    iconName: 'Wallet',
    highlights: [
      'Pencatatan iuran transparan & otomatis',
      'Persetujuan ganda (Dual Approval) aman',
      'Simpan pinjam & bagi hasil SHU Koperasi'
    ],
    actionLabel: 'Mantap, Lanjut!'
  },
  {
    id: 4,
    title: 'Pasar Brotherhood & UMKM 🛍️',
    badge: 'Langkah 4 dari 4',
    description: 'Dukung usaha tetangga sekitar! Anda bisa berjualan produk UMKM atau membeli barang & jasa antar warga dengan mudah.',
    iconName: 'Store',
    highlights: [
      'Promosi gratis untuk usaha warga lokal',
      'Dukungan sistem Kasir POS & QRIS',
      'Saling bantu ekonomi lingkungan'
    ],
    actionLabel: 'Selesai & Mulai Jelajah! 🎉'
  }
];
