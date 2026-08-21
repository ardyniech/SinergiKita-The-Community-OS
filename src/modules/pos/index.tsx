import React from 'react';
import { POSContainer } from './primitives/POSContainer';
import { integrationRegistry } from '../../core/integration_points';
import { ShoppingCart } from 'lucide-react';

export const POSModule = () => {
  return <POSContainer />;
};

export function initPOSModule() {
  integrationRegistry.register({
    id: 'pos-nav',
    slot: 'BottomNavEntry',
    component: (
      <div key="pos-nav" className="flex flex-col items-center gap-1">
        <ShoppingCart size={20} />
        <span className="text-[8px] font-black uppercase tracking-widest">Kasir</span>
      </div>
    ),
    order: 7
  });
}

export * from './logic/usePOS';
