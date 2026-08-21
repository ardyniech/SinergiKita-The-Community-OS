# Modul Koperasi & Simpan Pinjam Komunitas

## Tanggung Jawab
Mengelola permodalan gotong royong, simpanan berkala anggota (pokok, wajib, sukarela), pengajuan pinjaman modal usaha mandiri tanpa agunan, serta kalkulasi pembagian Sisa Hasil Usaha (SHU) secara transparan.

## Struktur & Isolasi
- `logic/koperasiUtils.ts`: Pure functions untuk perhitungan SHU proporsional & simulasi cicilan pinjaman per bulan.
- `logic/useKoperasi.ts`: State management terisolasi & event dispatching `AUDIT_LOG`.
- `primitives/`:
  - `KoperasiContainer.tsx`: Tampilan navigasi tab mobile-first ringkas.
  - `KoperasiSummary.tsx`: Ringkasan saldo simpanan pribadi & total pool modal.
  - `DepositForm.tsx`: Form setoran simpanan dengan preset nominal.
  - `LoanWorkflow.tsx`: Alur permohonan pinjaman modal mandiri.
  - `LoanApplicationForm.tsx`: Form input pinjaman lengkap dengan simulasi cicilan real-time.
  - `LoanCardItem.tsx`: Kartu status pinjaman dan persetujuan pengurus.
  - `SHUCalculator.tsx`: Kalkulator proyeksi pembagian SHU anggota dan bagikan via WhatsApp.
  - `KoperasiHistory.tsx`: Daftar mutasi kas simpan pinjam.
- `storage/koperasiStorage.ts`: Firestore adapter khusus koleksi `koperasi` & `koperasi_loans`.

## Standar Kode
- Semua file terukur ≤ 125 baris tanpa pengecualian.
- Zero cross-module direct imports (hanya menggunakan `shared/models`).
