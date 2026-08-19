# SinergiKita Community OS - Architecture & Data Isolation

## Overview
SinergiKita is a full-stack, mobile-first operating system designed for grassroots community management (RT/RW, paguyuban, worker cooperatives), built with React 19, Vite, Tailwind CSS, Express, TypeScript, Firebase (Auth & Firestore), and PostgreSQL (Drizzle ORM).

---

## 1. Modular Domain Architecture

The application enforces strict separation of concerns across its financial and community domains:

### A. Buku Kas Komunitas (General Ledger)
- **Path**: `src/components/finance/FinanceLedger.tsx`
- **Data Source**: PostgreSQL via REST API (`/api/finances`)
- **Capabilities**: Dual-signature approvals (> Rp 1.000.000), physical vs system cash reconciliation, citizen dues billing reminders, CSV and PDF report generation.
- **RBAC**: Write operations restricted to `admin`, `ketua`, `bendahara`, and `superadmin`.

### B. Koperasi Simpan Pinjam (Micro-Savings & Credit)
- **Path**: `src/components/koperasi/KoperasiModule.tsx`
- **Sub-components**: `KoperasiSHUCalculator.tsx`, `KoperasiLoanWorkflow.tsx`
- **Data Source**: Firebase Firestore (`koperasi` and `koperasi_loans` collections)
- **Capabilities**:
  - Member deposit recording and real-time pooled capital calculation.
  - Sisa Hasil Usaha (SHU) annual dividend estimator based on 40% Jasa Modal and 60% Jasa Usaha.
  - Micro-credit loan application workflow with administrative review (`pending` / `approved` / `rejected`).
- **Zero Double-Write**: Cooperative transactions are recorded strictly to Firestore without polluting the general ledger.

### C. Funding Proyek Warga (Crowdfunding)
- **Path**: `src/components/funding/FundingModule.tsx`
- **Sub-components**: `FundingCertificateModal.tsx`
- **Data Source**: Firebase Firestore (`projects` and `funding_contributions` collections)
- **Capabilities**:
  - Project creation, target goal tracking, real-time backer incrementing, category filtering.
  - Per-user contribution history tracking.
  - Official PDF Participation Certificate generation (`jspdf`).

### D. Pasar Brotherhood (P2P Commerce)
- **Path**: `src/components/MarketplaceModule.tsx`
- **Sub-components**: `ProductReviewsModal.tsx`, `ProductCard.tsx`, `MarketplaceForm.tsx`
- **Data Source**: Firebase Firestore (`marketplace` collection)
- **Capabilities**: Listing creation, WhatsApp contact integration, 1-5 star ratings, buyer reviews.

### E. Emergency SOS & Real-Time Alert System
- **Path**: `src/components/RealTimeNotifications.tsx`, `src/components/EmergencySystem.tsx`
- **Data Source**: Firebase Firestore (`emergencies`, `active_locations` collections)
- **Capabilities**: Dual-tone synthesized Web Audio siren, Indonesian TTS voice broadcast, browser Push Notifications, live GPS coordinates.

---

## 2. Multi-Tenant Isolation & Security

- **Tenant Scope (`tenantId`)**: Every database record is strictly tagged with an immutable `tenantId`.
- **Backend Token Verification**: Express middleware (`verifyFirebaseToken`) extracts and verifies the Firebase ID token for all protected routes (`/api/finances`, `/api/ai/*`, `/api/community/*`, `/api/recommendations`).
- **Tenant Spoofing Prevention**: On `POST /api/finances`, non-superadmin users are strictly restricted to mutating records within their authenticated `profile.tenantId`.
- **Centralized SuperAdmin**: Controlled via the `SUPERADMIN_EMAILS` environment variable, ensuring zero hardcoded email arrays in business logic.
- **Rate Limiting**: `apiLimiter` enforces a 20 requests/minute limit per user/IP.

---

## 3. UI/UX & Mobile Standards
- **Tight Spacing**: Screen edges constrained to `px-2` / `px-3` on mobile; container padding capped at `p-4`.
- **High-Density Typography**: Minimum `text-[10px]`-`text-xs` font scale with `tabular-nums` for currency values.
- **Touch Ergonomics**: All interactive elements maintain a minimum 44×44px hit-slop.
- **4-State Reliability**: Explicit handling for `Loading`, `Empty`, `Error`, and `Data` states across all data views.
