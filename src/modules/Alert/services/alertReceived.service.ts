import { HttpException } from '@/common/exceptions/HttpException';
import { IAlertReceived } from '@/common/interfaces/alertReceived.interface';
import { isEmpty } from '@/common/utils/util';
import DB from '@/database';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import { AlertReceivedDto } from '../dtos/alertReceived.dto';
import { CreateAlertRuleDto } from '../dtos/alertRule.dto';
import AlertRuleService from './alertRule.service';
const { Op } = require('sequelize');
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

  public async findAlertReceivedById(alertReceivedId: string): Promise<IAlertReceived> {
    if (isEmpty(alertReceivedId)) throw new HttpException(400, 'Not a valid Alert Received Id');

    const findAlertReceived: IAlertReceived = await this.alertReceived.findOne({
      where: { alertReceivedId, deletedAt: null },
      attributes: { exclude: ['alertReceivedId', 'deletedAt', 'updatedBy', 'createdBy'] },
    });
    if (!findAlertReceived) throw new HttpException(409, 'Alert Received Id Not found');

    return findAlertReceived;
  }
  public async deleteAlertReceived(customerAccountKey: number, alertReceivedId: string) {
    try {
      const deleteAlertReceivedData = {
        deletedAt: new Date(),
      };

      const result = await this.alertReceived.update(deleteAlertReceivedData, {
        where: {
          customerAccountKey: customerAccountKey,
          alertReceivedId: alertReceivedId,
          deletedAt: {
            [Op.eq]: null,
          },
        },
      });
      if (result[0] == 1) {
        return true;
      }else{
        return false;
      }
    } catch (error) {
      return false;
    }
  }
  public async updateAlertReceived(
    alertReceivedId: string,
    alertReceivedData: CreateAlertRuleDto,
    customerAccountKey: number,
    partyId: string,
  ): Promise<IAlertReceived> {
    if (isEmpty(alertReceivedData)) throw new HttpException(400, 'AlertReceived Data cannot be blank');
    const findAlertReceived: IAlertReceived = await this.alertReceived.findOne({ where: { alertReceivedId } });
    if (!findAlertReceived) throw new HttpException(409, "Alert Received doesn't exist");
    const updateAlertReceivedData = {
      ...alertReceivedData,
      customerAccountKey: customerAccountKey,
      updatedBy: partyId,
      updatedAt: new Date(),
    };
    await this.alertReceived.update(updateAlertReceivedData, { where: { alertReceivedId: alertReceivedId } });

    return await this.findAlertReceivedById(alertReceivedId);
  }

  public async createAlertReceived(alertReceivedData: AlertReceivedDto, customerAccountKey: number, partyId: string): Promise<IAlertReceived> {
    if (isEmpty(alertReceivedData)) throw new HttpException(400, 'Create AlertReceived cannot be blank');
    const tableIdName: string = 'AlertReceived';
    const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdName);
    const tempAlertReceivedId: string = responseTableIdData.tableIdFinalIssued;

    // get alertRuleKey using customerAccountKey
    const alertRuleKey: number = await this.alertRuleService.getAlertRuleKey(customerAccountKey);

    const currentDate = new Date();
    const newAlertReceived = {
      ...alertReceivedData,
      customerAccountKey: customerAccountKey,
      alertReceivedId: tempAlertReceivedId,
      alertReceivedActiveAt: currentDate,
      createdAt: currentDate,
      createdBy: partyId,
      alertRuleKey,
    };
    const createAlertReceivedData: IAlertReceived = await this.alertReceived.create(newAlertReceived);
    return createAlertReceivedData;
  }
}

export default AlertReceivedService;
