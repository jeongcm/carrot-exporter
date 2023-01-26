import { IBayesianModel, IBayesianDBModel, IBayesianJoinDBModel } from '@/common/interfaces/bayesianModel.interface';
import { IAnomalyMonitoringTarget } from '@/common/interfaces/monitoringTarget.interface';
import { IResourceGroup } from '@/common/interfaces/resourceGroup.interface';
import DB from '@/database';

import { CreateBayesianModelDto, UpdateBayesianModelDto } from '../dtos/bayesianModel.dto';
import { isEmpty } from '@/common/utils/util';
import { HttpException } from '@/common/exceptions/HttpException';
//import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';
import AnomalyMonitoringTargetService from '@/modules/MetricOps/services/monitoringTarget.service';
import ModelRuleScoreService from '@/modules/MetricOps/services/modelRuleScore.service';
import RuleGroupService from '@/modules/MetricOps/services/ruleGroup.service';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import { ModelRuleScoreTable } from '../models/modelRuleScore.model';
import { RuleGroupAlertRuleModel } from '../models/ruleGroupAlertRule.model';
import { AnomalyMonitoringTargetTable } from '../models/monitoringTarget.model';
import { RuleGroupModel } from '../models/ruleGroup.model';
import { ResourceGroupModel } from '@/modules/Resources/models/resourceGroup.model';
import { logger } from '@/common/utils/logger';
import { ResourceModel } from '@/modules/Resources/models/resource.model';
import config from '@config/index';
import { AlertRuleModel } from '@/modules/Alert/models/alertRule.model';
import MetricOpsUtilService from './metricOpsUtill.service';
import { ICustomerAccount } from '@/common/interfaces/customerAccount.interface';
import { IRuleGroup } from '@/common/interfaces/ruleGroup.interface';
import { IAlertRule } from '@/common/interfaces/alertRule.interface';
import { ISudoryTemplate } from '@/common/interfaces/sudoryTemplate.interface';
import { IResolutionAction } from '@/common/interfaces/resolutionAction.interface';
import { IRuleGroupAlertRule } from '@/common/interfaces/ruleGroupAlertRule.interface';
import { IRuleGroupResolutionAction } from '@/common/interfaces/ruleGroupResolutionAction.interface';
import { IModelRuleScore } from '@/common/interfaces/modelRuleScore.interface';
import { bool } from 'aws-sdk/clients/signer';

class BayesianModelServices {
  public bayesianModel = DB.BayesianModel;
  public modelRuleScore = DB.ModelRuleScore;
  public subscribedProduct = DB.SubscribedProduct;
  public monitoringTarget = DB.AnomalyMonitoringTarget;
  public resourceGroup = DB.ResourceGroup;
  public ruleGroup = DB.RuleGroup;
  public resolutionAction = DB.ResolutionAction;
  public ruleGroupResolutionAction = DB.RuleGroupResolutionAction;
  public ruleGroupAlertRule = DB.RuleGroupAlertRule;
  public alertRule = DB.AlertRule;
  public customerAccount = DB.CustomerAccount;
  public sudoryTemplate = DB.SudoryTemplate;
  //public customerAccountService = new CustomerAccountService();
  public tableIdService = new TableIdService();
  public anomalyMonitoringTargetService = new AnomalyMonitoringTargetService();
  public modelRuleScoreService = new ModelRuleScoreService();
  public metricOpsUtilService = new MetricOpsUtilService();
  public ruleGroupService = new RuleGroupService();

  /**
   * Find all BayesianModel List
   *
   * @returns Promise<IBayesianModel[]>
   * @author Shrishti Raj
   */
  public async findAllBayesianModel(customerAccountKey: number, bayesianModelClusterId?: any): Promise<IBayesianDBModel[]> {
    let whereCondition = {};
    whereCondition = { customerAccountKey: customerAccountKey, deletedAt: null };

    if (bayesianModelClusterId) {
      const resultResourceGroup: IResourceGroup = await this.resourceGroup.findOne({ where: { resourceGroupId: bayesianModelClusterId } });
      if (!resultResourceGroup) throw new HttpException(409, "ResourceGroup doesn't exist");
      const resourceGroupKey = resultResourceGroup.resourceGroupKey;
      whereCondition = { ...whereCondition, resourceGroupKey };
    }

    const bayesianModelList: IBayesianDBModel[] = await this.bayesianModel.findAll({
      where: whereCondition,
      include: {
        model: ResourceGroupModel,
        attributes: ['resourceGroupName', 'resourceGroupId'],
      },
    });
    return bayesianModelList;
  }
  /**
   * Create a new BayesianModel
   *
   * @param  {CreateBayesianModelDto} bayesianModelData
   * @returns Promise<IBayesianModel>
   * @author Shrishti Raj
   */
  public async createBayesianModel(bayesianModelData: CreateBayesianModelDto, customerAccountKey: number, systemId: string): Promise<IBayesianModel> {
    if (isEmpty(bayesianModelData)) throw new HttpException(400, 'BayesianModel Data cannot be blank');

    const tableIdName = 'BayesianModel';
    const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdName);
    const BayesianModelId: string = responseTableIdData.tableIdFinalIssued;
    const { bayesianModelName, bayesianModelDescription, bayesianModelResourceType, resourceGroupUuid } = bayesianModelData;

