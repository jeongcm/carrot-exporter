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
import {
  CreateAlertEasyRuleDto,
  CreateAlertEasyRuleForClusterDto,
  UpdateAlertEasyRuleDto,
  CreateAlertTargetGroupDto,
  CreateAlertTargetSubGroupDto,
} from '../dtos/alertEasyRule.dto';
import { IResourceGroup } from '@/common/interfaces/resourceGroup.interface';
import { IAlertRule } from '@/common/interfaces/alertRule.interface';
//import { IExecutorService } from '@/common/interfaces/executor.interface';
import { ISudoryWebhook } from '@/common/interfaces/sudoryWebhook.interface';
import AlerthubService from './alerthub.service';
import { Http } from 'winston/lib/winston/transports';
//import { arrayBuffer } from 'stream/consumers';
//import path from 'path';
//import { max } from 'lodash';

const { Op } = require('sequelize');
const uuid = require('uuid');

class AlertEasyRuleService {
  private sudoryService = new SudoryService();
  private alertHubService = new AlerthubService();
  private alertRule = DB.AlertRule;
  private resourceGroup = DB.ResourceGroup;
  private alertEasyRule = DB.AlertEasyRule;
  private alertTargetGroup = DB.AlertTargetGroup;
  private alertTargetSubGroup = DB.AlertTargetSubGroup;
  private customerAccount = DB.CustomerAccount;
  private executorService = DB.ExecutorService;
  private sudoryWebhook = DB.SudoryWebhook;

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
    const alertEasyRuleName = alertEasyRule.alertEasyRuleName;
    const alertEasyRuleSeverity = alertEasyRule.alertEasyRuleSeverity;
    console.log('alertEasyRule', JSON.stringify(alertEasyRule));

    let alertEasyRuleDescription = alertEasyRule.alertEasyRuleDescription.replace('alertEasyRuleThreshold1', alertEasyRule.alertEasyRuleThreshold1);
    alertEasyRuleDescription = alertEasyRuleDescription.replace('alertEasyRuleThreshold2', alertEasyRule.alertEasyRuleThreshold2);
    let alertEasyRuleQuery = alertEasyRule.alertEasyRuleQuery.replace('alertEasyRuleThreshold1', alertEasyRule.alertEasyRuleThreshold1);
    alertEasyRuleQuery = alertEasyRuleQuery.replace('alertEasyRuleThreshold2', alertEasyRule.alertEasyRuleThreshold2);

    console.log('alertEasyRuleDescription', alertEasyRuleDescription);
    console.log('alertEasyRuleQuery', alertEasyRuleQuery);
    const findCustomerAccount: ICustomerAccount = await this.customerAccount.findOne({
      where: { customerAccountId: alertEasyRule.customerAccountId, deletedAt: null },
    });
    if (!findCustomerAccount) throw new HttpException(400, `couldn't find customerAccount information`);
    const customerAccountKey = findCustomerAccount.customerAccountKey;

    // step 1.2 find ResourceGroup
    const findResourceGroup: IResourceGroup[] = await this.resourceGroup.findAll({
      where: { customerAccountKey: customerAccountKey, deletedAt: null },
    });
    if (findResourceGroup.length === 0) throw new HttpException(401, `couldn't find active cluster information`);

    // step 1.3 find AlertTargetSubGroup
    const findAlertTargetSubGroup: IAlertTargetSubGroup = await this.alertTargetSubGroup.findOne({
      where: { alertTargetSubGroupId: alertEasyRule.alertTargetSubGroupId, deletedAt: null },
    });
    if (!findAlertTargetSubGroup) throw new HttpException(402, `couldn't find alert target sub group`);
    const alertTargetSubGroupKey = findAlertTargetSubGroup.alertTargetSubGroupKey;

    // step 1.4 if there is an alertEasyRule - same name with alertTargetSubGroup in the table , return exception
    const findAlertEasyRule: IAlertEasyRule = await this.alertEasyRule.findOne({
      where: { alertEasyRuleName: alertEasyRuleName, alertEasyRuleSeverity: alertEasyRuleSeverity, customerAccountKey: customerAccountKey },
    });
    if (findAlertEasyRule) throw new HttpException(403, `Duplicatd Easy ALert Rule Name`);

