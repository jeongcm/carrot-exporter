export interface IAlert {
  pk: number;
  id: string;
  tenancyPk: number;
  alertName: string;
  from: 'LARI' | 'PROMETHEUS';
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
  pinned: number;
}
