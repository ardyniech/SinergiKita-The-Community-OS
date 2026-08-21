import { describe, it, expect } from 'vitest';
import {
  generateWhatsAppOrderUrl,
  formatMarketplaceCategory
} from '../src/modules/marketplace/logic/marketplaceUtils';
import { MarketplaceProduct, AppUser } from '../src/shared/models';

describe('Marketplace Module Logic', () => {
  const dummyProduct: MarketplaceProduct = {
    id: 'prod_1',
    tenantId: 'tenant_123',
    sellerId: 'user_1',
    sellerName: 'Bu Siti',
    sellerPhone: '08123456789',
    sellerHouseNo: 'Blok A/10',
    title: 'Nasi Kuning Komplit',
    description: 'Enak dan gurih',
    price: 15000,
    category: 'kuliner',
    stock: 20,
    status: 'available',
    createdAt: null
  };

  const dummyBuyer: AppUser = {
    uid: 'user_2',
    email: 'budi@warga.id',
    displayName: 'Pak Budi',
    houseNumber: 'Blok B/15',
    role: 'member',
    tenantId: 'tenant_123'
  };

  it('should generate WhatsApp order URL with normalized Indonesian phone number', () => {
    const url = generateWhatsAppOrderUrl(dummyProduct, dummyBuyer, 2);
    expect(url).toContain('https://wa.me/628123456789');
    expect(url).toContain(encodeURIComponent('Nasi Kuning Komplit'));
    expect(url).toContain(encodeURIComponent('30.000'));
    expect(url).toContain(encodeURIComponent('Pak Budi'));
  });

  it('should format category names properly', () => {
    expect(formatMarketplaceCategory('kuliner')).toBe('Kuliner & Snack');
    expect(formatMarketplaceCategory('sembako')).toBe('Sembako & Sayur');
    expect(formatMarketplaceCategory('jasa')).toBe('Jasa & Keahlian');
    expect(formatMarketplaceCategory('pakaian')).toBe('Pakaian & Fashion');
    expect(formatMarketplaceCategory('kerajinan')).toBe('Kerajinan Tangan');
    expect(formatMarketplaceCategory('other')).toBe('Lain-lain');
  });
});
