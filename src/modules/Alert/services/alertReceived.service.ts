import { HttpException } from '@/common/exceptions/HttpException';
import { IAlertReceived } from '@/common/interfaces/alertReceived.interface';
import { IAlertRule } from '@/common/interfaces/alertRule.interface';
import { isEmpty } from '@/common/utils/util';
import DB from '@/database';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import { AlertReceivedDto, CreateAlertRuleDto } from '../dtos/alertRule.dto';
import AlertRuleService from './alertRule.service';
class AlertReceivedService {
  public tableIdService = new TableIdService();
  public alertRule = DB.AlertRule;
  public alertReceived = DB.AlertReceived;
  public alertRuleService = new AlertRuleService();

  public async getAlertReceived(customerAccountKey: number): Promise<IAlertReceived[]> {
    const allAlertReceived: IAlertReceived[] = await this.alertReceived.findAll({
      where: { customerAccountKey: customerAccountKey, deletedAt: null },
      attributes: { exclude: ['alertReceivedKey', 'deletedAt', 'updatedBy', 'createdBy'] },
    });
    return allAlertReceived;
  }
  public async createAlertReceived(alertReceivedData: AlertReceivedDto, customerAccountKey: number, partyId: string) : Promise<IAlertReceived>{
    if (isEmpty(alertReceivedData)) throw new HttpException(400, 'Create AlertReceived cannot be blank');
    const tableIdName: string = 'AlertReceived';
    const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdName);
    const tempAlertReceivedId: string = responseTableIdData.tableIdFinalIssued;

    // get alertRuleKey using customerAccountKey
    const alertRuleKey:number = await this.alertRuleService.getAlertRuleKey(customerAccountKey);

    const currentDate = new Date();
    const newAlertReceived = {
      ... alertReceivedData,
      customerAccountKey: customerAccountKey,
      alertReceivedId: tempAlertReceivedId,
      alertReceivedActiveAt:currentDate,
      createdAt: currentDate,
      createdBy: partyId,
      alertRuleKey
    };
    const createAlertReceivedData: IAlertReceived = await this.alertReceived.create(newAlertReceived);
    return createAlertReceivedData;
  }

}

export default AlertReceivedService;
