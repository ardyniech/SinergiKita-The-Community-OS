import { MarketplaceProduct, AppUser } from '../../../shared/models';

export function generateWhatsAppOrderUrl(product: MarketplaceProduct, buyer: AppUser | null, quantity: number = 1): string {
  const phone = (product.sellerPhone || '').replace(/\D/g, '');
  const cleanPhone = phone.startsWith('0') ? '62' + phone.slice(1) : phone.startsWith('62') ? phone : '62' + phone;
  const buyerName = buyer?.displayName || buyer?.email.split('@')[0] || 'Warga';
  const buyerHouse = buyer?.houseNumber ? ` (${buyer.houseNumber})` : '';
  const total = (product.price * quantity).toLocaleString('id-ID');

  const text = [
    `Halo ${product.sellerName}, saya *${buyerName}*${buyerHouse} ingin memesan di *Pasar Warga SinergiKita*:`,
    `\n🛍️ *${product.title}*`,
    `🔢 Jumlah: ${quantity} porsi/item`,
    `💵 Total: Rp ${total}`,
    `\nApakah pesanan masih tersedia untuk diantar / diambil? Terima kasih!`
  ].join('\n');

  if (!cleanPhone || cleanPhone === '62') {
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function formatMarketplaceCategory(cat: string): string {
  switch (cat) {
    case 'kuliner': return 'Kuliner & Snack';
    case 'sembako': return 'Sembako & Sayur';
    case 'jasa': return 'Jasa & Keahlian';
    case 'pakaian': return 'Pakaian & Fashion';
    case 'kerajinan': return 'Kerajinan Tangan';
    default: return 'Lain-lain';
  }
}
