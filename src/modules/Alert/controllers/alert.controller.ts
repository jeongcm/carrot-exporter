import { NextFunction, Response } from 'express';
import { IRequestWithUser } from '@/common/interfaces/party.interface';
import { CreateAlertRuleDto } from '../dtos/alertRule.dto';
import AlertRuleService from '../services/alertRule.service';
import { IAlertTimeline } from '@/common/interfaces/alertTimeline.interface';
import { IAlertRule, IAlertRuleGraph } from '@/common/interfaces/alertRule.interface';
import AlertReceivedService from '../services/alertReceived.service';
import AlerthubService from '../services/alerthub.service';
import AlertEasyRuleService from '../services/alertEasyRule.service';
import { IAlertReceived } from '@/common/interfaces/alertReceived.interface';
import { AlertReceivedDto } from '../dtos/alertReceived.dto';
import ControllerExtension from '@/common/extentions/controller.extension';
import ResourceGroupService from '@/modules/Resources/services/resourceGroup.service';
import ResourceService from '@/modules/Resources/services/resource.service';
import AlertConfig from '@/modules/Alert/services/alertConfig.service';
import { IAlertTargetGroup } from '@/common/interfaces/alertTargetGroup.interface';
import { IAlertTargetSubGroup } from '@/common/interfaces/alertTargetSubGroup.interface';
import { IAlertEasyRule } from '@/common/interfaces/alertEasyRule.interface';

class AlertRuleController extends ControllerExtension {
  public alertRuleService = new AlertRuleService();
  public alertReceivedService = new AlertReceivedService();
  public resourceGroupService = new ResourceGroupService();
  public resourceService = new ResourceService();
  public alerthubService = new AlerthubService();
  public alertEasyRuleService = new AlertEasyRuleService();
  public alertConfig = new AlertConfig();