    // step2. Then, create AlertEasyRule for the alert rule of the each cluster.
    for (let k = 0; k < findResourceGroup.length; k++) {
      const resourceGroupUuid = findResourceGroup[k].resourceGroupUuid;
      const resourceGroupKey = findResourceGroup[k].resourceGroupKey;
      const prometheusNamespace = findResourceGroup[k].resourceGroupKpsLokiNamespace;
      const prometheus = findResourceGroup[k].resourceGroupPrometheus;
      console.log('custer', resourceGroupUuid);
      // step 2-1. find AlertRule of the cluster
      const findAlertRule: IAlertRule = await this.alertRule.findOne({
        where: { resourceGroupUuid: resourceGroupUuid, deletedAt: null, alertRuleName: alertEasyRuleName, alertRuleSeverity: alertEasyRuleSeverity },
      });

      let alertGroup;
      if (!findAlertRule) {
        alertGroup = alertEasyRule.alertEasyRuleGroup;
      } else {
        // if there is a same alert...
        alertGroup = findAlertRule.alertRuleGroup;
      }

      console.log('ResourceGroupUuid', resourceGroupUuid);
      console.log('prometheus', prometheus);

      const appName = prometheus.substring(7, prometheus.indexOf('.'));
      const prometheusRuleGroupName = appName.substring(0, appName.length - 11) + '-' + alertGroup;

      console.log('prometheusRuleGroupName', prometheusRuleGroupName);

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

      let indexRuleGroup;
      let indexRules;
      let maxIndexRuleGroup;
      let maxIndexRules;
      let getSudoryWebhook: ISudoryWebhook;
      let step = [];
      const sudoryServiceName = 'Patch Prometheus Rule';
      const summary = 'Patch Prometheus Rule';
      const templateUuid = '00000000000000000000000000004016'; //tmplateUuid will be updated - patch PrometheusRule

      const sleep = ms => new Promise(res => setTimeout(res, ms));
      let i;
      for (i = 0; i < 6; i++) {
        await sleep(1000);
        getSudoryWebhook = await this.sudoryWebhook.findOne({
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          where: { serviceUuid: getPrometheusRule.dataValues.serviceUuid, status: 4 },
        });
        if (getSudoryWebhook) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const ruleGroup = JSON.parse(JSON.stringify(getSudoryWebhook.serviceResult.spec.groups));
          const rules = [];
          ruleGroup.forEach((item: any) => {
            item?.rules?.forEach((ruleItem: any) => {
              if (ruleItem.alert) {
                const object = { alert: ruleItem.alert, severity: ruleItem.labels.severity, for: ruleItem.for };
                rules.push(object);
              }
            });
          });
          indexRuleGroup = ruleGroup.findIndex(element => element.name == alertGroup);
          indexRules = rules.findIndex(element => element.alert == alertEasyRule.alertEasyRuleName && element.severity == alertEasyRuleSeverity);
          maxIndexRuleGroup = ruleGroup.length - 1;
          maxIndexRules = rules.length;
          i = 100; //exit for
        }
      }
      if (getSudoryWebhook) {
        if (i === 101 && indexRules > 0) {
          // step 2-2 provision a brand new alert
          step = [
            {
              args: {
                name: prometheusRuleGroupName,
                namespace: prometheusNamespace,
                patch_type: 'json',
                patch_data: [
                  {
                    path: `/spec/groups/${maxIndexRuleGroup}/rules/${maxIndexRules}`,
                    op: 'add',
                    value: {
                      alert: alertEasyRule.alertEasyRuleName,
                      for: alertEasyRule.alertEasyRuleDuration,
                      labels: { severity: alertEasyRule.alertEasyRuleSeverity },
                      expr: alertEasyRuleQuery,
                      annotations: { description: alertEasyRuleDescription, summary: alertEasyRule.alertEasyRuleSummary },
                    },
                  },
                ],
              },
            },
          ];
        } else {
          // step 2-3 provision alert update
          step = [
            {
              args: {
                name: prometheusRuleGroupName,
                namespace: prometheusNamespace,
                patch_type: 'json',
                patch_data: [
                  {
                    path: `/spec/groups/${indexRuleGroup}/rules/${indexRules}/for`,
                    op: 'replace',
                    value: alertEasyRule.alertEasyRuleDuration,
                  },
                  {
                    path: `/spec/groups/${indexRuleGroup}/rules/${indexRules}/labels/severity`,
                    op: 'replace',
                    value: alertEasyRule.alertEasyRuleSeverity,
                  },
                  {
                    path: `/spec/groups/${indexRuleGroup}/rules/${indexRules}/expr`,
                    op: 'replace',
                    value: alertEasyRuleQuery,
                  },
                  {
                    path: `/spec/groups/${indexRuleGroup}/rules/${indexRules}/annotations/description`,
                    op: 'replace',
                    value: alertEasyRuleDescription,
                  },
                  {
                    path: `/spec/groups/${indexRuleGroup}/rules/${indexRules}/annotations/summary`,
                    op: 'replace',
                    value: alertEasyRule.alertEasyRuleSummary,
                  },
                ],
              },
            },
          ];
        }

        await this.sudoryService.postSudoryService(
          sudoryServiceName,
          summary,
          clusterUuid,
          templateUuid,
          step,
          customerAccountKey,
          subscribedChannel,
        );
        console.log(`provision is done ${clusterUuid}`);
        const currentDate = new Date();
        const createQuery = {
          alertEasyRuleId: uuid.v1(),
          alertTargetSubGroupKey: alertTargetSubGroupKey,
          resourceGroupUuid: resourceGroupUuid,
          resourceGroupKey: resourceGroupKey,
          customerAccountKey: customerAccountKey,
          createdBy: partyId,
          updatedBy: null,
          createdAt: currentDate,
          updatedAt: null,
          deletedAt: null,
          alertEasyRuleName: alertEasyRule.alertEasyRuleName,
          alertEasyRuleDescription: alertEasyRule.alertEasyRuleDescription,
          alertEasyRuleSummary: alertEasyRule.alertEasyRuleSummary,
          alertEasyRuleSeverity: alertEasyRule.alertEasyRuleSeverity,
          alertEasyRuleGroup: alertEasyRule.alertEasyRuleGroup,
          alertEasyRuleDuration: alertEasyRule.alertEasyRuleDuration,
          alertEasyRuleThreshold1: alertEasyRule.alertEasyRuleThreshold1,
          alertEasyRuleThreshold2: alertEasyRule.alertEasyRuleThreshold2,
          alertEasyRuleThreshold1Unit: alertEasyRule.alertEasyRuleThreshold1Unit,
          alertEasyRuleThreshold2Unit: alertEasyRule.alertEasyRuleThreshold2Unit,
          alertEasyRuleThreshold1Max: alertEasyRule.alertEasyRuleThreshold1Max,
          alertEasyRuleThreshold2Max: alertEasyRule.alertEasyRuleThreshold2Max,

          alertEasyRuleQuery: alertEasyRule.alertEasyRuleQuery,
        };
        const createAlertEasyRule: IAlertEasyRule = await this.alertEasyRule.create(createQuery);

        result.push(createAlertEasyRule);
      } else {
        result.push({ resourceGroupUuid: resourceGroupUuid, result: 'No Available Alert Group' });
      }
    }
    return result;
  }

  public async getAlertEasyRuleAll(customerAccountKey: number): Promise<IAlertEasyRule[]> {
    const querySql = {
      where: { deletedAt: null, customerAccountKey: customerAccountKey },
      include: [
        {
          model: ResourceGroupModel,
          required: true,
          attributes: ['resourceGroupName', 'resourceGroupUuid', 'resourceGroupId'],
          where: { deletedAt: null },
        },
        {
          model: AlertTargetSubGroupModel,
          required: true,
          attributes: ['alertTargetSubGroupName', 'alertTargetSubGroupDescription', 'alertTargetSubGroupId'],
          where: { deletedAt: null },
          include: [
            {
              model: AlertTargetGroupModel,
              required: true,
              attributes: ['alertTargetGroupName', 'alertTargetGroupDescription', 'alertTargetGroupId'],
              where: { deletedAt: null },
            },
          ],
        },
      ],
    };
    const getAlertEasyRule: IAlertEasyRule[] = await this.alertEasyRule.findAll(querySql);
    return getAlertEasyRule;
  }

  public async getAlertEasyRuleById(alertEasyRuleId: string): Promise<Object> {
    let returnResponse = {};
    const querySql = {
      where: { deletedAt: null, alertEasyRuleId: alertEasyRuleId },
      include: [
        {
          model: ResourceGroupModel,
          required: true,
          attributes: ['resourceGroupName', 'resourceGroupUuid', 'resourceGroupId', 'resourceGroupProvider'],
          where: { deletedAt: null },
        },
        {
          model: AlertTargetSubGroupModel,
          required: true,
          attributes: ['alertTargetSubGroupName', 'alertTargetSubGroupDescription', 'alertTargetSubGroupId'],
          where: { deletedAt: null },
          include: [
            {
              model: AlertTargetGroupModel,
              required: true,
              attributes: ['alertTargetGroupName', 'alertTargetGroupDescription', 'alertTargetGroupId'],
              where: { deletedAt: null },
            },
          ],
        },
      ],
    };

    const findAlertEasyRule: IAlertEasyRule = await this.alertEasyRule.findOne(querySql);
    console.log(querySql);
    if (!findAlertEasyRule) throw new HttpException(404, `can't find alert easy rule`);
    returnResponse = { AlertEasyRule: findAlertEasyRule };
    const querySql2 = {
      where: {
        deletedAt: null,
        alertRuleName: findAlertEasyRule.alertEasyRuleName,
        alertRuleSeverity: findAlertEasyRule.alertEasyRuleSeverity,
        resourceGroupUuid: findAlertEasyRule.resourceGroupUuid,
      },
    };
    console.log(querySql2);

    const getAlertRule: IAlertRule = await this.alertRule.findOne(querySql2);
    returnResponse = { ...returnResponse, alert: getAlertRule };
    return returnResponse;
  }

  public async updateAlertEasyRule(alertEasyRule: UpdateAlertEasyRuleDto, partyId: string): Promise<Object> {
    const result = [];
    const resourceGroupUuid = alertEasyRule.resourceGroupUuid;
    const alertEasyRuleId = alertEasyRule.alertEasyRuleId;
    const subscribedChannel = config.sudoryApiDetail.channel_webhook;
    let updateOrInsert = 'update';

    //step 1-1. Confirm alertEasyRule
    const findAlertEasyRule: IAlertEasyRule = await this.alertEasyRule.findOne({
      where: { alertEasyRuleId: alertEasyRuleId },
    });
    if (!findAlertEasyRule) throw new HttpException(400, `couldn't find alert target sub group`);

    const customerAccountKey = findAlertEasyRule.customerAccountKey;
    const existingAlertEasyRuleSeverity = findAlertEasyRule.alertEasyRuleSeverity;

    //step 1-2. Confirm alertTargetSubGroup
    const findAlertTargetSubGroup: IAlertTargetSubGroup = await this.alertTargetSubGroup.findOne({
      where: { alertTargetSubGroupId: alertEasyRule.alertTargetSubGroupId, deletedAt: null },
    });
    if (!findAlertTargetSubGroup) throw new HttpException(402, `couldn't find alert target sub group`);
    const alertTargetSubGroupKey = findAlertTargetSubGroup.alertTargetSubGroupKey;

    //step 1-3. Confirm resoruceGroup
    const findResourceGroup: IResourceGroup = await this.resourceGroup.findOne({
      where: { resourceGroupUuid: resourceGroupUuid, deletedAt: null },
    });
    if (!findResourceGroup) throw new HttpException(401, `couldn't find cluster information`);
    const resourceGroupKey = findResourceGroup.resourceGroupKey;

    //step 1-4 Confirm existance of AlertRule - name + severity combination
    const findAlertRule: IAlertRule = await this.alertRule.findOne({
      where: {
        resourceGroupUuid: resourceGroupUuid,
        deletedAt: null,
        alertRuleName: findAlertEasyRule.alertEasyRuleName,
        alertRuleSeverity: alertEasyRule.alertEasyRuleSeverity,
      },
    });
    if (!findAlertRule) updateOrInsert = 'insert';

    //Step 2-1 Prepare for Prometheus Rule patch
    const prometheusNamespace = findResourceGroup.resourceGroupKpsLokiNamespace;

    const alertGroup = findAlertRule?.alertRuleGroup || alertEasyRule.alertEasyRuleGroup;

    const sudoryServiceName = 'Patch Prometheus Rule';
    const summary = 'Patch Prometheus Rule';
    const templateUuid = '00000000000000000000000000004016'; //tmplateUuid will be updated - patch PrometheusRule

    let alertEasyRuleThreshold1;
    if (!alertEasyRule.alertEasyRuleThreshold1 || alertEasyRule.alertEasyRuleThreshold1 === '') {
      alertEasyRuleThreshold1 = findAlertEasyRule.alertEasyRuleThreshold1;
    } else {
      alertEasyRuleThreshold1 = alertEasyRule.alertEasyRuleThreshold1;
    }

    let alertEasyRuleThreshold2;
    if (!alertEasyRule.alertEasyRuleThreshold2 || alertEasyRule.alertEasyRuleThreshold2 === '') {
      alertEasyRuleThreshold2 = findAlertEasyRule.alertEasyRuleThreshold2;
    } else {
      alertEasyRuleThreshold2 = alertEasyRule.alertEasyRuleThreshold2;
    }

    let alertEasyRuleThreshold1Unit;
    if (!alertEasyRule.alertEasyRuleThreshold1Unit || alertEasyRule.alertEasyRuleThreshold1Unit === '') {
      alertEasyRuleThreshold1Unit = findAlertEasyRule.alertEasyRuleThreshold1Unit;
    } else {
      alertEasyRuleThreshold1Unit = alertEasyRule.alertEasyRuleThreshold1Unit;
    }

    let alertEasyRuleThreshold2Unit;
    if (!alertEasyRule.alertEasyRuleThreshold2Unit || alertEasyRule.alertEasyRuleThreshold2Unit === '') {
      alertEasyRuleThreshold2Unit = findAlertEasyRule.alertEasyRuleThreshold2Unit;
    } else {
      alertEasyRuleThreshold2Unit = alertEasyRule.alertEasyRuleThreshold2Unit;
    }

    let alertEasyRuleThreshold1Max;
    if (!alertEasyRule.alertEasyRuleThreshold1Max || alertEasyRule.alertEasyRuleThreshold1Max === '') {
      alertEasyRuleThreshold1Max = findAlertEasyRule.alertEasyRuleThreshold1Max;
    } else {
      alertEasyRuleThreshold1Max = alertEasyRule.alertEasyRuleThreshold1Max;
    }

    let alertEasyRuleThreshold2Max;
    if (!alertEasyRule.alertEasyRuleThreshold2Max || alertEasyRule.alertEasyRuleThreshold2Max === '') {
      alertEasyRuleThreshold2Max = findAlertEasyRule.alertEasyRuleThreshold2Max;
    } else {
      alertEasyRuleThreshold2Max = alertEasyRule.alertEasyRuleThreshold2Max;
    }

    // alertEasyRuleDescription
    let alertEasyRuleDescription;
    let alertEasyRuleDescriptionForDb;
    if (!alertEasyRule.alertEasyRuleDescription || alertEasyRule.alertEasyRuleDescription === '') {
      alertEasyRuleDescription = findAlertEasyRule.alertEasyRuleDescription.replace('alertEasyRuleThreshold1', alertEasyRuleThreshold1);
      alertEasyRuleDescriptionForDb = findAlertEasyRule.alertEasyRuleDescription;
    } else {
      alertEasyRuleDescription = alertEasyRule.alertEasyRuleDescription.replace('alertEasyRuleThreshold1', alertEasyRuleThreshold1);
      alertEasyRuleDescriptionForDb = alertEasyRule.alertEasyRuleDescription;
    }

    // alertEasyRuleQuery
    let alertEasyRuleQuery;
    let alertEasyRuleQueryForDb;
    if (!alertEasyRule.alertEasyRuleQuery || alertEasyRule.alertEasyRuleQuery === '') {
      alertEasyRuleQuery = findAlertEasyRule.alertEasyRuleQuery.replace('alertEasyRuleThreshold1', alertEasyRuleThreshold1);
      alertEasyRuleQueryForDb = findAlertEasyRule.alertEasyRuleQuery;
    } else {
      alertEasyRuleQuery = alertEasyRule.alertEasyRuleQuery.replace('alertEasyRuleThreshold1', alertEasyRuleThreshold1);
      alertEasyRuleQueryForDb = alertEasyRule.alertEasyRuleQuery;
    }

    // alertEasyRuleDuration
    let alertEasyRuleDuration;
    if (!alertEasyRule.alertEasyRuleDuration || alertEasyRule.alertEasyRuleDuration === '') {
      alertEasyRuleDuration = findAlertEasyRule.alertEasyRuleDuration;
    } else {
      alertEasyRuleDuration = alertEasyRule.alertEasyRuleDuration;
    }
    // alertEasyRuleSummary
    let alertEasyRuleSummary;
    if (!alertEasyRule.alertEasyRuleSummary || alertEasyRule.alertEasyRuleSummary === '') {
      alertEasyRuleSummary = findAlertEasyRule.alertEasyRuleSummary;
    } else {
      alertEasyRuleSummary = alertEasyRule.alertEasyRuleSummary;
    }

    let alertEasyRuleSeverity;
    if (!alertEasyRule.alertEasyRuleSeverity || alertEasyRule.alertEasyRuleSeverity === '') {
      alertEasyRuleSeverity = findAlertEasyRule.alertEasyRuleSeverity;
    } else {
      alertEasyRuleSeverity = alertEasyRule.alertEasyRuleSeverity;
    }

    // alertEasyRuleName
    const alertEasyRuleName = findAlertEasyRule.alertEasyRuleName;

    // alertEasyRuleSeverity

    let step = [];
    let indexRuleGroup;
    let indexRules = 0;
    let maxIndexRuleGroup;
    let maxIndexRules;
    let i;
    const sleep = ms => new Promise(res => setTimeout(res, ms));

    const sudorySName = 'getPrometheusRule';
    const sudorySummary = 'getPrometheusRule';
    const clusterUuid = resourceGroupUuid;
    const getTemplateUuid = '00000000000000000000000000004003';
    const getStep = [{ args: { name: alertGroup, namespace: prometheusNamespace } }];

    //Step 2-2 Get Prometheus Rule
    const getPrometheusRule = await this.sudoryService.postSudoryService(
      sudorySName,
      sudorySummary,
      clusterUuid,
      getTemplateUuid,
      getStep,
      customerAccountKey,
      subscribedChannel,
    );
    let getSudoryWebhook: ISudoryWebhook;

    //Step 2-3 Wait & Process Prometheus Rule thru SudoryWebhook
    for (i = 0; i < 6; i++) {
      await sleep(1000);
      getSudoryWebhook = await this.sudoryWebhook.findOne({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        where: { serviceUuid: getPrometheusRule.dataValues.serviceUuid, status: 4 },
      });
      if (getSudoryWebhook) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const ruleGroup = JSON.parse(JSON.stringify(getSudoryWebhook.serviceResult.spec.groups));
        const rules = [];
        ruleGroup.forEach((item: any) => {
          item?.rules?.forEach((ruleItem: any) => {
            if (ruleItem.alert) {
              const object = { alert: ruleItem.alert, severity: ruleItem.labels.severity, for: ruleItem.for };
              rules.push(object);
            }
          });
        });
        indexRuleGroup = ruleGroup.findIndex(element => element.name == alertGroup);
        indexRules = rules.findIndex(element => element.alert === alertEasyRuleName && element.severity === alertEasyRuleSeverity);
        maxIndexRuleGroup = ruleGroup.length - 1;
        maxIndexRules = rules.length;
        i = 100; //exit for
      }
    }
    if (!getSudoryWebhook) throw new HttpException(500, `Error on retrieving Prometheus Alert Rule`);

    if (i === 101 && indexRules > 0) {
      //no severity change & found alert rule... need to update the rule
      step = [
        {
          args: {
            name: alertGroup,
            namespace: prometheusNamespace,
            patch_type: 'json',
            patch_data: [
              {
                path: `/spec/groups/${indexRuleGroup}/rules/${indexRules}/for`,
                op: 'replace',
                value: alertEasyRuleDuration,
              },
              {
                path: `/spec/groups/${indexRuleGroup}/rules/${indexRules}/labels/severity`,
                op: 'replace',
                value: alertEasyRuleSeverity,
              },
              {
                path: `/spec/groups/${indexRuleGroup}/rules/${indexRules}/expr`,
                op: 'replace',
                value: alertEasyRuleQuery,
              },
              {
                path: `/spec/groups/${indexRuleGroup}/rules/${indexRules}/annotations/description`,
                op: 'replace',
                value: alertEasyRuleDescription,
              },
              {
                path: `/spec/groups/${indexRuleGroup}/rules/${indexRules}/annotations/summary`,
                op: 'replace',
                value: alertEasyRuleSummary,
              },
            ],
          },
        },
      ];
      console.log('step1-update indexRules', indexRules);
      console.log('step1-update maxIndexRules', maxIndexRules);
      console.log('step1-update', JSON.stringify(step));
    } else {
      // otherwise need to create the new one
      step = [
        {
          args: {
            name: alertGroup,
            namespace: prometheusNamespace,
            patch_type: 'json',
            patch_data: [
              {
                path: `/spec/groups/${maxIndexRuleGroup}/rules/${maxIndexRules}`,
                op: 'add',
                value: {
                  alert: alertEasyRuleName,
                  for: alertEasyRuleDuration,
                  labels: { severity: alertEasyRuleSeverity },
                  expr: alertEasyRuleQuery,
                  annotations: { description: alertEasyRuleDescription, summary: alertEasyRuleSummary },
                },
              },
            ],
          },
        },
      ];
      console.log('step1-add maxIndexRules', maxIndexRules);
      console.log('step1-add', JSON.stringify(step));
    }

    //Step 2-4 Patch Prometheus Rule
    await this.sudoryService.postSudoryService(
      sudoryServiceName,
      summary,
      resourceGroupUuid,
      templateUuid,
      step,
      customerAccountKey,
      subscribedChannel,
    );

    console.log(`provision is done ${resourceGroupUuid}`);
    const currentDate = new Date();

    const updateQuery = {
      updatedBy: partyId,
      updatedAt: currentDate,
      deletedAt: null,
      alertEasyRuleQuery: alertEasyRuleQueryForDb,
      alertEasyRuleDuration: alertEasyRuleDuration,
      alertEasyRuleDescription: alertEasyRuleDescriptionForDb,
      alertEasyRuleSummary: alertEasyRuleSummary,
      alertEasyRuleSeverity: alertEasyRuleSeverity,
      alertEasyRuleThreshold1: alertEasyRuleThreshold1,
      alertEasyRuleThreshold2: alertEasyRuleThreshold2,
      alertEasyRuleThreshold1Unit: alertEasyRuleThreshold1Unit,
      alertEasyRuleThreshold2Unit: alertEasyRuleThreshold2Unit,
      alertEasyRuleThreshold1Max: alertEasyRuleThreshold1Max,
      alertEasyRuleThreshold2Max: alertEasyRuleThreshold2Max,
    };
    const updateAlertEasyRule = await this.alertEasyRule.update(updateQuery, { where: { alertEasyRuleId } });
    result.push(updateQuery);
    result.push(updateAlertEasyRule);

    return result;
  }

  public async getAlertTargetGroupAll(): Promise<IAlertTargetGroup[]> {
    const findAlertTargetGroup: IAlertTargetGroup[] = await this.alertTargetGroup.findAll({
      where: { deletedAt: null },
      include: [{ model: AlertTargetSubGroupModel, required: false, where: { deletedAt: null } }],
    });
    return findAlertTargetGroup;
  }

  public async deleteAlertTargetSubGroup(alertTargetSubGroupId: string): Promise<Object> {
    const findAlertTargetSubGroup: IAlertTargetSubGroup = await this.alertTargetSubGroup.findOne({
      where: { deletedAt: null, alertTargetSubGroupId: alertTargetSubGroupId },
    });
    if (!findAlertTargetSubGroup) throw new HttpException(404, `couldn't find AlertTargetSubGroup`);

    const updateQuery = { deletedAt: new Date() };
    const whereQuery = { where: { deletedAt: null, alertTargetSubGroupId: alertTargetSubGroupId } };
    const resultUpdateOfAlertTargetSubGroup = await this.alertTargetSubGroup.update(updateQuery, whereQuery);
    return resultUpdateOfAlertTargetSubGroup;
  }

  public async createAlertEasyRuleForCluster(alertEasyRule: CreateAlertEasyRuleForClusterDto, partyId: string, waitSec: number): Promise<Object[]> {
    // step 1. check all of the alert rule with the same name from Alert rules.
    // need to find customerAccount, resourceGloup, AlertRules
    // step 1.1 find CustomerAccount

    await new Promise(resolve => setTimeout(resolve, waitSec * 1000));

    const result = [];
    const alertEasyRuleName = alertEasyRule.alertEasyRuleName;
    const alertEasyRuleSeverity = alertEasyRule.alertEasyRuleSeverity;

    let alertEasyRuleDescription = alertEasyRule.alertEasyRuleDescription.replace('alertEasyRuleThreshold1', alertEasyRule.alertEasyRuleThreshold1);
    alertEasyRuleDescription = alertEasyRuleDescription.replace('alertEasyRuleThreshold2', alertEasyRule.alertEasyRuleThreshold2);
    let alertEasyRuleQuery = alertEasyRule.alertEasyRuleQuery.replace('alertEasyRuleThreshold1', alertEasyRule.alertEasyRuleThreshold1);
    alertEasyRuleQuery = alertEasyRuleQuery.replace('alertEasyRuleThreshold2', alertEasyRule.alertEasyRuleThreshold2);

    const findCustomerAccount: ICustomerAccount = await this.customerAccount.findOne({
      where: { customerAccountId: alertEasyRule.customerAccountId, deletedAt: null },
    });
    if (!findCustomerAccount) throw new HttpException(400, `couldn't find customerAccount information`);
    const customerAccountKey = findCustomerAccount.customerAccountKey;

    // step 1.2 find ResourceGroup
    const findResourceGroup: IResourceGroup = await this.resourceGroup.findOne({
      where: { resourceGroupUuid: alertEasyRule.resourceGroupUuid, deletedAt: null },
    });
    if (!findResourceGroup) throw new HttpException(401, `couldn't find active cluster information`);

    // step 1.3 find AlertTargetSubGroup
    const findAlertTargetSubGroup: IAlertTargetSubGroup = await this.alertTargetSubGroup.findOne({
      where: { alertTargetSubGroupId: alertEasyRule.alertTargetSubGroupId, deletedAt: null },
    });
    if (!findAlertTargetSubGroup) throw new HttpException(402, `couldn't find alert target sub group`);
    const alertTargetSubGroupKey = findAlertTargetSubGroup.alertTargetSubGroupKey;

    // step 1.4 if there is an alertEasyRule - same name with alertTargetSubGroup in the table , return exception
    const findAlertEasyRuleWhere = {
      alertEasyRuleName: alertEasyRuleName,
      alertEasyRuleSeverity: alertEasyRuleSeverity,
      customerAccountKey: customerAccountKey,
      resourceGroupUuid: alertEasyRule.resourceGroupUuid,
    };
    const findAlertEasyRule: IAlertEasyRule = await this.alertEasyRule.findOne({
      where: findAlertEasyRuleWhere,
    });
    //if (findAlertEasyRule) throw new HttpException(403, `Duplicatd Easy ALert Rule Name`);
    if (findAlertEasyRule) {
      result.push(findAlertEasyRule);
      return result;
    }

    // step2. Then, create AlertEasyRule for the alert rule of the each cluster.

    const resourceGroupUuid = findResourceGroup.resourceGroupUuid;
    const resourceGroupKey = findResourceGroup.resourceGroupKey;
    const prometheusNamespace = findResourceGroup.resourceGroupKpsLokiNamespace;

    // step 2-1. find AlertRule of the cluster
    const findAlertRule: IAlertRule = await this.alertRule.findOne({
      where: { resourceGroupUuid: resourceGroupUuid, deletedAt: null, alertRuleName: alertEasyRuleName, alertRuleSeverity: alertEasyRuleSeverity },
    });

    let alertGroup;
    if (!findAlertRule) {
      alertGroup = alertEasyRule.alertEasyRuleGroup;
    } else {
      // if there is a same alert...
      alertGroup = findAlertRule.alertRuleGroup;
    }

    const sudorySName = 'getPrometheusRule';
    const sudorySummary = 'getPrometheusRule';
    const clusterUuid = resourceGroupUuid;
    const getTemplateUuid = '00000000000000000000000000004003';
    const getStep = [{ args: { name: alertGroup, namespace: prometheusNamespace } }];
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

    let indexRuleGroup;
    let indexRules;
    let maxIndexRuleGroup;
    let maxIndexRules;
    const sleep = ms => new Promise(res => setTimeout(res, ms));
    let i;
    for (i = 0; i < 6; i++) {
      await sleep(1000);
      const getSudoryWebhook: ISudoryWebhook = await this.sudoryWebhook.findOne({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        where: { serviceUuid: getPrometheusRule.dataValues.serviceUuid, status: 4 },
      });
      if (getSudoryWebhook) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const ruleGroup = JSON.parse(JSON.stringify(getSudoryWebhook.serviceResult.spec.groups));
        const rules = [];
        ruleGroup.forEach((item: any) => {
          item?.rules?.forEach((ruleItem: any) => {
            if (ruleItem.alert) {
              const object = { alert: ruleItem.alert, severity: ruleItem.labels.severity, for: ruleItem.for };
              rules.push(object);
            }
          });
        });
        indexRuleGroup = ruleGroup.findIndex(element => element.name == alertGroup);
        indexRules = rules.findIndex(element => element.alert == alertEasyRule.alertEasyRuleName && element.severity == alertEasyRuleSeverity);
        maxIndexRuleGroup = ruleGroup.length - 1;
        maxIndexRules = rules.length;
        i = 100; //exit for
      }
    }
    console.log('#ALERTEASYRULE - i', i);
    if (i === 101) {
      const sudoryServiceName = 'Patch Prometheus Rule';
      const summary = 'Patch Prometheus Rule';
      const templateUuid = '00000000000000000000000000004016'; //tmplateUuid will be updated - patch PrometheusRule

      let step = [];

      if (!findAlertRule) {
        // step 2-2 provision a brand new alert
        step = [
          {
            args: {
              name: alertGroup,
              namespace: prometheusNamespace,
              patch_type: 'json',
              patch_data: [
                {
                  path: `/spec/groups/${maxIndexRuleGroup}/rules/${maxIndexRules}`,
                  op: 'add',
                  value: {
                    alert: alertEasyRule.alertEasyRuleName,
                    for: alertEasyRule.alertEasyRuleDuration,
                    labels: { severity: alertEasyRule.alertEasyRuleSeverity },
                    expr: alertEasyRuleQuery,
                    annotations: { description: alertEasyRuleDescription, summary: alertEasyRule.alertEasyRuleSummary },
                  },
                },
              ],
            },
          },
        ];
      } else {
        // step 2-3 provision alert update
        step = [
          {
            args: {
              name: alertGroup,
              namespace: prometheusNamespace,
              patch_type: 'json',
              patch_data: [
                {
                  path: `/spec/groups/${indexRuleGroup}/rules/${indexRules}/for`,
                  op: 'replace',
                  value: alertEasyRule.alertEasyRuleDuration,
                },
                {
                  path: `/spec/groups/${indexRuleGroup}/rules/${indexRules}/labels/severity`,
                  op: 'replace',
                  value: alertEasyRule.alertEasyRuleSeverity,
                },
                {
                  path: `/spec/groups/${indexRuleGroup}/rules/${indexRules}/expr`,
                  op: 'replace',
                  value: alertEasyRuleQuery,
                },
                {
                  path: `/spec/groups/${indexRuleGroup}/rules/${indexRules}/annotations/description`,
                  op: 'replace',
                  value: alertEasyRuleDescription,
                },
                {
                  path: `/spec/groups/${indexRuleGroup}/rules/${indexRules}/annotations/summary`,
                  op: 'replace',
                  value: alertEasyRule.alertEasyRuleSummary,
                },
              ],
            },
          },
        ];
      }

      await this.sudoryService.postSudoryService(sudoryServiceName, summary, clusterUuid, templateUuid, step, customerAccountKey, subscribedChannel);
      console.log(`#ALERTEASYRULE provision is done ${clusterUuid}`);
      const currentDate = new Date();
      const createQuery = {
        alertEasyRuleId: uuid.v1(),
        alertTargetSubGroupKey: alertTargetSubGroupKey,
        resourceGroupUuid: resourceGroupUuid,
        resourceGroupKey: resourceGroupKey,
        customerAccountKey: customerAccountKey,
        createdBy: partyId,
        updatedBy: null,
        createdAt: currentDate,
        updatedAt: null,
        deletedAt: null,
        alertEasyRuleName: alertEasyRule.alertEasyRuleName,
        alertEasyRuleDescription: alertEasyRule.alertEasyRuleDescription,
        alertEasyRuleSummary: alertEasyRule.alertEasyRuleSummary,
        alertEasyRuleSeverity: alertEasyRule.alertEasyRuleSeverity,
        alertEasyRuleGroup: alertEasyRule.alertEasyRuleGroup,
        alertEasyRuleDuration: alertEasyRule.alertEasyRuleDuration,
        alertEasyRuleThreshold1: alertEasyRule.alertEasyRuleThreshold1,
        alertEasyRuleThreshold2: alertEasyRule.alertEasyRuleThreshold2,
        alertEasyRuleThreshold1Unit: alertEasyRule.alertEasyRuleThreshold1Unit,
        alertEasyRuleThreshold2Unit: alertEasyRule.alertEasyRuleThreshold2Unit,
        alertEasyRuleThreshold1Max: alertEasyRule.alertEasyRuleThreshold1Max,
        alertEasyRuleThreshold2Max: alertEasyRule.alertEasyRuleThreshold2Max,
        alertEasyRuleQuery: alertEasyRule.alertEasyRuleQuery,
      };
      const createAlertEasyRule: IAlertEasyRule = await this.alertEasyRule.create(createQuery);

      result.push(createAlertEasyRule);
    } else {
      console.log('#ALERTEASYRULE - could not find alert rule group from Prometheus');
    }

    return result;
  }

  public async getAlertEasyRuleAllMute(customerAccountKey: number) {
    const start = Date.now();
    const alertEasyRuleToMap = {};
    const alertEasyRules: IAlertEasyRule[] = await this.getAlertEasyRuleAll(customerAccountKey);

    const alertRuleWhere = {
      alertRuleName: [],
      alertRuleSeverity: [],
      resourceGroupUuid: [],
    };

    alertEasyRules.forEach((alertEasyRule: IAlertEasyRule) => {
      const { alertEasyRuleName, alertEasyRuleSeverity, resourceGroupUuid } = alertEasyRule;

      const hash = `${alertEasyRuleName}${alertEasyRuleSeverity}${resourceGroupUuid}`;

      alertEasyRuleToMap[hash] = {
        alertEasyRule,
      };

      alertRuleWhere.alertRuleName.push(alertEasyRuleName);
      alertRuleWhere.alertRuleSeverity.push(alertEasyRuleSeverity);
      alertRuleWhere.resourceGroupUuid.push(resourceGroupUuid);
    });

    const alertRules: IAlertRule[] = await DB.AlertRule.findAll({
      where: alertRuleWhere,
    });

    const alertRuleKeys: number[] = [];
    const hashPerAlertRuleKeyToMap = {};

    alertRules.forEach((ar: IAlertRule) => {
      const hash = `${ar.alertRuleName}${ar.alertRuleSeverity}${ar.resourceGroupUuid}`;

      if (alertEasyRuleToMap[hash]) {
        hashPerAlertRuleKeyToMap[ar.alertRuleKey] = hash;
        alertEasyRuleToMap[hash].alertRule = ar;
        alertRuleKeys.push(ar.alertRuleKey);
      }
    });

    const alertRuleSettings = await this.alertHubService.getAllAlertRuleKeysSettingData(alertRuleKeys, customerAccountKey);

    alertRuleSettings.forEach((setting: any) => {
      const hash = hashPerAlertRuleKeyToMap[setting.alertRuleKey];
      if (alertEasyRuleToMap[hash]) {
        alertEasyRuleToMap[hash].setting = setting;
      }
    });

    const alertEasyRuleMute = {};
    Object.keys(alertEasyRuleToMap).forEach((key: string) => {
      const value = alertEasyRuleToMap[key];
      alertEasyRuleMute[value?.alertEasyRule?.alertEasyRuleId] = value.setting?.alertNotiSettingEnabled;
    });

    console.log('getAlertEasyRuleAllMute: ', Date.now() - start, 'ms');

    return alertEasyRuleMute;
  }

  public async createAllAlertEasyRulesForCluster(resourceGroupUuid: string): Promise<Object> {
    const findResourceGroup: IResourceGroup = await this.resourceGroup.findOne({ where: { resourceGroupUuid, deletedAt: null } });
    if (!findResourceGroup) throw new HttpException(400, `couldn't find resourceGroup information`);
    const customerAccountKey = findResourceGroup.customerAccountKey;
    const findCustomerAccount: ICustomerAccount = await this.customerAccount.findOne({ where: { customerAccountKey, deletedAt: null } });
    const customerAccountId = findCustomerAccount.customerAccountId;
    const returnMessage = [];
    const { alertEasyRule: alertEasyRuleList } = config.initialRecord;

    let waitSec = 60;
    for (const alertEasyRule of alertEasyRuleList) {
      if (waitSec <= 0) waitSec = 0;
      const getAlertTargetSubGroup: IAlertTargetSubGroup = await this.alertTargetSubGroup.findOne({
        where: { deletedAt: null, alertTargetSubGroupName: alertEasyRule.alertTargetSubGroupName },
      });
      const alertEasyRuleData = {
        createdBy: 'SYSTEM',
        createdAt: new Date(),
        alertTargetSubGroupId: getAlertTargetSubGroup.alertTargetSubGroupId,
        alertEasyRuleName: alertEasyRule.alertEasyRuleName,
        alertEasyRuleDescription: alertEasyRule.alertEasyRuleDescription,
        alertEasyRuleSummary: alertEasyRule.alertEasyRuleSummary,
        alertEasyRuleSeverity: alertEasyRule.alertEasyRuleSeverity,
        alertEasyRuleGroup: alertEasyRule.alertEasyRuleGroup,
        alertEasyRuleDuration: alertEasyRule.alertEasyRuleDuration,
        alertEasyRuleThreshold1: alertEasyRule.alertEasyRuleThreshold1,
        alertEasyRuleThreshold1Unit: alertEasyRule.alertEasyRuleThreshold1Unit,
        alertEasyRuleThreshold1Max: alertEasyRule.alertEasyRuleThreshold1Max,
        alertEasyRuleThreshold2: '',
        alertEasyRuleThreshold2Unit: '',
        alertEasyRuleThreshold2Max: '',

        alertEasyRuleQuery: alertEasyRule.alertEasyRuleQuery,
        customerAccountId: customerAccountId,
        resourceGroupUuid: resourceGroupUuid,
      };
      try {
        const getResponse = await this.createAlertEasyRuleForCluster(alertEasyRuleData, 'SYSTEM', waitSec);
        console.log(`#ALERTEASYRULE AlertEasyRule created------${alertEasyRule.alertEasyRuleName}`, getResponse);
        returnMessage.push(getResponse);
      } catch (error) {
        console.log(`#ALERTEASYRULE AlertEasyRule error------${alertEasyRule.alertEasyRuleName}`, error);
      }
      waitSec = waitSec - 5;
    }

    return returnMessage;
  }

  public async getAlertEasyRuleThreshHold(customerAccountId: string, query?: any): Promise<any> {
    let whereCondition: any = {deletedAt: null}
    if (query?.isParent) {
      whereCondition.parentCustomerAccountId = customerAccountId
    } else {
      whereCondition.customerAccountId = customerAccountId
    }

    console.log(whereCondition)
    let customerAccounts = await this.customerAccount.findAll({
      where: whereCondition
    })

    if (customerAccounts.length === 0) {
      throw new HttpException(404, `not found CustomerAccount`)
    }
    
    var customerAccountKeys = customerAccounts.map(ca => {
      return ca.customerAccountKey
    })

    var resourceGroups = await this.resourceGroup.findAll({
      where: { deletedAt: null, customerAccountKey: { [Op.in]: customerAccountKeys} }
    })

    if (resourceGroups.length === 0) {
      throw new HttpException(204,`not found resourceGroups in customerAccount(${customerAccountKeys})`)
    }

    var alertEasyRules = await this.alertEasyRule.findAll({
      where: { deletedAt: null, customerAccountKey: { [Op.in]: customerAccountKeys} }
    })

    if (alertEasyRules.length === 0) {
      throw new HttpException(204,`not found alertEasyRules in customerAccount(${customerAccountKeys})`)
    }

    let result: any = {}
    resourceGroups.forEach(rg => {
      result[rg.resourceGroupUuid] = {
        podCpuAlertEasyRule: alertEasyRules.find(rule => {
          if (rule.resourceGroupKey === rg.resourceGroupKey && rule.alertEasyRuleName === "PodCPUThresholdOver") {
            return true
          }
        })?.alertEasyRuleThreshold1,
        podMemoryAlertEasyRule: alertEasyRules.find(rule => {
          if (rule.resourceGroupKey === rg.resourceGroupKey && rule.alertEasyRuleName === "PodMemoryThresholdOver") {
            return true
          }
        })?.alertEasyRuleThreshold1,
        NodeCpuAlertEasyRule: alertEasyRules.find(rule => {
          if (rule.resourceGroupKey === rg.resourceGroupKey && rule.alertEasyRuleName === "HostHighCpuLoadMax") {
            return true
          }
        })?.alertEasyRuleThreshold1,
        NodeMemoryAlertEasyRule: alertEasyRules.find(rule => {
          if (rule.resourceGroupKey === rg.resourceGroupKey && rule.alertEasyRuleName === "HostOutOfMemoryMax") {
            return true
          }
        })?.alertEasyRuleThreshold1,
        NodeNetworkInAlertEasyRule: alertEasyRules.find(rule => {
          if (rule.resourceGroupKey === rg.resourceGroupKey && rule.alertEasyRuleName === "HostUnusualNetworkThroughputIn") {
            return true
          }
        })?.alertEasyRuleThreshold1,
        NodeNetworkOutAlertEasyRule: alertEasyRules.find(rule => {
          if (rule.resourceGroupKey === rg.resourceGroupKey && rule.alertEasyRuleName === "HostUnusualNetworkThroughputOut") {
            return true
          }
        })?.alertEasyRuleThreshold1,
        NodeDiskAlertEasyRule: alertEasyRules.find(rule => {
          if (rule.resourceGroupKey === rg.resourceGroupKey && rule.alertEasyRuleName === "VolumeOutOfSpace") {
            return true
          }
        })?.alertEasyRuleThreshold1
      }
    })

    return result
  }
}

export default AlertEasyRuleService;
