import React from 'react';
import { InventoryContainer } from './primitives/InventoryContainer';

export function initInventoryModule() {
  console.log('[Module:Inventory] Initialized Logistik & Inventaris Warga');
}

export const InventoryModule: React.FC = () => {
  return <InventoryContainer />;
};