    const resultResourceGroup: IResourceGroup = await this.resourceGroup.findOne({ where: { resourceGroupUuid: resourceGroupUuid } });
    if (!resultResourceGroup) throw new HttpException(409, "ResourceGroup doesn't exist");
    const resourceGroupKey = resultResourceGroup.resourceGroupKey;

    const currentDate = new Date();
    const BayesianModel = {
      bayesianModelId: BayesianModelId,
      createdBy: systemId,
      createdAt: currentDate,
      bayesianModelName,
      bayesianModelDescription,
      bayesianModelResourceType,
      resourceGroupKey,
      customerAccountKey,
      bayesianModelStatus: 'AC',
    };
    const newBayesianModel: IBayesianDBModel = await this.bayesianModel.create(BayesianModel);
    const {
      bayesianModelKey,
      createdBy,
      updatedBy,
      createdAt,
      updatedAt,
      deletedAt,
      //bayesianModelName,
      bayesianModelStatus,
      //bayesianModelDescription,
      //customerAccountKey,
      //bayesianModelResourceType,
      bayesianModelScoreCard,
      //resourceGroupKey,
      version,
      standardModelId,
    } = newBayesianModel;

    const returnNewBaysianModel = {
      bayesianModelKey,
      bayesianModelId: BayesianModelId,
      createdBy,
      updatedBy,
      createdAt,
      updatedAt,
      deletedAt,
      bayesianModelName,
      bayesianModelStatus,
      bayesianModelDescription,
      customerAccountKey,
      bayesianModelResourceType,
      bayesianModelScoreCard,
      resourceGroupUuid,
      version,
      standardModelId,
    };
    console.log('bayesianModelKey', bayesianModelKey);
    await this.metricOpsUtilService.updateBayesianNetwork(bayesianModelKey);

