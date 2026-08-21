# Modul Agenda & Kegiatan Warga (v2.2)

## 1. Tanggung Jawab
- Jadwal kegiatan warga (Kerja Bakti, Rapat RT/RW, Posyandu, Senam, Acara Keagamaan/Peringatan 17-an).
- Konfirmasi Kehadiran (RSVP) warga secara mandiri.
- Pembuatan agenda baru oleh Pengurus.
- Broadcast undangan acara ke grup WhatsApp warga dalam 1-klik.

## 2. Struktur Modul
```
modules/events/
├── logic/
│   ├── eventUtils.ts      # Kategori, badge, template WA
│   └── useEvents.ts       # Reactive hook Firestore
├── primitives/
│   ├── EventsContainer.tsx
│   ├── EventsHeader.tsx
│   ├── EventCard.tsx
│   └── CreateEventModal.tsx
├── storage/
│   └── eventsStorage.ts   # Firestore adapter (community_events)
└── index.tsx              # Public Gateway
```

## 3. Aturan Modul
- Model domain disimpan di `shared/models/events.ts`.
- Batas file ≤ 125 baris per file.
- Layout mobile compact dengan margin tipis.
