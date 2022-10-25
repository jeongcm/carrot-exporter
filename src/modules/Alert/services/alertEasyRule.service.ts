import { HttpException } from '@/common/exceptions/HttpException';
import { IAlertTargetGroup } from '@/common/interfaces/alertTargetGroup.interface';
import { IAlertTargetSubGroup } from '@/common/interfaces/alertTargetSubGroup.interface';
import { IAlertEasyRule } from '@/common/interfaces/alertEasyRule.interface';
import { ICustomerAccount } from '@/common/interfaces/customerAccount.interface';
import config from '@config/index';

import DB from '@/database';
import SudoryService from '@/modules/CommonService/services/sudory.service';
import Sequelize from 'sequelize';
import { AlertTargetGroupModel } from '../models/alertTargetGroup.model';
import { AlertTargetSubGroupModel } from '../models/alertTargetSubGroup.model';
import { ResourceGroupModel } from '@/modules/Resources/models/resourceGroup.model';
import { CreateAlertEasyRuleDto, CreateAlertTargetGroupDto, CreateAlertTargetSubGroupDto } from '../dtos/alertEasyRule.dto';
import { IResourceGroup } from '@/common/interfaces/resourceGroup.interface';
import { IAlertRule } from '@/common/interfaces/alertRule.interface';
import { IExecutorService } from '@/common/interfaces/executor.interface';

const { Op } = require('sequelize');
const uuid = require('uuid');

class AlertEasyRuleService {
  private sudoryService = new SudoryService();
  private alertRule = DB.AlertRule;
  private resourceGroup = DB.ResourceGroup;
  private alertEasyRule = DB.AlertEasyRule;
  private alertTargetGroup = DB.AlertTargetGroup;
  private alertTargetSubGroup = DB.AlertTargetSubGroup;
  private customerAccount = DB.CustomerAccount;
  private executorService = DB.ExecutorService;