    return returnNewBaysianModel;
  }

  /**
   * find BayesianModel by Id
   *
   * @param  {string} BayesianModelId
   * @returns Promise<IBayesianModel>
   * @author Shrishti Raj
   */
  public async findBayesianModelById(bayesianModelId: string): Promise<IBayesianDBModel> {
    if (!bayesianModelId) throw new HttpException(409, 'BayesianModel Id Not found');

    const findBayesianModel: IBayesianDBModel = await this.bayesianModel.findOne({
      where: { bayesianModelId, deletedAt: null },
      attributes: { exclude: ['resourceGroupKey'] },
      include: [
        {
          model: ModelRuleScoreTable,
          required: false,
          where: { deletedAt: null },
          attributes: ['bayesianModelKey'],
          include: [
            {
              model: RuleGroupModel,
              where: { deletedAt: null },
              include: [
                {
                  model: RuleGroupAlertRuleModel,
                  where: { deletedAt: null },
                },
              ],
            },
          ],
        },
        {
          model: ResourceGroupModel,
          where: { deletedAt: null },
          attributes: ['resourceGroupName', 'resourceGroupId'],
        },
        {
          model: AnomalyMonitoringTargetTable,
          where: { deletedAt: null },
          required: false,
          include: [{ model: ResourceModel, where: { deletedAt: null }, include: [{ model: ResourceGroupModel }] }],
        },
      ],
    });

    return findBayesianModel;
  }

  /**
   * find BayesianModel by Key
   *
   * @param  {string} BayesianModelKey
   * @returns Promise<IBayesianModel>
   * @author Jerry Lee
   */
  public async findBayesianModelByKey(bayesianModelKey: number): Promise<IBayesianDBModel> {
    if (!bayesianModelKey) throw new HttpException(409, 'BayesianModel Id Not found');

    const findBayesianModel: IBayesianDBModel = await this.bayesianModel.findOne({
      where: { bayesianModelKey, deletedAt: null },
    });

    return findBayesianModel;
  }

  /**
   * find BayesianModel by ResourceType
   *
   * @param  {string} ResourceType
   * @returns Promise<IBayesianModel>
   * @author Shrishti Raj
   */
  public async findBayesianModelByResourceType(resourceType: string): Promise<IBayesianModel[]> {
    if (isEmpty(resourceType)) throw new HttpException(400, 'No Resource Type');
    const bayesianModelList: IBayesianDBModel[] = await this.bayesianModel.findAll({
      where: { bayesianModelResourceType: resourceType, deletedAt: null },
    });
    if (!bayesianModelList) throw new HttpException(409, 'BayesianModel detail Not found');

    const resultAllBayesianModel = [];
    const modelLength = bayesianModelList.length;
    for (let i = 0; i < modelLength; i++) {
      const resultResourceGroup: IResourceGroup = await this.resourceGroup.findOne({
        where: { resourceGroupKey: bayesianModelList[i].resourceGroupKey },
      });
      const {
        bayesianModelKey,
        bayesianModelId,
        createdBy,
        updatedBy,
        createdAt,
        updatedAt,
        deletedAt,
        bayesianModelName,
        bayesianModelStatus,
        bayesianModelDescription,
        customerAccountKey,
        bayesianModelResourceType,
        bayesianModelScoreCard,
      } = bayesianModelList[i];

      resultAllBayesianModel[i] = {
        bayesianModelKey,
        bayesianModelId,
        createdBy,
        updatedBy,
        createdAt,
        updatedAt,
        deletedAt,
        bayesianModelName,
        bayesianModelStatus,
        bayesianModelDescription,
        customerAccountKey,
        bayesianModelResourceType,
        bayesianModelScoreCard,
        bayesianModelClusterId: resultResourceGroup.resourceGroupId,
      };
    }

    return resultAllBayesianModel;
  }

  /**
   * updateBaysianModel
   *
   * @param  {string} bayesianModelId
   * @param {UpdateBayesianModelDto} bayesianModelData
   * @returns Promise<IBayesianDBModel>
   * @author Shrishti Raj
   */
  public async updateBayesianModel(bayesianModelId: string, bayesianModelData: UpdateBayesianModelDto, systemId: string): Promise<IBayesianDBModel> {
    if (isEmpty(UpdateBayesianModelDto)) throw new HttpException(400, 'BayesianModel Data cannot be blank');
    const findBayesianModel: IBayesianDBModel = await this.bayesianModel.findOne({ where: { bayesianModelId } });
    const bayesianModelKey = findBayesianModel.bayesianModelKey;
    if (!findBayesianModel) throw new HttpException(409, "BayesianModel doesn't exist");
    const { bayesianModelName, bayesianModelDescription, bayesianModelResourceType, bayesianModelScoreCard, resourceGroupId, version } =
      bayesianModelData;
    let resourceGroupKey;
    if (resourceGroupId) {
      const resultResourceGroup: IResourceGroup = await this.resourceGroup.findOne({ where: { resourceGroupId: resourceGroupId } });
      if (!resultResourceGroup) throw new HttpException(409, "ResourceGroup doesn't exist");
      resourceGroupKey = resultResourceGroup.resourceGroupKey;
    }

    const currentDate = new Date();
    const updatedModelData = {
      bayesianModelName,
      bayesianModelDescription,
      bayesianModelResourceType,
      bayesianModelScoreCard,
      resourceGroupKey,
      updatedBy: systemId,
      updatedAt: currentDate,
      version,
    };
    await this.bayesianModel.update(updatedModelData, { where: { bayesianModelId } });
    if (bayesianModelScoreCard && Object.keys(bayesianModelScoreCard).length) {
      await this.metricOpsUtilService.updateBayesianNetwork(bayesianModelKey);
    }
    return this.findBayesianModelById(bayesianModelId);
  }

  /**
   * delete BaysianModel
   *
   * @param  {string} bayesianModelId
   * @returns Promise<IBayesianDBModel>
   * @author Jerry Lee
   */
  public async deleteBayesianModel(bayesianModelId: string, partyId: string): Promise<object> {
    //an entire function needs to be re-written using transaction..

    //1. validate the model existance
    const findBayesianModel: IBayesianDBModel = await this.bayesianModel.findOne({ where: { bayesianModelId } });
    if (!findBayesianModel) throw new HttpException(409, "BayesianModel doesn't exist");
    const bayesianModelKey = findBayesianModel.bayesianModelKey;

    //2. Remove anomaly monitoring targets
    const findTarget: IAnomalyMonitoringTarget[] = await this.anomalyMonitoringTargetService.findMonitoringTargetByModelKey(bayesianModelKey);
    if (!findTarget) throw new HttpException(409, "Monitoring target doesn't exist");

    const removedTargetData = {};
    for (let i = 0; i < findTarget.length; i++) {
      const targetId = findTarget[i].anomalyMonitoringTargetId;
      const removeTarget = await this.anomalyMonitoringTargetService.deleteMonitoringTarget(targetId, partyId);
      if (!removeTarget) throw new HttpException(505, 'Fail to remove monitoring target');
      removedTargetData[i] = { removeTarget };
    }

    //3. dettach rule group from Bayesian model
    const detachedRuleGroups = {};
    const resultRuleGroup = await this.ruleGroupService.getRuleGroupAttachedByModelId(bayesianModelId);

    if (resultRuleGroup) {
      for (let i = 0; i < resultRuleGroup.length; i++) {
        const ruleGroupId = resultRuleGroup[i].ruleGroupId;
        const resultUpdateModelRuleScore = await this.modelRuleScoreService.detachRuleGroup(ruleGroupId, bayesianModelId, partyId);
        detachedRuleGroups[i] = {
          ruleGroupId: ruleGroupId,
          ruleGroupName: resultRuleGroup[i].ruleGroupName,
        };
      }
    }

    //4 delete bayesianmodel
    const currentDate = new Date();
    const updatedModelData = {
      deletedAt: currentDate,
      updatedBy: partyId,
      updatedAt: currentDate,
    };
    await this.bayesianModel.update(updatedModelData, { where: { bayesianModelId } });
    const returnResult = {
      bayesianModelId: bayesianModelId,
      removedTargetData: removedTargetData,
      detachedRuleGroups: detachedRuleGroups,
    };

    //5 interface to delete the model in ML engine

    return returnResult;
  }

  /**
   * provision BaysianModel to multiple clusters by subscription
   *
   * @param  {string} customerAccountId
   * @returns Promise<IBayesianDBModel>
   * @author Jerry Lee
   */
  public async provisionBayesianModel(customerAccountId: string): Promise<object> {
    //step1. find customerAccount
    const uuid = require('uuid');
    const findCustomerAccount: ICustomerAccount = await this.customerAccount.findOne({ where: { customerAccountId, deletedAt: null } });
    if (!findCustomerAccount) throw new HttpException(400, "CustomerAccount doesn't exist");
    const customerAccountKey = findCustomerAccount.customerAccountKey;

    //step2. find available ResourceGroup
    const findResourceGroup: IResourceGroup[] = await this.resourceGroup.findAll({ where: { customerAccountKey, deletedAt: null } });
    if (findResourceGroup.length == 0) throw new HttpException(401, "Target Resource Group / Cluster for BM model provision doesn't exist");

    //step3. load ini model data
    const {
      bm: bmList,
      bmRuleGroup: bmRuleGroupList,
      ruleGroup: ruleGroupList,
      alertRule: alertRuleList,
      resolutionAction: resolutionActionList,
    } = config.initialRecord.metricOps;

    let returnMessage;

    //step4-0. Create ResolutionAction
    const resolutionActionData = [];
    for (const x of resolutionActionList) {
      const findSudoryTemplate: ISudoryTemplate = await this.sudoryTemplate.findOne({
        where: { deletedAt: null, sudoryTemplateUuid: x.sudorytemplateUuid },
      });
      const findResolutionAction: IResolutionAction = await this.resolutionAction.findOne({
        where: { deletedAt: null, resolutionActionName: x.resolutionActionName },
      });
      if (findSudoryTemplate && !findResolutionAction) {
        resolutionActionData.push({
          createdBy: 'SYSTEM',
          createdAt: new Date(),
          resolutionActionId: uuid.v1(),
          resolutionActionName: x.resolutionActionName,
          resolutionActionDescription: x.resolutionActionDescription,
          resolutionActionTemplateSteps: x.rresolutionActionTemplateSteps,
          resolutionActionType: x.resolutionActionType,
          sudoryTemplateKey: findSudoryTemplate.sudoryTemplateKey,
          customerAccountKey: customerAccountKey,
        });
      } else console.log('MetricOps - issue to create resolution action', x);
    }
    try {
      await this.resolutionAction.bulkCreate(resolutionActionData, { updateOnDuplicate: ['resolutionActionName'] });
      returnMessage = { ...returnMessage, resolutionAction: 'created' };
    } catch (error) {
      console.log('resolutionAction bulkcreate error-', error);
      returnMessage = { ...returnMessage, resolutionAction: 'failed' };
    }

    //loop in each resourceGroup
    for (let i = 0; i < findResourceGroup.length; i++) {
      const resourceGroupKey = findResourceGroup[i].resourceGroupKey;
      const resourceGroupUuid = findResourceGroup[i].resourceGroupUuid;

      //step4-1. prepare for ruleGroup insert data and bulkinsert
      const ruleGroupData = [];
      for (const x of ruleGroupList) {
        const findRuleGroup: IRuleGroup = await this.ruleGroup.findOne({
          where: { deletedAt: null, ruleGroupName: x.ruleGroupName, resourceGroupKey: resourceGroupKey },
        });
        if (!findRuleGroup) {
          ruleGroupData.push({
            ruleGroupId: uuid.v1(),
            ruleGroupName: x.ruleGroupName,
            ruleGroupDescription: x.ruleGroupDescription,
            ruleGroupStatus: 'AC',
            resourceGroupKey: resourceGroupKey,
            createdBy: 'SYSTEM',
            createdAt: new Date(),
          });
        }
      }
      try {
        await this.ruleGroup.bulkCreate(ruleGroupData);
        returnMessage = { ...returnMessage, ruleGroup: 'created' };
      } catch (error) {
        console.log('ruleGroup bulkcreate error-', error);
        returnMessage = { ...returnMessage, ruleGroup: 'failed' };
      }

      //step4-2. prepare for alertRule/ruleGroup insert data
      const alertRuleData = [];
      for (const x of alertRuleList) {
        const findRuleGroup: IRuleGroup = await this.ruleGroup.findOne({
          where: { deletedAt: null, resourceGroupKey, ruleGroupName: x.ruleGroupName },
        });
        const ruleGroupKey = findRuleGroup?.ruleGroupKey;
        const findAlertRule: IAlertRule = await this.alertRule.findOne({
          where: { deletedAt: null, resourceGroupUuid, alertRuleName: x.alertRuleName, alertRuleSeverity: x.alertRuleSeverity },
        });
        const alertRuleKey = findAlertRule?.alertRuleKey;
        const findRuleGroupAlertRule: IRuleGroupAlertRule = await this.ruleGroupAlertRule.findOne({
          where: { deletedAt: null, ruleGroupKey, alertRuleKey },
        });

        if (findRuleGroup && findAlertRule && !findRuleGroupAlertRule) {
          alertRuleData.push({
            createdBy: 'SYSTEM',
            createdAt: new Date(),
            ruleGroupAlertRuleId: uuid.v1(),
            ruleGroupAlertRuleStatus: 'AC',
            ruleGroupKey: findRuleGroup.ruleGroupKey,
            alertRuleKey: findAlertRule.alertRuleKey,
          });
        } else console.log('MetricOps - issue to register alertRule to RuleGroup', x);
      }
      try {
        await this.ruleGroupAlertRule.bulkCreate(alertRuleData);
        returnMessage = { ...returnMessage, ruleGroupAlertRule: 'created' };
      } catch (error) {
        console.log('ruleGroupAlertRule bulkcreate error-', error);
        returnMessage = { ...returnMessage, ruleGroupAlertRule: 'failed' };
      }

      //step4-3. add resolution action to rulegroup
      const ruleGroupResolutionActionData = [];
      for (const x of resolutionActionList) {
        const findRuleGroup: IRuleGroup = await this.ruleGroup.findOne({
          where: { deletedAt: null, resourceGroupKey, ruleGroupName: x.ruleGroupName },
        });
        const ruleGroupKey = findRuleGroup?.ruleGroupKey;
        const findSudoryTemplate: ISudoryTemplate = await this.sudoryTemplate.findOne({
          where: { deletedAt: null, sudoryTemplateUuid: x.sudorytemplateUuid },
        });
        const findResolutionAction: IResolutionAction = await this.resolutionAction.findOne({
          where: { deletedAt: null, resolutionActionName: x.resolutionActionName },
        });
        const resolutionActionKey = findResolutionAction?.resolutionActionKey;

        const findRuleGroupResolutionAction: IRuleGroupResolutionAction = await this.ruleGroupResolutionAction.findOne({
          where: { deletedAt: null, ruleGroupKey, resolutionActionKey },
        });

        if (findRuleGroup && findSudoryTemplate && findResolutionAction && !findRuleGroupResolutionAction) {
          ruleGroupResolutionActionData.push({
            createdBy: 'SYSTEM',
            createdAt: new Date(),
            ruleGroupResolutionActionId: uuid.v1(),
            ruleGroupKey: findRuleGroup.ruleGroupKey,
            resolutionActionKey: findResolutionAction.resolutionActionKey,
            resolutionActionDescription: findResolutionAction.resolutionActionDescription,
            sudoryTemplateArgsOption: findSudoryTemplate.sudoryTemplateArgs,
          });
        } else console.log('MetricOps - issue to create/register resolution action', x);
      }
      try {
        await this.ruleGroupResolutionAction.bulkCreate(ruleGroupResolutionActionData);
        returnMessage = { ...returnMessage, ruleGroupResolutionAction: 'created' };
      } catch (error) {
        console.log('ruleGroupAlertRule bulkcreate error-', error);
        returnMessage = { ...returnMessage, ruleGroupResolutionAction: 'failed' };
      }

      //step4-4. create bm
      const bmData = [];
      for (const x of bmList) {
        const findBm: IBayesianModel = await this.bayesianModel.findOne({
          where: { deletedAt: null, bayesianModelName: x.bayesianModelName, resourceGroupKey },
        });
        if (!findBm) {
          bmData.push({
            bayesianModelId: uuid.v1(),
            bayesianModelName: x.bayesianModelName,
            bayesianModelDescription: x.bayesianModelDescription,
            bayesianModelStatus: 'AC',
            bayesianModelScoreCard: x.bayesianModelScoreCard,
            customerAccountKey: customerAccountKey,
            resourceGroupKey: resourceGroupKey,
            bayesianModelResourceType: x.bayesianModelResourceType,
            createdBy: 'SYSTEM',
            createdAt: new Date(),
            standardModelId: x.standardModelId,
          });
        }
      }
      try {
        await this.bayesianModel.bulkCreate(bmData);
        returnMessage = { ...returnMessage, bayesianModel: 'created' };
      } catch (error) {
        console.log('BayesianModel bulkcreate error-', error);
        returnMessage = { ...returnMessage, bayesianModel: 'failed' };
      }

      //step4-6. add rulegroup to bm
      const bmRuleGroup = [];
      for (const x of bmRuleGroupList) {
        const findRuleGroup: IRuleGroup = await this.ruleGroup.findOne({
          where: { deletedAt: null, resourceGroupKey, ruleGroupName: x.ruleGroupName },
        });
        const ruleGroupKey = findRuleGroup?.ruleGroupKey;
        const findBm: IBayesianModel = await this.bayesianModel.findOne({
          where: { deletedAt: null, resourceGroupKey, bayesianModelName: x.bayesianModelName },
        });
        const bayesianModelKey = findBm?.bayesianModelKey;
        const findModelRuleScore: IModelRuleScore = await this.modelRuleScore.findOne({
          where: { deletedAt: null, ruleGroupKey, bayesianModelKey },
        });

        if (findRuleGroup && findBm && !findModelRuleScore) {
          bmRuleGroup.push({
            createdBy: 'SYSTEM',
            createdAt: new Date(),
            modelRuleScoreId: uuid.v1(),
            ruleGroupAlertRuleStatus: 'AC',
            ruleGroupKey: findRuleGroup.ruleGroupKey,
            bayesianModelKey: findBm.bayesianModelKey,
            scoreCard: x.scoreCard,
          });
        } else console.log('MetricOps - issue to register ruleGroup to BayesianModel', x);
      }
      try {
        await this.modelRuleScore.bulkCreate(bmRuleGroup);
        returnMessage = { ...returnMessage, modelRuleScore: 'created' };
      } catch (error) {
        console.log('modelRuleScore bulkcreate error-', error);
        returnMessage = { ...returnMessage, modelRuleScore: 'failed' };
      }
    } //end of resourcGroup loop

    return returnMessage;
  }

  /**
   * provision BaysianModel to a new cluster
   *
   * @param  {string} resourceGroupId
   * @returns Promise<IBayesianDBModel>
   * @author Jerry Lee
   */
  public async provisionBayesianModelforCluster(resourceGroupId: string): Promise<object> {
    const uuid = require('uuid');
    //step1. find ResourceGroup
    console.log('step1------');
    const findResourceGroup: IResourceGroup = await this.resourceGroup.findOne({ where: { resourceGroupId, deletedAt: null } });
    if (!findResourceGroup) throw new HttpException(401, 'Target Resource Group / Cluster for BM model provision does not exist');
    const customerAccountKey = findResourceGroup.customerAccountKey;

    //step2. load ini model data
    console.log('step2------');
    const {
      bm: bmList,
      bmRuleGroup: bmRuleGroupList,
      ruleGroup: ruleGroupList,
      alertRule: alertRuleList,
      resolutionAction: resolutionActionList,
    } = config.initialRecord.metricOps;

    let returnMessage;
    const resourceGroupKey = findResourceGroup.resourceGroupKey;
    const resourceGroupUuid = findResourceGroup.resourceGroupUuid;

    //step3-1. create resolution action if there is no action
    console.log('step31------');
    const resolutionActionData = [];
    for (const x of resolutionActionList) {
      const findSudoryTemplate: ISudoryTemplate = await this.sudoryTemplate.findOne({
        where: { deletedAt: null, sudoryTemplateUuid: x.sudorytemplateUuid },
      });
      const findResolutionAction: IResolutionAction = await this.resolutionAction.findOne({
        where: { deletedAt: null, resolutionActionName: x.resolutionActionName },
      });
      //if there is resolutuonaction with the same name, skip this.
      if (findSudoryTemplate && !findResolutionAction) {
        resolutionActionData.push({
          createdBy: 'SYSTEM',
          createdAt: new Date(),
          resolutionActionId: uuid.v1(),
          resolutionActionName: x.resolutionActionName,
          resolutionActionDescription: x.resolutionActionDescription,
          resolutionActionTemplateSteps: x.rresolutionActionTemplateSteps,
          resolutionActionType: x.resolutionActionType,
          sudoryTemplateKey: findSudoryTemplate.sudoryTemplateKey,
          customerAccountKey: customerAccountKey,
        });
      } else console.log('MetricOps - issue to create resolution action or existing resolution action', x);
    }
    try {
      await this.resolutionAction.bulkCreate(resolutionActionData);
      returnMessage = { ...returnMessage, resolutionAction: 'created' };
    } catch (error) {
      console.log('ruleGroupAlertRule bulkcreate error-', error);
      returnMessage = { ...returnMessage, resolutionAction: 'failed' };
    }

    //step3-2. prepare for ruleGroup insert data and bulkinsert
    console.log('step32------');
    const ruleGroupData = [];
    for (const x of ruleGroupList) {
      const findRuleGroup: IRuleGroup = await this.ruleGroup.findOne({
        where: { deletedAt: null, ruleGroupName: x.ruleGroupName, resourceGroupKey: resourceGroupKey },
      });
      if (!findRuleGroup) {
        ruleGroupData.push({
          ruleGroupId: uuid.v1(),
          ruleGroupName: x.ruleGroupName,
          ruleGroupDescription: x.ruleGroupDescription,
          ruleGroupStatus: 'AC',
          resourceGroupKey: resourceGroupKey,
          createdBy: 'SYSTEM',
          createdAt: new Date(),
        });
      } else console.log('MetricOps - issue to register ruleGroup or existing one', x);
    }
    try {
      await this.ruleGroup.bulkCreate(ruleGroupData);
      console.log('ruleGroup bulkcreate ok-', JSON.stringify(ruleGroupData));
      returnMessage = { ...returnMessage, ruleGroup: 'created' };
    } catch (error) {
      console.log('ruleGroup bulkcreate error-', error);
      returnMessage = { ...returnMessage, ruleGroup: 'failed' };
    }

    //step3-3. prepare for alertRule/ruleGroup insert data
    console.log('step33------');
    const alertRuleData = [];
    for (const x of alertRuleList) {
      const findRuleGroup: IRuleGroup = await this.ruleGroup.findOne({
        where: { deletedAt: null, resourceGroupKey, ruleGroupName: x.ruleGroupName },
      });
      const ruleGroupKey = findRuleGroup?.ruleGroupKey;
      const findAlertRule: IAlertRule = await this.alertRule.findOne({
        where: { deletedAt: null, resourceGroupUuid, alertRuleName: x.alertRuleName, alertRuleSeverity: x.alertRuleSeverity },
      });
      const alertRuleKey = findAlertRule?.alertRuleKey;

      const findRuleGroupAlertRule: IRuleGroupAlertRule = await this.ruleGroupAlertRule.findOne({
        where: { deletedAt: null, ruleGroupKey, alertRuleKey },
      });

      if (findRuleGroup && findAlertRule && !findRuleGroupAlertRule) {
        alertRuleData.push({
          createdBy: 'SYSTEM',
          createdAt: new Date(),
          ruleGroupAlertRuleId: uuid.v1(),
          ruleGroupAlertRuleStatus: 'AC',
          ruleGroupKey: findRuleGroup.ruleGroupKey,
          alertRuleKey: findAlertRule.alertRuleKey,
        });
      } else console.log('MetricOps - issue to register alertRule to RuleGroup or existing one', x);
    }
    try {
      await this.ruleGroupAlertRule.bulkCreate(alertRuleData);
      console.log('alertRuleData bulkcreate ok-', JSON.stringify(alertRuleData));
      returnMessage = { ...returnMessage, ruleGroupAlertRule: 'created' };
    } catch (error) {
      console.log('ruleGroupAlertRule bulkcreate error-', error);
      returnMessage = { ...returnMessage, ruleGroupAlertRule: 'failed' };
    }

    //step3-4. add resolution action to rulegroup
    console.log('step34------');
    const ruleGroupResolutionActionData = [];
    for (const x of resolutionActionList) {
      const findRuleGroup: IRuleGroup = await this.ruleGroup.findOne({
        where: { deletedAt: null, resourceGroupKey, ruleGroupName: x.ruleGroupName },
      });
      const ruleGroupKey = findRuleGroup?.ruleGroupKey;
      const findSudoryTemplate: ISudoryTemplate = await this.sudoryTemplate.findOne({
        where: { deletedAt: null, sudoryTemplateUuid: x.sudorytemplateUuid },
      });
      const findResolutionAction: IResolutionAction = await this.resolutionAction.findOne({
        where: { deletedAt: null, resolutionActionName: x.resolutionActionName },
      });
      const resolutionActionKey = findResolutionAction?.resolutionActionKey;

      const findRuleGroupResolutionAction: IRuleGroupResolutionAction = await this.ruleGroupResolutionAction.findOne({
        where: { deletedAt: null, ruleGroupKey, resolutionActionKey },
      });

      if (findRuleGroup && findSudoryTemplate && findResolutionAction && !findRuleGroupResolutionAction) {
        ruleGroupResolutionActionData.push({
          createdBy: 'SYSTEM',
          createdAt: new Date(),
          ruleGroupResolutionActionId: uuid.v1(),
          ruleGroupKey: findRuleGroup.ruleGroupKey,
          resolutionActionKey: findResolutionAction.resolutionActionKey,
          resolutionActionDescription: findResolutionAction.resolutionActionDescription,
          sudoryTemplateArgsOption: findSudoryTemplate.sudoryTemplateArgs,
        });
      } else console.log('MetricOps - issue to create/register resolution action or existing one', x);
    }
    try {
      await this.ruleGroupResolutionAction.bulkCreate(ruleGroupResolutionActionData);
      console.log('ruleGroupResolutionActionData bulkcreate ok-', JSON.stringify(ruleGroupResolutionActionData));

      returnMessage = { ...returnMessage, ruleGroupResolutionAction: 'created' };
    } catch (error) {
      console.log('ruleGroupAlertRule bulkcreate error-', error);
      returnMessage = { ...returnMessage, ruleGroupResolutionAction: 'failed' };
    }

    //step3-5. create bm
    console.log('step35------');
    const bmData = [];
    for (const x of bmList) {
      const findBm: IBayesianModel = await this.bayesianModel.findOne({
        where: { deletedAt: null, bayesianModelName: x.bayesianModelName, resourceGroupKey },
      });
      if (!findBm) {
        bmData.push({
          bayesianModelId: uuid.v1(),
          bayesianModelName: x.bayesianModelName,
          bayesianModelDescription: x.bayesianModelDescription,
          bayesianModelStatus: 'AC',
          bayesianModelScoreCard: x.bayesianModelScoreCard,
          customerAccountKey: customerAccountKey,
          resourceGroupKey: resourceGroupKey,
          bayesianModelResourceType: x.bayesianModelResourceType,
          createdBy: 'SYSTEM',
          createdAt: new Date(),
          standardModelId: x.standardModelId,
        });
      } else console.log('MetricOps - issue to create BayesianModel or existing one', x);
    }
    try {
      await this.bayesianModel.bulkCreate(bmData);
      returnMessage = { ...returnMessage, bayesianModel: 'created' };
      console.log('bmData bulkcreate ok-', JSON.stringify(bmData));
    } catch (error) {
      console.log('BayesianModel bulkcreate error-', error);
      returnMessage = { ...returnMessage, bayesianModel: 'failed' };
    }

    //step3-6. add rulegroup to bm
    console.log('step36------');
    const bmRuleGroup = [];
    for (const x of bmRuleGroupList) {
      const findRuleGroup: IRuleGroup = await this.ruleGroup.findOne({
        where: { deletedAt: null, resourceGroupKey, ruleGroupName: x.ruleGroupName },
      });
      const ruleGroupKey = findRuleGroup?.ruleGroupKey;
      const findBm: IBayesianModel = await this.bayesianModel.findOne({
        where: { deletedAt: null, resourceGroupKey, bayesianModelName: x.bayesianModelName },
      });
      console.log('step36------bm seaerch condition', resourceGroupKey, x.bayesianModelName);
      console.log('step36------bm', findBm);
      const bayesianModelKey = findBm.bayesianModelKey;

      const findModelRuleScore: IModelRuleScore = await this.modelRuleScore.findOne({
        where: { deletedAt: null, ruleGroupKey, bayesianModelKey },
      });

      if (findRuleGroup && findBm && !findModelRuleScore) {
        bmRuleGroup.push({
          createdBy: 'SYSTEM',
          createdAt: new Date(),
          modelRuleScoreId: uuid.v1(),
          ruleGroupAlertRuleStatus: 'AC',
          ruleGroupKey: findRuleGroup.ruleGroupKey,
          bayesianModelKey: bayesianModelKey,
          scoreCard: x.scoreCard,
        });
      } else console.log('MetricOps - issue to register ruleGroup to BayesianModel or existing one', x);
    }
    try {
      await this.modelRuleScore.bulkCreate(bmRuleGroup);
      console.log('bmRuleGroup bulkcreate ok-', JSON.stringify(bmRuleGroup));

      returnMessage = { ...returnMessage, modelRuleScore: 'created' };
    } catch (error) {
      console.log('modelRuleScore bulkcreate error-', error);
      returnMessage = { ...returnMessage, modelRuleScore: 'failed' };
    }

    return returnMessage;
  }

  /**
   * De-provision BaysianModel by unsubscription
   *
   * @param  {string} customerAccountId
   * @returns Promise<IBayesianDBModel>
   * @author Jerry Lee
   */
  public async deprovisionBayesianModel(customerAccountId: string): Promise<object> {
    const findCustomerAccount: ICustomerAccount = await this.customerAccount.findOne({ where: { customerAccountId, deletedAt: null } });
    if (!findCustomerAccount) throw new HttpException(400, "CustomerAccount doesn't exist");
    const customerAccountKey = findCustomerAccount.customerAccountKey;

    const findResourceGroup: IResourceGroup[] = await this.resourceGroup.findAll({ where: { customerAccountKey, deletedAt: null } });
    if (findResourceGroup.length == 0) throw new HttpException(401, "Target Resource Group / Cluster for BM model provision doesn't exist");

    for (let i = 0; i < findResourceGroup.length; i++) {
      const resourceGroupId = findResourceGroup[i].resourceGroupId;
      await this.deprovisionBayesianModelforCluster(resourceGroupId);
    }

    return { message: 'deprovisioned successfully' };
  }
  /**
   * De-provision BaysianModel to a new cluster
   *
   * @param  {string} resourceGroupId
   * @returns Promise<IBayesianDBModel>
   * @author Jerry Lee
   */
  public async deprovisionBayesianModelforCluster(resourceGroupId: string): Promise<object> {
    const findResourceGroup: IResourceGroup = await this.resourceGroup.findOne({ where: { resourceGroupId, deletedAt: null } });
    if (!findResourceGroup) throw new HttpException(401, 'Target Resource Group / Cluster for BM model provision does not exist');
    const resourceGroupKey = findResourceGroup.resourceGroupKey;
    let ruleGroupExsitance = true;
    const findRuleGroup: IRuleGroup[] = await this.ruleGroup.findAll({ where: { resourceGroupKey, deletedAt: null } });
    if (findRuleGroup.length === 0) ruleGroupExsitance = false;
    let returnMessage;
    try {
      //BayesianModel
      await DB.sequelize.transaction(async t => {
        const updateBayesianModel = await this.bayesianModel.update(
          { deletedAt: new Date(), bayesianModelStatus: 'CA' },
          { where: { deletedAt: null, resourceGroupKey }, transaction: t },
        );
        returnMessage = { ...returnMessage, bayesianModel: `deleted ${updateBayesianModel}` };

        if (ruleGroupExsitance) {
          for (let i = 0; i < findRuleGroup.length; i++) {
            //ruleGroupResolutionAction
            await this.ruleGroupResolutionAction.update(
              { deletedAt: new Date() },
              { where: { deletedAt: null, ruleGroupKey: findRuleGroup[i].ruleGroupKey }, transaction: t },
            );
            //ruleGroupAlertRule
            await this.ruleGroupAlertRule.update(
              { deletedAt: new Date(), ruleGroupAlertRuleStatus: 'CA' },
              { where: { deletedAt: null, ruleGroupKey: findRuleGroup[i].ruleGroupKey }, transaction: t },
            );
            //ModelRuleScore
            await this.modelRuleScore.update(
              { deletedAt: new Date() },
              { where: { deletedAt: null, ruleGroupKey: findRuleGroup[i].ruleGroupKey }, transaction: t },
            );
            //RuleGroup
            await this.ruleGroup.update(
              { deletedAt: new Date() },
              { where: { deletedAt: null, ruleGroupKey: findRuleGroup[i].ruleGroupKey }, transaction: t },
            );
          }
          returnMessage = { ...returnMessage, rueGroup: `deleted ${updateBayesianModel}` };
        }
      });
    } catch (error) {
      console.log('#MetricOps - error to deprovison metricOps components', error);
      throw new HttpException(500, 'fail to de-porvison MetricOps components');
    }
    return returnMessage;
  }
}

export default BayesianModelServices;
