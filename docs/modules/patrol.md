# Modul Jadwal Ronda & Siskamling (v2.2)

## 1. Tanggung Jawab
- Pengelolaan jadwal giliran ronda malam warga (Senin s/d Minggu).
- Pencatatan absensi / presensi kehadiran petugas ronda harian (Hadir, Izin, Digantikan).
- Pencatatan laporan situasi pos kamling.
- Pengiriman jadwal dan pemberitahuan ronda ke grup WhatsApp warga.

## 2. Struktur Modul
```
modules/patrol/
├── logic/
│   ├── patrolUtils.ts     # Label hari, filter shift hari ini, template WA
│   └── usePatrol.ts       # Reactive hook Firestore
├── primitives/
│   ├── PatrolContainer.tsx
│   ├── PatrolHeader.tsx
│   ├── DayScheduleCard.tsx
│   ├── CheckinModal.tsx
│   └── AddOfficerModal.tsx
├── storage/
│   └── patrolStorage.ts  # Firestore adapter (patrol_schedules & patrol_checkins)
└── index.tsx             # Public Gateway
```

## 3. Aturan Modul
- Model domain disimpan di `shared/models/patrol.ts`.
- Batas file ≤ 125 baris per file.
- Layout mobile compact dengan margin tipis.
