import DB from 'databases';
import { IAlert } from '@/interfaces/alert.interface';
import { CreateAlertDto } from '@dtos/alert.dto';
import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import { IncidentModel } from '@/models/incident.model';

class AlertService {
  public alert = DB.Alerts;

  public async getAllAlerts(): Promise<IAlert[]> {
    const allAlerts: IAlert[] = await this.alert.findAll({
      include: [
        {
          model: IncidentModel,
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    return allAlerts;
  }

  public async getAlertById(id: number): Promise<IAlert> {
    const alert: IAlert = await this.alert.findOne({
      where: { id },
      include: [
        {
          model: IncidentModel,
        }
      ],
    });
    return alert;
  }

  public async createAlert(alertData: CreateAlertDto): Promise<IAlert> {
    if (isEmpty(alertData)) throw new HttpException(400, 'Alert must not be empty');

    const createAlertData: IAlert = await this.alert.create(alertData);
    return createAlertData;
  }

  public async deleteAlertById(id: number): Promise<void> {
    const alert: void = await this.alert.findByPk(id).then(alert => alert.destroy());
    return alert;
  }
}

export default AlertService;
