# Modul Layanan Surat & Administrasi Warga (v2.2)

## 1. Tanggung Jawab
- Permohonan surat pengantar & keterangan warga secara mandiri (Domisili, SKCK, Usaha, SKTM, Kelahiran/Kematian).
- Tinjauan dan persetujuan pengurus RT/RW (Ketua/Sekretaris).
- Penomoran otomatis dan cetak salinan surat resmi berformat standar dengan QR Code verifikasi.
- Integrasi pemberitahuan WhatsApp ke pengurus dan warga.

## 2. Struktur Modul
```
modules/letters/
├── logic/
│   ├── letterUtils.ts     # Format kategori, status, nomor surat, template WA
│   └── useLetters.ts      # Reactive hook Firestore
├── primitives/
│   ├── LettersContainer.tsx
│   ├── LetterHeader.tsx
│   ├── LetterCard.tsx
│   ├── RequestLetterModal.tsx
│   ├── ApproveLetterModal.tsx
│   └── LetterPreviewModal.tsx
├── storage/
│   └── lettersStorage.ts # Firestore adapter (letter_requests)
└── index.tsx             # Public Gateway
```

## 3. Aturan Modul
- Model domain disimpan di `shared/models/letters.ts`.
- Batas file ≤ 125 baris per file.
- Layout mobile compact dengan margin tipis.
