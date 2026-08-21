import React from 'react';
import { KoperasiContainer } from './primitives/KoperasiContainer';
import { integrationRegistry } from '../../core/integration_points';
import { PiggyBank } from 'lucide-react';

export const KoperasiModule = () => {
  return <KoperasiContainer />;
};

export function initKoperasiModule() {
  integrationRegistry.register({
    id: 'koperasi-nav',
    slot: 'BottomNavEntry',
    component: (
      <div key="koperasi-nav" className="flex flex-col items-center gap-1">
        <PiggyBank size={20} />
        <span className="text-[8px] font-black uppercase tracking-widest">Koperasi</span>
      </div>
    ),
    order: 4
  });
}

export * from './logic/useKoperasi';
