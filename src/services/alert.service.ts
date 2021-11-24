import DB from 'databases';
import { IAlert } from '@/interfaces/alert.interface';
import { CreateAlertDto } from '@dtos/alert.dto';
import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';

class AlertService {
  public alert = DB.Alerts;

  public async findAllAlerts(): Promise<IAlert[]> {
    const allAlerts: IAlert[] = await this.alert.findAll({});
    return allAlerts;
  }

  public async createAlert(alertData: CreateAlertDto): Promise<IAlert> {
    if (isEmpty(alertData)) throw new HttpException(400, 'Alert must not be empty');

    const createAlertData: IAlert = await this.alert.create(alertData);
    return createAlertData;
  }
}

export default AlertService;
