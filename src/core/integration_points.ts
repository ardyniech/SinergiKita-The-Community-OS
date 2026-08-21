import React from 'react';

export type SlotName = 
  | 'DashboardCard' 
  | 'SettingsSection' 
  | 'BottomNavEntry' 
  | 'SidebarEntry' 
  | 'HeaderAction';

export interface UIContribution {
  id: string;
  slot: SlotName;
  component: React.ReactNode;
  order?: number;
}

class IntegrationRegistry {
  private contributions: UIContribution[] = [];

  register(contribution: UIContribution) {
    this.contributions.push(contribution);
  }

  getSlot(slot: SlotName): UIContribution[] {
    return this.contributions
      .filter(c => c.slot === slot)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }
}

export const integrationRegistry = new IntegrationRegistry();
