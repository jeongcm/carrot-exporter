export interface IAlert {
  tenancyId: string;
  alertName: string;
  from: 'LARI' | 'PROMETHEUS';
  id: number;
  lastUpdatedAt: Date;
  severity: string;
  source: string;
  startAt: Date;
  status: 'CLOSED' | 'HIDED' | 'OPEN' | 'REFERENCED';
  summary: string;
  description: string;
  note: string;
  alertRule: string;
  node: string;
  numberOfOccurrences: number;
}
