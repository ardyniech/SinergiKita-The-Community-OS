# Modul Crowdfunding & Donasi Proyek Warga

## Tanggung Jawab
Memfasilitasi inisiatif penggalangan dana gotong royong warga untuk fasilitas fisik/lingkungan (pos ronda, penerangan jalan), kegiatan sosial kemanusiaan, dan event warga secara transparan dan akuntabel.

## Struktur & Isolasi
- `logic/fundingUtils.ts`: Perhitungan progres pendanaan (`calculateProjectProgress`), pembentukan pesan broadcast WhatsApp (`generateProjectShareText`), dan sertifikat penghargaan donatur (`generateCertificateData`).
- `logic/useFunding.ts`: Hook data terisolasi untuk proyek dan riwayat kontribusi donatur.
- `primitives/`:
  - `FundingContainer.tsx`: Komponen kontainer utama (≤ 125 baris).
  - `FundingHeader.tsx`: Header dan navigasi tab filter status.
  - `ProjectCard.tsx`: Kartu proyek dengan indikator persentase dana, target sisa, dan tombol bagikan cepat.
  - `CreateProjectModal.tsx`: Form publikasi proyek inisiatif baru bagi pengurus.
  - `ContributeModal.tsx`: Form penyaluran donasi warga dengan preset nominal cepat.
  - `DonorCertificateModal.tsx`: Piagam penghargaan digital untuk donatur dengan opsi cetak/PDF dan bagikan.
  - `MyContributionsList.tsx`: Daftar riwayat donasi warga perorangan.
- `storage/fundingStorage.ts`: Adapter Firestore untuk koleksi `funding_projects` dan `funding_contributions`.

## Standar Kode
- Semua file terukur ≤ 125 baris tanpa pengecualian.
- Zero cross-module direct imports.
