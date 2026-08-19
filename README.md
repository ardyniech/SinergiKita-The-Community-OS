# SinergiKita: Community Operating System

SinergiKita is a comprehensive, grassroots-first platform designed to democratize community administration. It provides community leaders and members with powerful tools to manage finances, cooperative savings, crowdfunding, social welfare, security, and communication in a transparent, secure, and efficient manner.

## 🚀 Core Features & Modules

- **Dashboard Analytics**: Real-time overview of community health, quick SOS trigger, and financial status.
- **Buku Kas Komunitas (Finance Ledger)**: Full double-entry style ledger with dual-signature approvals (> Rp 1jt), physical cash reconciliation, dues tracking, and CSV/PDF export powered by PostgreSQL.
- **Koperasi Simpan Pinjam**: Member deposit and savings management backed by Firestore with transparent pooled fund tracking.
- **Funding Proyek Warga**: Grassroots crowdfunding engine for community initiatives, renovations, and micro-ventures.
- **Emergency SOS System**: High-priority real-time security alerts with GPS coordinates and instant push broadcasts.
- **Pasar Brotherhood (Marketplace)**: Local peer-to-peer commerce with product reviews and WhatsApp contact integration.
- **Kasir (POS)**: Fast point-of-sale register for community shops and cooperative stores.
- **Social Welfare (Info Santunan)**: Crowdsourced mutual aid and social assistance for vulnerable residents.
- **AI Community Insights**: Weekly executive summaries and incident handling tips powered by Google Gemini AI.

## 🛠️ Technical Stack & Architecture

- **Frontend**: React 19, Vite, Tailwind CSS, Motion (`motion/react`), Lucide React.
- **Backend API**: Node.js, Express, Rate Limiting (`express-rate-limit`), Zod validation.
- **Dual-Database Architecture**:
  - **PostgreSQL (Drizzle ORM)**: High-integrity financial ledger records (`/api/finances`).
  - **Firebase Firestore**: Real-time sync for Koperasi, Funding, Chat, SOS, Announcements, and Marketplace.
- **Authentication & RBAC**: Firebase Auth with Role-Based Access Control (`superadmin`, `admin`, `ketua`, `bendahara`, `sekretaris`, `member`) and strict multi-tenant isolation.
- **AI Engine**: Google Gemini API (`@google/genai`) with fallback handlers for rate-limit resilience.

## 📐 Mobile-First UI/UX Standards

This project adheres to strict high-density, accessible UI standards:
- **Tight Mobile Spacing**: `px-2` to `px-3` screen edge padding, `p-4` max container padding, zero wide empty margins.
- **Readable Typography**: High contrast, minimum `text-[10px]`-`text-xs` body font, `tabular-nums` for currency.
- **4-State Reliability**: Every data panel implements explicit `Loading`, `Empty`, `Error`, and `Data` states.
- **Accessible Touch Targets**: Minimum 44×44px interactive controls.
- **Honest Feedback**: In-development features utilize a standardized `<ComingSoon />` component instead of misleading stub states.

## 📦 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Copy `.env.example` to `.env` and configure required keys (`GEMINI_API_KEY`, `SUPERADMIN_EMAILS`, etc.).

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Verify Build & Lint**:
   ```bash
   npm run lint
   npm run build
   ```

---

Built with ❤️ for grassroots communities across Indonesia.
