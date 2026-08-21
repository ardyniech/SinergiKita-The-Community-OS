import React from 'react';
import { VotingContainer } from './primitives/VotingContainer';

export function initVotingModule() {
  console.log('[Module:Voting] Initialized Suara Warga & E-Voting Digital');
}

export const VotingModule: React.FC = () => {
  return <VotingContainer />;
};
