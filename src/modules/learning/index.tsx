import React from 'react';
import { LearningContainer } from './primitives/LearningContainer';
import { integrationRegistry } from '../../core/integration_points';
import { GraduationCap } from 'lucide-react';

export const LearningModule = () => {
  return <LearningContainer />;
};

export function initLearningModule() {
  integrationRegistry.register({
    id: 'learning-nav',
    slot: 'BottomNavEntry',
    component: (
      <div key="learning-nav" className="flex flex-col items-center gap-1">
        <GraduationCap size={20} />
        <span className="text-[8px] font-black uppercase tracking-widest">Learn</span>
      </div>
    ),
    order: 8
  });
}

export * from './logic/useLearning';
