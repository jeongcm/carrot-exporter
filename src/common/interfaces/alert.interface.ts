export interface IAlert {
  id: number;
  uuid: string;
  tenancyId: number;
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
