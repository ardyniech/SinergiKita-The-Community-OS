# Modul Kontak Darurat & Fasilitas Umum Lingkungan (v2.2)

## 1. Tanggung Jawab
- Katalog nomor telepon darurat & instansi penting (Puskesmas, Polsek, Babinsa, Pemadam Kebakaran, PLN, PDAM, Pos RT/RW).
- Panggil telepon otomatis via `tel:` protokol & tautan WhatsApp instan.
- Pengelolaan daftar kontak darurat lingkungan oleh Pengurus RT/RW.

## 2. Struktur Modul
```
modules/contacts/
├── logic/
│   ├── contactUtils.ts     # Format nomor HP, badge kategori
│   └── useContacts.ts      # Reactive hook Firestore
├── primitives/
│   ├── ContactsContainer.tsx
│   ├── ContactsHeader.tsx
│   ├── ContactCard.tsx
│   └── AddContactModal.tsx
├── storage/
│   └── contactsStorage.ts  # Firestore adapter (emergency_contacts)
└── index.tsx               # Public Gateway
```

## 3. Aturan Modul
- Model domain disimpan di `shared/models/contacts.ts`.
- Batas file ≤ 125 baris per file.
- Layout mobile compact dengan margin tipis.
