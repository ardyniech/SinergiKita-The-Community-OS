# Modul Ekspor Laporan Pertanggungjawaban (LPJ) Bulanan RT/RW (v2.2)

## 1. Tanggung Jawab
- Kompilasi real-time saldo kas akhir, pemasukan, pengeluaran, iuran warga, surat terbit, shift siskamling, dan laporan tamu per periode bulan/tahun.
- Dokumen Cetak/PDF LPJ Resmi dengan KOP Surat RT/RW, tabel rekapitulasi, dan kolom tanda tangan pengurus.
- Unduh spreadsheet CSV yang dapat dibuka di Microsoft Excel atau Google Sheets.
- Ringkasan eksekutif LPJ 1-klik sebar ke grup WhatsApp warga.

## 2. Struktur Modul
```
modules/lpj/
├── logic/
│   ├── lpjUtils.ts         # Format rupiah, CSV generator, template WA
│   └── useLPJ.ts           # Reactive hook Firestore aggregator
├── primitives/
│   ├── LPJContainer.tsx
│   ├── LPJHeader.tsx
│   ├── LPJSummaryCard.tsx
│   └── LPJPrintPreview.tsx
├── storage/
│   └── lpjStorage.ts       # Firestore aggregator adapter
└── index.tsx               # Public Gateway
```

## 3. Aturan Modul
- Model domain disimpan di `shared/models/lpj.ts`.
- Batas file ≤ 125 baris per file.
- Layout mobile compact dengan margin tipis.
