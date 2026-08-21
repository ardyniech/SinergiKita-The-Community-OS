import { describe, it, expect } from 'vitest';
import {
  getConditionBadge,
  getLoanStatusBadge,
  formatInventoryCategory,
  generateBorrowWhatsAppMessage
} from '../src/modules/inventory/logic/inventoryUtils';

describe('Inventory Module Logic', () => {
  it('should return correct condition badge', () => {
    expect(getConditionBadge('good').label).toBe('Kondisi Baik');
    expect(getConditionBadge('fair').label).toBe('Cukup Baik');
    expect(getConditionBadge('needs_repair').label).toBe('Perlu Servis');
  });

  it('should return correct loan status badge', () => {
    expect(getLoanStatusBadge('requested').label).toBe('Menunggu Persetujuan');
    expect(getLoanStatusBadge('approved').label).toBe('Disetujui');
    expect(getLoanStatusBadge('in_use').label).toBe('Sedang Dipakai');
    expect(getLoanStatusBadge('returned').label).toBe('Sudah Dikembalikan');
    expect(getLoanStatusBadge('rejected').label).toBe('Ditolak');
  });

  it('should format inventory category appropriately', () => {
    expect(formatInventoryCategory('tenda_kursi')).toBe('Tenda & Kursi');
    expect(formatInventoryCategory('sound_elektronik')).toBe('Sound & Elektronik');
    expect(formatInventoryCategory('alat_kebersihan')).toBe('Alat Kebersihan');
    expect(formatInventoryCategory('perkakas')).toBe('Perkakas Kerja');
    expect(formatInventoryCategory('unknown')).toBe('Lainnya');
  });

  it('should generate formatted WhatsApp message with borrower details', () => {
    const msg = generateBorrowWhatsAppMessage({
      tenantName: 'RT 05 Sukamaju',
      itemName: 'Tenda Terpal 4x6',
      quantity: 2,
      borrowerName: 'Pak Budi',
      borrowerHouseNo: 'B3/12',
      startDate: '2026-09-01',
      endDate: '2026-09-03',
      purpose: 'Acara tasyakuran'
    });

    expect(msg).toContain('RT 05 Sukamaju');
    expect(msg).toContain('Tenda Terpal 4x6');
    expect(msg).toContain('2 unit');
    expect(msg).toContain('Pak Budi');
    expect(msg).toContain('B3/12');
    expect(msg).toContain('Acara tasyakuran');
  });
});
