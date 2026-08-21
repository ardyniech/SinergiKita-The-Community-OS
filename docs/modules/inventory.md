# Modul Inventaris & Logistik Warga (v2.2)

## 1. Tanggung Jawab
- Pengelolaan katalog aset/perlengkapan bersama (tenda, kursi, sound system, proyektor, perkakas).
- Permohonan peminjaman mandiri oleh warga dengan jadwal (tgl pinjam - tgl kembali), keperluan, dan jumlah unit.
- Approval dan pelacakan status peminjaman (Menunggu Persetujuan, Disetujui, Sedang Dipakai, Sudah Dikembalikan).
- Notifikasi WhatsApp instan ke penanggung jawab / pengurus RT.

## 2. Struktur Modul
```
modules/inventory/
├── logic/
│   ├── inventoryUtils.ts   # Formatting status, validasi stok, template pesan WA
│   └── useInventory.ts      # State lifecycle, reactive subscription
├── primitives/
│   ├── InventoryContainer.tsx
│   ├── InventoryHeader.tsx
│   ├── InventoryCard.tsx
│   ├── ItemFormModal.tsx
│   ├── BorrowRequestModal.tsx
│   └── LoanHistoryList.tsx
├── storage/
│   └── inventoryStorage.ts # Firestore adapter (inventory_items & inventory_loans)
└── index.tsx               # Public Gateway
```

## 3. Aturan Modul
- Model domain disimpan terpusat di `shared/models/inventory.ts`.
- Batas baris kode ≤ 125 baris per file.
- Layout mobile compact dengan margin tipis.
