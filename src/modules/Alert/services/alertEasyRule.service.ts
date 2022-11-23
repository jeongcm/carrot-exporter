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
//import { arrayBuffer } from 'stream/consumers';
//import path from 'path';
//import { max } from 'lodash';

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

          alertEasyRuleQuery: alertEasyRule.alertEasyRuleQuery,
        };
        const createAlertEasyRule: IAlertEasyRule = await this.alertEasyRule.create(createQuery);

        result.push(createAlertEasyRule);
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
      where: { deletedAt: null, alertRuleName: findAlertEasyRule.alertEasyRuleName, alertRuleSeverity: findAlertEasyRule.alertEasyRuleSeverity },
    };
    const getAlertRule: IAlertRule = await this.alertRule.findOne(querySql2);
    returnResponse = { ...returnResponse, alert: getAlertRule };
    return returnResponse;
  }

  public async updateAlertEasyRule(alertEasyRule: UpdateAlertEasyRuleDto, partyId: string): Promise<Object> {
    const result = [];
    const resourceGroupUuid = alertEasyRule.resourceGroupUuid;
    const alertEasyRuleId = alertEasyRule.alertEasyRuleId;
    const subscribedChannel = config.sudoryApiDetail.channel_webhook;

    //step 1-1. Confirm alertEasyRule
    const findAlertEasyRule: IAlertEasyRule = await this.alertEasyRule.findOne({
      where: { alertEasyRuleId: alertEasyRuleId },
    });
    if (!findAlertEasyRule) throw new HttpException(404, `No Easy Alert Rule`);

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

    //step 1-4 Confirm existance of AlertRule - name + severity combination
    const findAlertRule: IAlertRule = await this.alertRule.findOne({
      where: {
        resourceGroupUuid: resourceGroupUuid,
        deletedAt: null,
        alertRuleName: findAlertEasyRule.alertEasyRuleName,
        alertRuleSeverity: alertEasyRule.alertEasyRuleSeverity,
      },
    });
    if (!findAlertRule) throw new HttpException(405, `couldn't find existing alert rule information`);

    //Step 2-1 Prepare for Prometheus Rule patch
    const prometheusNamespace = findResourceGroup.resourceGroupKpsLokiNamespace;
    const prometheus = findResourceGroup.resourceGroupPrometheus;

    const alertGroup = findAlertRule.alertRuleGroup;
    const appName = prometheus.substring(7, prometheus.indexOf('.'));
    const prometheusRuleGroupName = appName.substring(0, appName.length - 11) + '-' + alertGroup;

    const sudoryServiceName = 'Patch Prometheus Rule';
    const summary = 'Patch Prometheus Rule';
    const templateUuid = '00000000000000000000000000004016'; //tmplateUuid will be updated - patch PrometheusRule

    // alertEasyRuleDescription
    let alertEasyRuleDescription;
    let alertEasyRuleDescriptionForDb;
    if (!alertEasyRule.alertEasyRuleDescription || alertEasyRule.alertEasyRuleDescription === '') {
      alertEasyRuleDescription = findAlertEasyRule.alertEasyRuleDescription.replace('alertEasyRuleThreshold1', alertEasyRule.alertEasyRuleThreshold1);
      alertEasyRuleDescriptionForDb = findAlertEasyRule.alertEasyRuleDescription;
    } else {
      alertEasyRuleDescription = alertEasyRule.alertEasyRuleDescription.replace('alertEasyRuleThreshold1', alertEasyRule.alertEasyRuleThreshold1);
      alertEasyRuleDescriptionForDb = alertEasyRule.alertEasyRuleDescription;
    }
    //alertEasyRuleDescription = alertEasyRuleDescription.replace('alertEasyRuleThreshold2', alertEasyRule.alertEasyRuleThreshold2);

    // alertEasyRuleQuery
    let alertEasyRuleQuery;
    let alertEasyRuleQueryForDb;
    if (!alertEasyRule.alertEasyRuleQuery || alertEasyRule.alertEasyRuleQuery === '') {
      alertEasyRuleQuery = findAlertEasyRule.alertEasyRuleQuery.replace('alertEasyRuleThreshold1', alertEasyRule.alertEasyRuleThreshold1);
      alertEasyRuleQueryForDb = findAlertEasyRule.alertEasyRuleQuery;
    } else {
      alertEasyRuleQuery = alertEasyRule.alertEasyRuleQuery.replace('alertEasyRuleThreshold1', alertEasyRule.alertEasyRuleThreshold1);
      alertEasyRuleQueryForDb = alertEasyRule.alertEasyRuleQuery;
    }
    //alertEasyRuleQuery = alertEasyRuleQuery.replace('alertEasyRuleThreshold2', alertEasyRule.alertEasyRuleThreshold2);

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

    // alertEasyRuleName
    const alertEasyRuleName = findAlertEasyRule.alertEasyRuleName;

    // alertEasyRuleSeverity
    let alertEasyRuleSeverity;
    let step = [];
    let indexRuleGroup;
    let indexRules;
    let maxIndexRuleGroup;
    let maxIndexRules;
    let i;
    const sleep = ms => new Promise(res => setTimeout(res, ms));

    const sudorySName = 'getPrometheusRule';
    const sudorySummary = 'getPrometheusRule';
    const clusterUuid = resourceGroupUuid;
    const getTemplateUuid = '00000000000000000000000000004003';
    const getStep = [{ args: { name: prometheusRuleGroupName, namespace: prometheusNamespace } }];

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
    if (alertEasyRule.alertEasyRuleSeverity === '' || alertEasyRule.alertEasyRuleSeverity === existingAlertEasyRuleSeverity) {
      // Prometheus Alert Rule update only case
      alertEasyRuleSeverity = existingAlertEasyRuleSeverity;
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
          indexRules = rules.findIndex(element => element.alert == findAlertEasyRule.alertEasyRuleName && element.severity == alertEasyRuleSeverity);
          maxIndexRuleGroup = ruleGroup.length - 1;
          maxIndexRules = rules.length;
          i = 100; //exit for
        }
      }
      if (!getSudoryWebhook) throw new HttpException(500, `Error on retrieving Prometheus Alert Rule`);
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
      console.log('step1', JSON.stringify(step));
    } else {
      alertEasyRuleSeverity = alertEasyRule.alertEasyRuleSeverity;
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
          indexRules = rules.findIndex(element => element.alert == findAlertEasyRule.alertEasyRuleName && element.severity == alertEasyRuleSeverity);
          maxIndexRuleGroup = ruleGroup.length - 1;
          maxIndexRules = rules.length;
          i = 100; //exit for
        }
      }

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
      alertEasyRuleThreshold1: alertEasyRule.alertEasyRuleThreshold1,
      alertEasyRuleThreshold2: alertEasyRule.alertEasyRuleThreshold2,
      alertEasyRuleThreshold1Unit: alertEasyRule.alertEasyRuleThreshold1Unit,
      alertEasyRuleThreshold2Unit: alertEasyRule.alertEasyRuleThreshold2Unit,
      alertEasyRuleThreshold1Max: alertEasyRule.alertEasyRuleThreshold1Max,
      alertEasyRuleThreshold2Max: alertEasyRule.alertEasyRuleThreshold2Max,
    };
    console.log(updateQuery);
    const createAlertEasyRule = await this.alertEasyRule.update(updateQuery, { where: { alertEasyRuleId } });

    result.push(updateQuery);
    result.push(createAlertEasyRule);

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
    const findAlertEasyRule: IAlertEasyRule = await this.alertEasyRule.findOne({
      where: {
        alertEasyRuleName: alertEasyRuleName,
        alertEasyRuleSeverity: alertEasyRuleSeverity,
        customerAccountKey: customerAccountKey,
        resourceGroupUuid: alertEasyRule.resourceGroupUuid,
      },
    });
    if (findAlertEasyRule) throw new HttpException(403, `Duplicatd Easy ALert Rule Name`);

    // step2. Then, create AlertEasyRule for the alert rule of the each cluster.

    const resourceGroupUuid = findResourceGroup.resourceGroupUuid;
    const resourceGroupKey = findResourceGroup.resourceGroupKey;
    const prometheusNamespace = findResourceGroup.resourceGroupKpsLokiNamespace;
    const prometheus = findResourceGroup.resourceGroupPrometheus;

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
      console.log('#ALERTEASYRULE - could not find alert rule from Prometheus');
    }

    return result;
  }
}

export default AlertEasyRuleService;
