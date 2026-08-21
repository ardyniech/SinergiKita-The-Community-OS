import React from 'react';
import { SocialContainer } from './primitives/SocialContainer';
import { integrationRegistry } from '../../core/integration_points';
import { Users } from 'lucide-react';

export const SocialModule = () => {
  return <SocialContainer />;
};

export function initSocialModule() {
  integrationRegistry.register({
    id: 'social-nav',
    slot: 'BottomNavEntry',
    component: (
      <div key="social-nav" className="flex flex-col items-center gap-1">
        <Users size={20} />
        <span className="text-[8px] font-black uppercase tracking-widest">Social</span>
      </div>
    ),
    order: 2
  });
}

export * from './logic/useSocial';
