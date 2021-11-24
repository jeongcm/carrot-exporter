import DB from 'databases';
import { IAlert } from '@/interfaces/alert.interface';

class AlertService {
  public alert = DB.Alerts;

  public async findAllAlerts(): Promise<IAlert[]> {
    const allAlerts: IAlert[] = await this.alert.findAll({});
    return allAlerts;
  }
}

export default AlertService;
