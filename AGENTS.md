# Project UI Standards (STRICT SOP)

> [!CAUTION]
> **CRITICAL RULE: ZERO WIDE MARGINS FOR MOBILE**
> The user frequently complains about excessive side margins, padding, and "empty white spaces" on the left/right of the screen for mobile. 
> YOU MUST STRICTLY ADHERE TO TIGHT SPACING:
> - `px-2` or `px-3` MAX for screen edges.
> - `p-2`, `p-3`, or `p-4` MAX for inner cards.
> - ABSOLUTELY NO `px-6`, `p-6`, `p-8` or wide margins (`m-6`, etc.) on mobile.
> - **DO NOT REPEAT THIS MISTAKE.** Ensure mobile UI uses almost the full width of the screen.

> [!CAUTION]
> **CRITICAL RULE: CODE SIZE LIMIT**
> STICK TO A MAXIMUM OF ~125 LINES PER FILE.
> Modularize aggressively. Split code into smaller components and files.

- **Mobile-First Compactness**: The UI MUST be high-density, professional, and optimized for mobile screens.
- **Spacing Constraints (STRICTLY ENFORCED)**:
  - Container padding: Maximum `px-2` or `px-3` for sides on mobile. 
  - Maximum overall padding: `p-4` (1rem). Avoid `p-6` or `p-8` completely.
  - Maximum overall margin: `m-4` (1rem). 
  - Maximum gap: `gap-3` or `gap-4`.
  - Maximum vertical spacing: `space-y-3` or `space-y-4`.
  - NO `max-w-7xl` or excessive `mx-auto` causing large empty side spaces on small screens unless necessary for desktop. On mobile, elements should span close to the full width.
- **File Length Guideline**: Strive for modularity. Target around 125 lines per file where possible, split logic into smaller components.

> [!CAUTION]
> **CRITICAL RULE: PHILOSOPHY "BUILD ONE AND FORGET" & STRICT PHASE ISOLATION**
> 1. Philosophy "Build One and Forget": Every module is built in total isolation with zero tight coupling. Once completed and tested, it runs reliably on its own without needing future modifications or maintenance.
> 2. Write code using Atomic Architecture (1 file = 1 single responsibility/functionality).
> 3. Strict Phase Lock: We are currently in Phase 0 (F0 - Platform Foundation) & Phase 1 (F1 - Ojol Community Module). Once we move to Phase 2 (F2), F0 and F1 code are STRICTLY LOCKED and MUST NOT be modified or refactored further.

> [!CAUTION]
> **CRITICAL RULE: BAHASA MANUSIA AWAM**
> Gunakan Bahasa Indonesia yang ringkas, ramah, dan mudah dipahami orang awam. DILARANG MENAMPILKAN POTONGAN KODE, NAMA FILE, ATAU JARGON KODING DALAM RESPON KEPADA USER. Selalu jelaskan perubahan dalam bentuk fungsi/manfaat langsung yang dirasakan pengguna.
