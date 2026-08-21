# Modul Suara Warga & E-Voting Digital (v2.2)

## 1. Tanggung Jawab
- Pembuatan jajak pendapat / rembuk digital warga untuk pengambilan keputusan mufakat bersama.
- Pemilihan transparan dengan visual bar persentase hasil real-time.
- Integritas suara (1 akun/warga 1 suara per topik musyawarah) menggunakan transaksi Firestore.
- Fitur bagikan hasil / undangan voting ke grup WhatsApp warga.

## 2. Struktur Modul
```
modules/voting/
├── logic/
│   ├── votingUtils.ts       # Kalkulasi persentase hasil, kategori, share WhatsApp
│   └── useVoting.ts         # Hook state polling & user vote verification
├── primitives/
│   ├── VotingContainer.tsx
│   ├── VotingHeader.tsx
│   ├── PollCard.tsx
│   └── CreatePollModal.tsx
├── storage/
│   └── votingStorage.ts    # Firestore adapter (polls & poll_votes)
└── index.tsx               # Public Gateway
```

## 3. Aturan Modul
- Model domain terpusat di `shared/models/voting.ts`.
- Batas baris kode ≤ 125 baris per file.
- Layout mobile compact dengan margin tipis.
