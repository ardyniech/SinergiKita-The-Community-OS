export interface LPJSummary {
  month: number; // 1-12
  year: number;
  tenantName: string;
  totalIncome: number;
  totalExpense: number;
  finalBalance: number;
  duesCount: number;
  lettersCount: number;
  patrolCount: number;
  eventsCount: number;
  guestsCount: number;
  createdAt: string;
}
