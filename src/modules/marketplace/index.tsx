import React from 'react';
import { MarketplaceContainer } from './primitives/MarketplaceContainer';
import { integrationRegistry } from '../../core/integration_points';
import { ShoppingBag } from 'lucide-react';

export const MarketplaceModule = () => {
  return <MarketplaceContainer />;
};

export function initMarketplaceModule() {
  integrationRegistry.register({
    id: 'marketplace-nav',
    slot: 'BottomNavEntry',
    component: (
      <div key="marketplace-nav" className="flex flex-col items-center gap-1">
        <ShoppingBag size={20} />
        <span className="text-[8px] font-black uppercase tracking-widest">Market</span>
      </div>
    ),
    order: 6
  });
}

export * from './logic/useMarketplace';
