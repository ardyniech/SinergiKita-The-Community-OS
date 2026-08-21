# Finance & Dues Module (SinergiKita)

## Responsibilities
- Real-time community cash ledger (pemasukan & pengeluaran).
- Dues billing management (iuran berkala, periode, batas waktu).
- Member QRIS & bank transfer payments with receipt confirmation.
- Treasurer payment verification flow automatically crediting the cash ledger.
- Community QRIS and bank account credentials configuration.

## Storage Layer
- `financeStorage.ts`: Firestore collections `transactions` and `recurring_transactions`.
- `duesStorage.ts`: Firestore collections `dues_billings` and `dues_payments`.
- Firestore security rules enforce strict tenant isolation and role-based permissions (Member vs Treasurer/Admin).

## Mobile & UI Standards
- Compact native-like design with mobile padding (p-2 / p-3).
- Direct tab navigation: Buku Kas, Iuran & QRIS, Atur QRIS.
- All module files strictly adhere to the ≤ 125 lines threshold.
