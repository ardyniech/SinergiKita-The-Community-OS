import React from 'react';
import { FundingContainer } from './primitives/FundingContainer';
import { integrationRegistry } from '../../core/integration_points';
import { Rocket } from 'lucide-react';

export const FundingModule = () => {
  return <FundingContainer />;
};

export function initFundingModule() {
  integrationRegistry.register({
    id: 'funding-nav',
    slot: 'BottomNavEntry',
    component: (
      <div key="funding-nav" className="flex flex-col items-center gap-1">
        <Rocket size={20} />
        <span className="text-[8px] font-black uppercase tracking-widest">Funding</span>
      </div>
    ),
    order: 5
  });
}

export * from './logic/useFunding';
