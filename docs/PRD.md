# SinergiKita Community OS - Product Requirements Document (PRD)

## 1. Product Summary & Vision
SinergiKita is a mobile-first Community Operating System (OS) engineered for grassroots community administration in Indonesia (RT/RW, paguyuban, worker cooperatives, and neighborhood associations). The system combines transparent financial management, mutual aid, real-time emergency safety broadcasts, digital commerce, and AI-driven community governance.

---

## 2. Target Users & Personas
1. **Ketua / Pengurus RT/RW**: Needs centralized oversight of residents, automated emergency alerts, transparent bookkeeping, and weekly AI executive summaries.
2. **Bendahara Komunitas**: Needs dual-signature expenditure authorization (> Rp 1jt), physical cash drawer reconciliation, billing reminders, and automated export (PDF/CSV).
3. **Anggota Koperasi**: Needs self-service micro-savings deposits, transparent annual SHU dividend estimations, and accessible micro-credit loan applications.
4. **Warga Biasa / Resident**: Needs 1-tap SOS alarm broadcast, local marketplace (Pasar Brotherhood), mutual aid relief (Santunan), and participation in crowdfunding initiatives.

---

## 3. Functional Modules & Requirements

### 3.1 Financial Ledger (Buku Kas Komunitas)
- **Double-Entry Style Accounting**: Categorized income and expense records with balance calculations.
- **Dual-Signature Authorization**: Any transaction > Rp 1.000.000 requires secondary approval from Chairman/Treasurer.
- **Physical Cash Reconciliation**: Compares system ledger balance against physical cash in drawer, highlighting surplus/deficits.
- **Citizen Dues Billing**: Generates pre-formatted WhatsApp payment reminders for delinquent dues.
- **Exporting**: One-click generation of PDF statements (`jspdf-autotable`) and CSV files (`papaparse`).

### 3.2 Koperasi Simpan Pinjam
- **Member Savings**: Voluntary and mandatory deposits recorded in real-time.
- **Annual SHU Calculator**: Automated dividend estimation distributing 40% Jasa Modal (capital share) and 60% Jasa Usaha (active transaction share).
- **Micro-Credit Loan Workflow**: Loan applications with customizable tenor (1-12 months), monthly installment calculation, guarantor nomination, and administrative review status (`pending` -> `approved` / `rejected`).

### 3.3 Funding Proyek Warga (Crowdfunding)
- **Initiative Crowdfunding**: Propose neighborhood improvement projects with funding targets.
- **Real-Time Backer Tracking**: Instant contribution recording with donor counts and progress bar visualization.
- **Digital Certificates**: Generation of official printable/downloadable PDF Participation Certificates with digital community endorsement.

### 3.4 Emergency SOS & Security System
- **1-Tap Emergency Trigger**: Instant broadcast of high-priority emergency incidents with GPS location coordinates.
- **Multi-Channel Alert Dispatch**:
  - Web Audio API dual-tone synthesized police siren (100% offline & online reliability).
  - Indonesian Text-to-Speech (TTS) voice announcer.
  - Browser Push Notifications.
  - In-app high-visibility warning toasts.

### 3.5 Pasar Brotherhood (P2P Marketplace)
- **Local Commerce Listings**: Product and service ads with photos, pricing, and direct WhatsApp chat links.
- **5-Star Rating & Review System**: Verified resident feedback score calculation with fraud prevention (sellers cannot rate own listings).

### 3.6 Communication & Handy Talkie (PTT)
- **WebRTC Push-to-Talk (PTT)**: Low-latency walkie-talkie voice channels for night patrol (Ronda) and emergency response.
- **Community Chat & Warta Warga**: Real-time group messaging and high-priority public announcements.

### 3.7 AI Insights Engine (Google Gemini)
- **Executive Summaries**: Automated weekly health reports summarizing ledger trends, member growth, and unresolved issues.
- **Actionable Community Tips**: Context-aware incident mitigation recommendations.

---

## 4. Non-Functional Requirements & UX Constraints
- **Zero Wide Margins**: Screen padding restricted to `px-2`/`px-3` on mobile devices; zero unnecessary whitespace.
- **Touch Ergonomics**: All interactive elements (buttons, inputs, dropdowns) maintain ≥ 44×44px hit-slop.
- **Multi-Tenant Isolation**: Every database operation is strictly scoped to the authenticated `tenantId`.
- **4-State Reliability**: Explicit `Loading`, `Empty`, `Error`, and `Data` views across every module.