  public getAllAlertRules = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.customerAccountKey;
      const findAllChannelsData: IAlertRule[] = await this.alertRuleService.getAlertRule(customerAccountKey);
      res.status(200).json({ data: findAllChannelsData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getAllAlertRulesGraph = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.customerAccountKey;
      const status = req.params.status;
      const findAllChannelsData: IAlertRuleGraph[] = await this.alertRuleService.getAlertRuleGraph(customerAccountKey, status);
      res.status(200).json({ data: findAllChannelsData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };
  public getAllAlertReceivedMostRecent = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.customerAccountKey;
      const query = JSON.parse(req.query.query as string);
      const findAllAlertReceived: IAlertReceived[] = await this.alertReceivedService.getAllAlertReceivedMostRecent(customerAccountKey, query);
      res.status(200).json({ data: findAllAlertReceived, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getAllSettingAlertRule = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.customerAccountKey;
      const { alertRuleIds } = req.body;
      const findAllAlertReceived: IAlertRule[] = await this.alerthubService.getAllAlertRuleIdsSettingData(alertRuleIds, customerAccountKey);
      res.status(200).json({ data: findAllAlertReceived, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public createAlertRuleSetting = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.customerAccountKey;
      const alertSettingData = req.body;
      const findAllAlertReceived: IAlertRule[] = await this.alerthubService.upsertAlertRuleSetting(alertSettingData, customerAccountKey);
      res.status(200).json({ data: findAllAlertReceived, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public updateAlertRuleSetting = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.customerAccountKey;
      const alertRuleId: string = req.params.alertRuleId;
      const alertRuleKey: IAlertRule[] = await this.alertRuleService.findAlertRuleKeyByIds([alertRuleId], customerAccountKey);
      const alertSettingData = req.body;
      if (alertRuleKey.length !== 0) {
        alertSettingData['alertRuleKey'] = alertRuleKey[0].alertRuleKey;
      }
      const findAllAlertReceived: IAlertRule[] = await this.alerthubService.upsertAlertRuleSetting(alertSettingData, customerAccountKey);
      res.status(200).json({ data: findAllAlertReceived, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public updateResourceGroupAlertConfig = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.customerAccountKey;
      const resourceGroupId: string = req.params.resourceGroupId;
      const { repeatInterval, groupWait } = req.body;
      const data = await this.alertConfig.updateResourceGroupAlertConfig(customerAccountKey, resourceGroupId, repeatInterval, groupWait);
      res.status(200).json({ data, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getAllAlertReceivedByAlertRuleId = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.customerAccountKey;
      const alertRuleId: string = req.params.alertRuleId;
      const findAllAlertReceived: IAlertReceived[] = await this.alertReceivedService.getAllAlertReceivedByAlertRuleId(
        customerAccountKey,
        alertRuleId,
      );
      res.status(200).json({ data: findAllAlertReceived, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getAllAlertReceivedByAlertHash = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const alertHash: string = req.params.alertHash;

      const findAllAlertReceivedByHash: IAlertReceived[] = await this.alertReceivedService.getAllAlertReceivedByAlertHash(alertHash, req.query?.startAt, req.query?.endAt);
      res.status(200).json({ data: findAllAlertReceivedByHash, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };
  public getAlertReceivedHistory = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.customerAccountKey;
      const alertReceivedId: string = req.params.alertReceivedId;
      const alertsFound: IAlertReceived[] = await this.alertReceivedService.getAlertReceivedHistory(customerAccountKey, alertReceivedId);
      this.resultJson(res, 'HISTORY_FOUND', alertsFound);
    } catch (error) {
      next(error);
    }
  };
  public getAllAlertReceived = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.customerAccountKey;
      const findAllAlertReceived = await this.alertReceivedService.getAllAlertReceived(
        customerAccountKey,
        // {
        //   query: {
        //     alertReceivedName: `${req.query?.name}`,
        //   },
        // }
      );
      res.status(200).json({ data: findAllAlertReceived, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getAllAlertReceivedByParentCustomerAccountId = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const parentCustomerAccountId = req.params.parentCustomerAccountId;
      console.log(parentCustomerAccountId)
      const findAllAlertReceived = await this.alertReceivedService.getAllAlertReceivedByParentCustomerAccountId(
        parentCustomerAccountId,
        // {
        //   query: {
        //     alertReceivedName: `${req.query?.name}`,
        //   },
        // }
      );
      res.status(200).json({ data: findAllAlertReceived, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public updateAlertRule = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const alertRuleId: string = req.params.alertRuleId;
      const {
        user: { partyId },
      } = req;
      const alertRuleData = req.body;
      const customerAccountKey = req.customerAccountKey;
      const updateAlertRuleData: IAlertRule = await this.alertRuleService.updateAlertRule(alertRuleId, alertRuleData, customerAccountKey, partyId);
      res.status(200).json({ data: updateAlertRuleData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public getAlertRuleById = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const alertRuleId: string = req.params.alertRuleId;
      const updateAlertRuleData: IAlertRule = await this.alertRuleService.getAlertRuleById(alertRuleId);
      res.status(200).json({ data: updateAlertRuleData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public updateAlertReceived = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const alertReceivedId: string = req.params.alertReceivedId;
      const {
        user: { partyId },
      } = req;
      const alertReceivedData = req.body;
      const customerAccountKey = req.customerAccountKey;
      const updateAlertReceivedData: IAlertReceived = await this.alertReceivedService.updateAlertReceived(
        alertReceivedId,
        alertReceivedData,
        customerAccountKey,
        partyId,
      );
      res.status(200).json({ data: updateAlertReceivedData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public createAlertRule = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.customerAccountKey;
      const {
        user: { partyId },
      } = req;
      const alertRuleData: CreateAlertRuleDto = req.body;
      const createAlertRuleData: IAlertRule = await this.alertRuleService.createAlertRule(alertRuleData, customerAccountKey, partyId);
      res.status(201).json({ data: createAlertRuleData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public createAlertReceived = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.customerAccountKey;
      const {
        user: { partyId },
      } = req;
      const alertReceivedData: AlertReceivedDto = req.body;
      const createAlertReceivedData: IAlertReceived = await this.alertReceivedService.createAlertReceived(
        alertReceivedData,
        customerAccountKey,
        partyId,
      );
      res.status(201).json({ data: createAlertReceivedData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public getAlertReceived = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const alertReceivedId: string = req.params.alertReceivedId;
      const showDeleted = String(req.query?.showDeleted);
      const alertFound: any = await this.alertReceivedService.findAlertReceivedById(alertReceivedId, showDeleted === 'true');
      if (alertFound) {
        // TODO: we need to associate resourceGroup with alertRule through resourceGroupUuid later
        let resourceGroup = {};
        if (alertFound.alertRule?.resourceGroupUuid) {
          resourceGroup = await this.resourceGroupService.getResourceGroupByUuid(alertFound.alertRule?.resourceGroupUuid);
        }

        const alertToReturn: any = { ...alertFound };
        const resourceGroupToReturn: any = { ...resourceGroup };

        delete resourceGroupToReturn.dataValues?.resourceGroupKey;
        delete resourceGroupToReturn.dataValues?.customerAccountKey;

        this.resultJson(res, 'FOUND', { ...alertToReturn.dataValues, resourceGroup: { ...resourceGroupToReturn.dataValues } });
      } else {
        res.status(404).json({ message: 'NOT_FOUND' });
      }
    } catch (error) {
      next(error);
    }
  };

  public deleteAlertReceived = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const alertReceivedId: string = req.params.alertReceivedId;
      const customerAccountKey = req.customerAccountKey;
      const deletedFlag = await this.alertReceivedService.deleteAlertReceived(customerAccountKey, alertReceivedId);
      if (deletedFlag) {
        res.status(200).json({ data: deletedFlag, message: 'deleted' });
      } else {
        res.status(204).json({ data: deletedFlag, message: 'No Content' });
      }
    } catch (error) {
      next(error);
    }
  };

  public getAlertRuleByRuleGroupId = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const {
        params: { ruleGroupId },
      } = req;
      const aletRuleList: IAlertRule[] = await this.alertRuleService.getAlertRuleByRuleGroupId(ruleGroupId);
      return res.status(200).json({ data: aletRuleList, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getAlertRuleByResourceGroupUuid = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const {
        params: { resourceGroupId },
      } = req;
      const aletRuleList: IAlertRule[] = await this.alertRuleService.getAlertRuleByResourceGroupUuid(resourceGroupId);
      return res.status(200).json({ data: aletRuleList, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getAlertTimelinesByAlertRuleId = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const {
        params: { alertRuleId },
      } = req;
      const customerAccountKey = req.customerAccountKey;
      const alertRuleKey: number = await this.alertRuleService.findAlertRuleKeyById(alertRuleId);

      const alertTimelines: IAlertTimeline[] = await this.alerthubService.getAlertTimelinesByAlertRuleKey(customerAccountKey, alertRuleKey);

      return res.status(200).json({ data: alertTimelines, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getAlertNotiScheduledByAlertRuleId = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const {
        params: { alertRuleId },
      } = req;
      const customerAccountKey = req.customerAccountKey;
      const alertRuleKey: number = await this.alertRuleService.findAlertRuleKeyById(alertRuleId);

      const alertTimelines: IAlertTimeline[] = await this.alerthubService.getAlertNotiScheduledByAlertRuleKey(customerAccountKey, alertRuleKey);

      return res.status(200).json({ data: alertTimelines, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getAlertReceivedByAlertTimelineId = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const {
        params: { alertTimelineId },
      } = req;
      const customerAccountKey = req.customerAccountKey;
      const alertRuleKey: number = await this.alertRuleService.findAlertRuleKeyById(alertTimelineId);

      const alertTimelines: IAlertTimeline[] = await this.alerthubService.getAlertNotiScheduledByAlertRuleKey(customerAccountKey, alertRuleKey);

      return res.status(200).json({ data: alertTimelines, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getAlertTimelineByResourceId = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const {
        params: { resourceId },
      } = req;
      const customerAccountKey = req.customerAccountKey;
      const resource = await this.resourceService.getResourceById(resourceId);
      const resourceGroupKey = Number(resource?.resourceGroupKey);
      const resourceType = resource.resourceType;
      const resourceName = resource.resourceName;
      const resourceGroup = await this.resourceGroupService.getUserResourceGroupByKey(customerAccountKey, resourceGroupKey);
      const resourceGroupUuid = resourceGroup?.resourceGroupUuid;
      const filteringData = {
        resourceName,
        resourceType,
        resourceGroupUuid,
      };
      const start = Date.now();
      const alertTimelines: any = await this.alerthubService.getAlertTimelineByResourceDetail(customerAccountKey, filteringData);

      const ctrlResTime = Date.now() - start;
      console.log(`Controller response time: `, ctrlResTime, 'ms');

      alertTimelines.ctrlResTime = ctrlResTime;

      return res.status(200).json({ data: alertTimelines, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public createAlertTargetGroup = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const alertTargetGroup = req.body;
      const partyId = req.user.partyId;
      console.log(partyId);
      const createAlertTargetGroup: IAlertTargetGroup = await this.alertEasyRuleService.createAlertTargetGroup(alertTargetGroup, partyId);
      res.status(200).json({ data: createAlertTargetGroup, message: 'created AlertTargetGroup' });
    } catch (error) {
      next(error);
    }
  };

  public createAlertTargetSubGroup = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const alertTargetSubGroup = req.body;
      const partyId = req.user.partyId;
      console.log(partyId);
      const createAlertTargetSubGroup: IAlertTargetSubGroup = await this.alertEasyRuleService.createAlertTargetSubGroup(alertTargetSubGroup, partyId);
      res.status(200).json({ data: createAlertTargetSubGroup, message: 'created AlertTargetSubGroup' });
    } catch (error) {
      next(error);
    }
  };

  public createAlertEasyRule = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const alertEasyRule = req.body;
      const partyId = req.user.partyId;
      let createAlertEasyRule: any
      if (!req.body.resourceGroupUuid) {
        createAlertEasyRule = await this.alertEasyRuleService.createAlertEasyRule(alertEasyRule, partyId);
      } else {
        const prometheusRules = await this.alertEasyRuleService.getPrometheusRuleSpecs(req.body.customerAccountId, req.body.resourceGroupUuid)

        createAlertEasyRule = await this.alertEasyRuleService.createAlertEasyRuleForCluster(alertEasyRule, partyId, prometheusRules)
      }
      res.status(200).json({ data: createAlertEasyRule, message: 'created AlertTargetGroup' });
    } catch (error) {
      next(error);
    }
  };

  public updateAlertEasyRule = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const alertEasyRule = req.body;
      //const alertEasyRuleId = req.params.alertEasyRuleId;
      const partyId = req.user.partyId;
      const updateAlertEasyRule = await this.alertEasyRuleService.updateAlertEasyRule(alertEasyRule, partyId);
      res.status(200).json({ data: updateAlertEasyRule, message: 'updated AlertTargetGroup' });
    } catch (error) {
      next(error);
    }
  };
  public getAlertEasyRuleById = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const alertEasyRuleId = req.params.alertEasyRuleId;
      const getAlertEasyRule = await this.alertEasyRuleService.getAlertEasyRuleById(alertEasyRuleId);
      res.status(200).json({ data: getAlertEasyRule, message: 'find AlertEasyRule' });
    } catch (error) {
      next(error);
    }
  };
  public getAlertEasyRuleAll = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.user.customerAccountKey;
      const getAlertEasyRules = await this.alertEasyRuleService.getAlertEasyRuleAll(customerAccountKey);
      res.status(200).json({ data: getAlertEasyRules, message: 'find AlertEasyRules' });
    } catch (error) {
      next(error);
    }
  };
  public deleteAlertTargetSubGroup = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const alertTargetSubGroupId = req.params.alertTargetSubGroupId;
      const getResponse = await this.alertEasyRuleService.deleteAlertTargetSubGroup(alertTargetSubGroupId);
      res.status(200).json({ data: getResponse, message: 'delete AlertTargetSubGroup' });
    } catch (error) {
      next(error);
    }
  };
  public getAlertTargetGroupAll = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const getAlertTargetGroupAll = await this.alertEasyRuleService.getAlertTargetGroupAll();
      res.status(200).json({ data: getAlertTargetGroupAll, message: 'find AlertTargetGroupAll' });
    } catch (error) {
      next(error);
    }
  };

  public updateAlertEasyRuleMute = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.user.customerAccountKey;

      const { alertEasyRuleId } = req.params;

      const opts: any = await this.alertEasyRuleService.getAlertEasyRuleById(alertEasyRuleId);

      if (!opts.AlertEasyRule) {
        throw new Error(`No alertEasyRule under alertEasyRule ID ${alertEasyRuleId}`);
      }

      if (!opts.alert) {
        throw new Error(`No AlertRule under alertEasyRule ID ${alertEasyRuleId}`);
      }

      const status = await this.alerthubService.upsertAlertRuleSetting(
        {
          alertNotiSettingEnabled: req?.body?.muted,
          alertRuleKey: opts.alert?.alertRuleKey,
        },
        customerAccountKey,
      );
      res.status(200).json({ data: status, message: 'update alertEasyRule mute' });
    } catch (error) {
      next(error);
    }
  };

  public getAlertEasyRuleAllMute = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.user.customerAccountKey;
      const setting = await this.alertEasyRuleService.getAlertEasyRuleAllMute(customerAccountKey);
      res.status(200).json({ data: setting, message: 'find AlertEasyRules' });
    } catch (error) {
      next(error);
    }
  };

  public createAllAlertEasyRulesForCluster = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const resourceGroupUuid = req.body.resourceGroupUuid;
      const response = await this.alertEasyRuleService.createAllAlertEasyRulesForCluster(resourceGroupUuid);
      res.status(200).json({ data: response, message: `requested AlertEasyRules for cluster ${resourceGroupUuid}` });
    } catch (error) {
      next(error);
    }
  };

  public getAlertEasyRuleThreshHold = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountId = req.params.customerAccountId;
      const getAlertEasyRuleThreshHold = await this.alertEasyRuleService.getAlertEasyRuleThreshHold(customerAccountId, req.query);
      res.status(200).json({ data: getAlertEasyRuleThreshHold, message: 'find getAlertEasyRuleThreshHold' });
    } catch (error) {
      next(error);
    }
  };

}

export default AlertRuleController;
