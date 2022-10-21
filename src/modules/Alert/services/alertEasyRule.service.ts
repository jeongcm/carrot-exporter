import { HttpException } from '@/common/exceptions/HttpException';
import { IAlertTargetGroup } from '@/common/interfaces/alertTargetGroup.interface';
import { IAlertTargetSubGroup } from '@/common/interfaces/alertTargetSubGroup.interface';
import { IAlertEasyRule } from '@/common/interfaces/alertEasyRule.interface';

import DB from '@/database';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import Sequelize from 'sequelize';
import { AlertTargetGroupModel } from '../models/alertTargetGroup.model';
import { AlertTargetSubGroupModel } from '../models/alertTargetSubGroup.model';
import { ResourceGroupModel } from '@/modules/Resources/models/resourceGroup.model';

const { Op } = require('sequelize');
const uuid = require('uuid');

class AlertEasyRuleService {
  private tableIdService = new TableIdService();
  private alertRule = DB.AlertRule;
  private resourceGroup = DB.ResourceGroup;
  private alertEasyRule = DB.AlertEasyRule;
  private alertTargetGroup = DB.AlertTargetGroup;
  private alertTargetSubGroup = DB.AlertTargetSubGroup;

  public async createAlertTargetGroup(alertTargetGroup: IAlertTargetGroup, partyId: string): Promise<IAlertTargetGroup> {
    const currentDate = new Date();
    const alertTargetGroupId = uuid.v1();
    const createQuery = {
      alertTargetGroupId: alertTargetGroupId,
      createdBy: partyId,
      updatedBy: null,
      createdAt: currentDate,
      updatedAt: null,
      deletedAt: null,
      alertTargetGroupName: alertTargetGroup.alertTargetGroupName,
      alertTargetGroupDescription: alertTargetGroup.alertTargetGroupDescription,
    };
    const createAlertTargetGroup: IAlertTargetGroup = await this.alertTargetGroup.create(createQuery);
    return createAlertTargetGroup;
  }

  public async createAlertTargetSubGroup(alertTargetSubGroup: IAlertTargetSubGroup, partyId: string): Promise<IAlertTargetSubGroup> {
    const currentDate = new Date();
    const createQuery = {
      alertTargetSubGroupId: uuid.v1(),
      alertTargetGroupKey: alertTargetSubGroup.alertTargetGroupKey,
      createdBy: partyId,
      updatedBy: null,
      createdAt: currentDate,
      updatedAt: null,
      deletedAt: null,
      alertTargetSubGroupName: alertTargetSubGroup.alertTargetSubGroupName,
      alertTargetSubGroupDescription: alertTargetSubGroup.alertTargetSubGroupDescription,
    };
    const createAlertTargetSubGroup: IAlertTargetSubGroup = await this.alertTargetSubGroup.create(createQuery);
    return createAlertTargetSubGroup;
  }

  public async createAlertEasyRule(alertEasyRule: IAlertEasyRule, partyId: string): Promise<IAlertEasyRule> {
    // step 1. check all of the alert rule with the same name from Alert rules.

    // step2. Then, create AlertEasyRule for the alert rule of the each cluster.
    const currentDate = new Date();
    const createQuery = {
      alertEasyRuleId: uuid.v1(),
      alertTargetSubGroupKey: alertEasyRule.alertTargetSubGroupKey,
      resourceGroupUuid: alertEasyRule.resourceGroupUuid,
      alertRuleKey: alertEasyRule.alertRuleKey,
      customerAccountKey: alertEasyRule.customerAccountKey,
      createdBy: partyId,
      updatedBy: null,
      createdAt: currentDate,
      updatedAt: null,
      deletedAt: null,
      alertEasyRuleName: alertEasyRule.alertEasyRuleName,
      alertEasyRuleDescription: alertEasyRule.alertEasyRuleDescription,
      alertEasyRuleDuration: alertEasyRule.alertEasyRuleDuration,
      alertEasyRuleThreshold1: alertEasyRule.alertEasyRuleThreshold1,
      alertEasyRuleThreshold2: alertEasyRule.alertEasyRuleThreshold2,
      alertEasyRuleQuery: alertEasyRule.alertEasyRuleQuery,
    };
    const createAlertEasyRule: IAlertEasyRule = await this.alertEasyRule.create(createQuery);
    // step 3. if the alert rule query is different, provision the brand-new rule to Prometheus thru Sudory

    return createAlertEasyRule;
  }

  public async getAlertEasyRule(customerAccountKey: number, partyId: string): Promise<IAlertEasyRule[]> {
    const querySql = {
      where: { deletedAt: null, customerAccountKey: customerAccountKey },
      include: [
        {
          model: ResourceGroupModel,
          required: true,
          attributes: ['resourceGroupName'],
          where: { deletedAt: null },
        },
        {
          model: AlertTargetSubGroupModel,
          required: true,
          attributes: ['alertTargetSubGroupName', 'alertTargetSubGroupDescription'],
          where: { deletedAt: null },
          include: [
            {
              model: AlertTargetGroupModel,
              required: true,
              attributes: ['alertTargetGroupName', 'alertTargetGroupDescription'],
              where: { deletedAt: null },
            },
          ],
        },
      ],
    };
    const getAlertEasyRule: IAlertEasyRule[] = await this.alertEasyRule.findAll(querySql);
    return getAlertEasyRule;
  }

  public async updateAlertEasyRue(alertEasyRule: IAlertEasyRule, partyId: string): Promise<Object> {
    //step1. check the input with the existing alertrules
    //step2. if we see any changes, update AlertEasyRule table
    //step3. provision the newly inputed alert rule / threshold to Prometheus.
    return;
  }
}

export default AlertEasyRuleService;