  public async createAlertTargetGroup(alertTargetGroup: CreateAlertTargetGroupDto, partyId: string): Promise<IAlertTargetGroup> {
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

  public async createAlertTargetSubGroup(alertTargetSubGroup: CreateAlertTargetSubGroupDto, partyId: string): Promise<IAlertTargetSubGroup> {
    const currentDate = new Date();
    const getAlertTargetGroup: IAlertTargetGroup = await this.alertTargetGroup.findOne({
      where: { alertTargetGroupId: alertTargetSubGroup.alertTargetGroupId },
    });
    const createQuery = {
      alertTargetSubGroupId: uuid.v1(),
      alertTargetGroupKey: getAlertTargetGroup.alertTargetGroupKey,
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

  public async createAlertEasyRule(alertEasyRule: CreateAlertEasyRuleDto, partyId: string): Promise<Object[]> {
    // step 1. check all of the alert rule with the same name from Alert rules.
    // need to find customerAccount, resourceGloup, AlertRules
    // step 1.1 find CustomerAccount
    const result = [];
    console.log(alertEasyRule);
    const alertRuleName = alertEasyRule.alertEasyRuleName;
    const findCustomerAccount: ICustomerAccount = await this.customerAccount.findOne({
      where: { customerAccountId: alertEasyRule.customerAccountId, deletedAt: null },
    });
    if (!findCustomerAccount) throw new HttpException(400, `couldn't find customerAccount information`);
    const customerAccountKey = findCustomerAccount.customerAccountKey;
    // step 1.2 find ResourceGroup
    const findResourceGroup: IResourceGroup[] = await this.resourceGroup.findAll({
      where: { customerAccountKey: customerAccountKey, deletedAt: null },
    });
    if (!findResourceGroup) throw new HttpException(401, `couldn't find active cluster information`);

    // step 1.3 find AlertTargetSubGroup
    const findAlertTargetSubGroup: IAlertTargetSubGroup = await this.alertTargetSubGroup.findOne({
      where: { alertTargetSubGroupId: alertEasyRule.alertTargetSubGroupId, deletedAt: null },
    });
    if (!findAlertTargetSubGroup) throw new HttpException(402, `couldn't find alert target sub group`);
    const alertTargetSubGroupKey = findAlertTargetSubGroup.alertTargetSubGroupKey;
    // step 1.4 if there is an alertEasyRule - same name with alertTargetSubGroup in the table , return exception
    // To be coded
    //
    //
    //
    // step2. Then, create AlertEasyRule for the alert rule of the each cluster.
    for (let i = 1; i < findResourceGroup.length; i++) {
      const resourceGroupUuid = findResourceGroup[i].resourceGroupUuid;
      const prometheusNamespace = findResourceGroup[i].resourceGroupKpsLokiNamespace;
      const prometheus = findResourceGroup[i].resourceGroupPrometheus;
      // step 2-1. find AlertRule of the cluster
      const findAlertRule: IAlertRule = await this.alertRule.findOne({
        where: { resourceGroupUuid: resourceGroupUuid, deletedAt: null, alertRuleName: alertRuleName },
      });
      // step 2-2 if there is no matched alert, create an alert rule
      let alertRuleKey;
      let alertGroup;
      let appName;
      let prometheusRuleGroupName;
      if (!findAlertRule) {
        // will be coded later
      } else {
        alertGroup = findAlertRule.alertRuleGroup;
        appName = prometheus.substring(7, prometheus.indexOf('.'));
        prometheusRuleGroupName = appName.substring(0, appName.lenghth - 12) + '-' + alertGroup;
        console.log('prometheusRuleGroup', prometheusRuleGroupName);
        alertRuleKey = findAlertRule.alertRuleKey;

        const currentDate = new Date();
        const createQuery = {
          alertEasyRuleId: uuid.v1(),
          alertTargetSubGroupKey: alertTargetSubGroupKey,
          resourceGroupUuid: resourceGroupUuid,
          alertRuleKey: alertRuleKey,
          customerAccountKey: customerAccountKey,
          createdBy: partyId,
          updatedBy: null,
          createdAt: currentDate,
          updatedAt: null,
          deletedAt: null,
          alertEasyRuleName: alertEasyRule.alertEasyRuleName,
          alertEasyRuleDescription: alertEasyRule.alertEasyRuleDescription,
          alertEasyRuleSummary: alertEasyRule.alertEasyRuleDescription,
          alertEasyRuleSeverity: alertEasyRule.alertEasyRuleSeverity,
          alertEasyRuleGroup: alertEasyRule.alertEasyRuleGroup,
          alertEasyRuleDuration: alertEasyRule.alertEasyRuleDuration,
          alertEasyRuleThreshold1: alertEasyRule.alertEasyRuleThreshold1,
          alertEasyRuleThreshold2: alertEasyRule.alertEasyRuleThreshold2,
          alertEasyRuleQuery: alertEasyRule.alertEasyRuleQuery,
        };
        const createAlertEasyRule: IAlertEasyRule = await this.alertEasyRule.create(createQuery);
        // step 3. if the alert rule query is different, provision the brand-new rule to Prometheus thru Sudory

        const sudorySName = 'getPrometheusRule';
        const sudorySummary = 'getPrometheusRule';
        const clusterUuid = resourceGroupUuid;
        const getTemplateUuid = '00000000000000000000000000004003';
        const getStep = [{ args: { name: prometheusRuleGroupName, namespace: prometheusNamespace } }];
        const subscribedChannel = config.sudoryApiDetail.channel_webhook;
        const getPrometheusRule = await this.sudoryService.postSudoryService(
          sudorySName,
          sudorySummary,
          clusterUuid,
          getTemplateUuid,
          getStep,
          customerAccountKey,
          subscribedChannel,
        );
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const executorServiceId = getPrometheusRule.dataValues.executorServiceId;
        const getExecutorService = await this.executorService.findOne({ where: { executorServiceId: executorServiceId } });
        console.log('executorServiceId', executorServiceId);
        const sudoryServiceName = 'Patch Prometheus Rule';
        const summary = 'Patch Prometheus Rule';
        const templateUuid = '00000000000000000000000000004016'; //tmplateUuid will be updated - patch PrometheusRule
        const step = [
          {
            args: {
              name: prometheusRuleGroupName,
              namespace: prometheusNamespace,
              patch_type: 'merge',
              patch_data: {
                spec: {
                  groups: [
                    {
                      name: alertGroup,
                      rules: [
                        {
                          alert: alertEasyRule.alertEasyRuleName,
                          annotation: {
                            description: alertEasyRule.alertEasyRuleDescription,
                            summary: alertEasyRule.alertEasyRuleSummary,
                          },
                          expr: alertEasyRule.alertEasyRuleQuery,
                          for: alertEasyRule.alertEasyRuleDuration,
                          labels: {
                            severity: alertEasyRule.alertEasyRuleSeverity,
                          },
                        },
                      ],
                    },
                  ],
                },
              },
            },
          },
        ];
        await this.sudoryService.postSudoryService(
          sudoryServiceName,
          summary,
          clusterUuid,
          templateUuid,
          step,
          customerAccountKey,
          subscribedChannel,
        );
        result.push(createAlertEasyRule);
      }
    }
    return result;
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
