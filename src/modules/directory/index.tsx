import React from 'react';
import { useDirectory } from './logic/useDirectory';
import { DirectoryContainer } from './primitives/DirectoryContainer';
import { integrationRegistry } from '../../core/integration_points';

export const DirectoryModule = () => {
  return <DirectoryContainer />;
};

// Register module UI contributions
export function initDirectoryModule() {
  integrationRegistry.register({
    id: 'directory-nav',
    slot: 'BottomNavEntry',
    component: (
      <div key="directory-nav">
        {/* Nav component will be handled by App.tsx through integrationRegistry */}
      </div>
    ),
    order: 2
  });
}

export * from './logic/useDirectory';
