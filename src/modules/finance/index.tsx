import React from 'react';
import { FinanceContainer } from './primitives/FinanceContainer';
import { integrationRegistry } from '../../core/integration_points';
import { Wallet } from 'lucide-react';

export const FinanceModule = () => {
  return <FinanceContainer />;
};

// Register module UI contributions
export function initFinanceModule() {
  integrationRegistry.register({
    id: 'finance-nav',
    slot: 'BottomNavEntry',
    component: (
      <div key="finance-nav" className="flex flex-col items-center gap-1">
        <Wallet size={20} />
        <span className="text-[8px] font-black uppercase tracking-widest">Finance</span>
      </div>
    ),
    order: 3
  });
}

export * from './logic/useFinance';
