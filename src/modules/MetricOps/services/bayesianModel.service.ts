import { IBayesianModel, IBayesianDBModel, IBayesianJoinDBModel } from '@/common/interfaces/bayesianModel.interface';
import { IAnomalyMonitoringTarget } from '@/common/interfaces/monitoringTarget.interface';
import { IResourceGroup } from '@/common/interfaces/resourceGroup.interface';
import DB from '@/database';

import { CreateBayesianModelDto, UpdateBayesianModelDto } from '../dtos/bayesianModel.dto';
import { isEmpty } from '@/common/utils/util';
import { HttpException } from '@/common/exceptions/HttpException';
import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';
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

class BayesianModelServices {
  public bayesianModel = DB.BayesianModel;
  public modelRuleScore = DB.ModelRuleScore;
  public subscribedProduct = DB.SubscribedProduct;
  public monitoringTarget = DB.AnomalyMonitoringTarget;
  public resourceGroup = DB.ResourceGroup;
  public ruleGroupAlertRule = DB.RuleGroupAlertRule;
  public customerAccountService = new CustomerAccountService();
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
    const { bayesianModelName, bayesianModelDescription, bayesianModelResourceType, bayesianModelClusterId } = bayesianModelData;

    const resultResourceGroup: IResourceGroup = await this.resourceGroup.findOne({ where: { resourceGroupId: bayesianModelClusterId } });
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
      bayesianModelClusterId,
      version,
    };

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
    const { bayesianModelName, bayesianModelDescription, bayesianModelResourceType, bayesianModelScoreCard, bayesianModelClusterId, version } =
      bayesianModelData;
    let resourceGroupKey;
    if (bayesianModelClusterId) {
      const resultResourceGroup: IResourceGroup = await this.resourceGroup.findOne({ where: { resourceGroupId: bayesianModelClusterId } });
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
      const removeTarget = await this.anomalyMonitoringTargetService.removeMonitoringTarget(targetId, partyId);
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
}

export default BayesianModelServices;
