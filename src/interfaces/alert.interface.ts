export interface IAlert {
  alertName: string;
  from: 'LARI' | 'PROMETHEUS';
  id: number;
  lastUpdatedAt: Date;
  severity: string;
  source: string;
  startAt: Date;
  status: 'CLOSED' | 'HIDED' | 'OPEN' | 'REFERENCED';
  summary: string;
}
