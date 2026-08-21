# Modul Wajib Lapor Tamu 1x24 Jam (v2.2)

## 1. Tanggung Jawab
- Pelaporan tamu menginap >24 jam secara mandiri oleh warga (Nama tamu, NIK, No HP, Hubungan, Tgl Kedatangan, Lama Menginap, Plat Kendaraan, Maksud Kunjungan).
- Verifikasi dan pemantauan oleh Pengurus RT & Petugas Siskamling.
- Status pemantauan (Terkirim, Diverifikasi, Sudah Kembali).
- Broadcast laporan ketertiban ke grup WhatsApp pengurus/warga.

## 2. Struktur Modul
```
modules/guests/
├── logic/
│   ├── guestUtils.ts      # Status badge, template WA
│   └── useGuests.ts       # Reactive hook Firestore
├── primitives/
│   ├── GuestsContainer.tsx
│   ├── GuestsHeader.tsx
│   ├── GuestCard.tsx
│   └── ReportGuestModal.tsx
├── storage/
│   └── guestsStorage.ts   # Firestore adapter (guest_reports)
└── index.tsx              # Public Gateway
```

## 3. Aturan Modul
- Model domain disimpan di `shared/models/guests.ts`.
- Batas file ≤ 125 baris per file.
- Layout mobile compact dengan margin tipis.
