import { HttpException } from '@/common/exceptions/HttpException';
import { IRuleGroup } from '@/common/interfaces/ruleGroup.interface';
import { isEmpty } from '@/common/utils/util';
import DB from '@/database';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import { CreateRuleGroupDto, UpdateRuleGroupDto } from '../dtos/ruleGroup.dto';
import { BayesianModelTable } from '../models/bayesianModel.model';
import { ModelRuleScoreTable } from '../models/modelRuleScore.model';

const { Op } = require('sequelize');
import pluck from 'lodash/map';
import { ResourceGroupModel } from '@/modules/Resources/models/resourceGroup.model';
import { IModelRuleScore } from '@/common/interfaces/modelRuleScore.interface';
class RuleGroupService {
  public tableIdService = new TableIdService();
  public ruleGroup = DB.RuleGroup;
  public modelRuleScore = DB.ModelRuleScore;
  public bayesianModel = DB.BayesianModel;
  public resourceGroup = DB.ResourceGroup;
  public ruleGroupAlertRule = DB.RuleGroupAlertRule;
  public ruleGroupResolutionAction = DB.RuleGroupResolutionAction;

  /*  this is a function to get RuleGroup for new group add. 

*/
  public async getRuleGroupByModelId(bayesianModelId: string): Promise<IRuleGroup[]> {
    const bayesianModelDetail = await this.bayesianModel.findOne({ where: { bayesianModelId } });
    const bayesianModelRuleGroup = await this.modelRuleScore.findAll({
      where: { deletedAt: null, bayesianModelKey: bayesianModelDetail.bayesianModelKey },
    });
    const ruleGroupKeys = pluck(bayesianModelRuleGroup, 'ruleGroupKey');
    const allRuleGroup: IRuleGroup[] = await this.ruleGroup.findAll({
      where: { deletedAt: null, ruleGroupKey: { [Op.notIn]: ruleGroupKeys }, resourceGroupKey: bayesianModelDetail.resourceGroupKey },
      include: [{ model: ModelRuleScoreTable, attributes: ['bayesianModelKey'], include: [{ model: BayesianModelTable, required: false }] }],
      attributes: { exclude: ['deletedAt', 'updatedBy', 'createdBy'] },
    });
    return allRuleGroup;
  }

  public async getRuleGroupAttachedByModelId(bayesianModelId: string): Promise<IRuleGroup[]> {
    const bayesianModelDetail = await this.bayesianModel.findOne({ where: { bayesianModelId } });
    const bayesianModelRuleGroup = await this.modelRuleScore.findAll({
      where: { deletedAt: null, bayesianModelKey: bayesianModelDetail.bayesianModelKey },
    });
    const resourceGroupKey = bayesianModelDetail.resourceGroupKey;
    //const ruleGroupKeys = pluck(bayesianModelRuleGroup, 'ruleGroupKey');
    const ruleGroupKeys = bayesianModelRuleGroup.map(x => x.ruleGroupKey);
    const allRuleGroup: IRuleGroup[] = await this.ruleGroup.findAll({
      where: { deletedAt: null, ruleGroupKey: ruleGroupKeys, resourceGroupKey: resourceGroupKey },
    });

    return allRuleGroup;
  }

  public async getRuleGroup(customerAccountKey: number): Promise<IRuleGroup[]> {
    const allRuleGroup: IRuleGroup[] = await this.ruleGroup.findAll({
      where: { deletedAt: null },
      include: [
        {
          model: ModelRuleScoreTable,
          required: false,
          where: { deletedAt: null },
          attributes: ['bayesianModelKey'],
          include: [
            {
              model: BayesianModelTable,
              required: false,
            },
          ],
        },
        {
          model: ResourceGroupModel,
          required: true,
          where: { deletedAt: null, customerAccountKey: customerAccountKey },
        },
      ],
    });

    return allRuleGroup;
  }

  public async getRuleGroupById(ruleGroupId: string): Promise<IRuleGroup> {
    const ruleGroup: IRuleGroup = await this.ruleGroup.findOne({
      where: { ruleGroupId: ruleGroupId, deletedAt: null },
      include: [
        {
          model: ResourceGroupModel,
        },
        {
          model: ModelRuleScoreTable,
          attributes: ['bayesianModelKey'],
          include: [
            {
              model: BayesianModelTable,
              required: false,
            },
          ],
        },
      ],
      attributes: { exclude: ['deletedAt', 'updatedBy', 'createdBy'] },
    });
    return ruleGroup;
  }

  public async findRuleGroupById(ruleGroupId: string): Promise<IRuleGroup> {
    if (isEmpty(ruleGroupId)) throw new HttpException(400, 'Not a valid Rule Group ID');

    const findRuleGroup: IRuleGroup = await this.ruleGroup.findOne({
      where: { ruleGroupId, deletedAt: null },
    });
    if (!findRuleGroup) throw new HttpException(409, 'Rule Group Not found');

    return findRuleGroup;
  }

  public async updateRuleGroup(ruleGroupId: string, ruleGroupData: UpdateRuleGroupDto, partyId: string): Promise<IRuleGroup> {
    if (isEmpty(ruleGroupData)) throw new HttpException(400, 'RuleGroup Data cannot be blank');
    const findRuleGroupData: IRuleGroup = await this.ruleGroup.findOne({ where: { ruleGroupId } });
    if (!findRuleGroupData) throw new HttpException(409, "RuleGroup doesn't exist");
    let resourceGroup;
    if (ruleGroupData?.ruleGroupClusterId) {
      resourceGroup = await this.resourceGroup.findOne({ where: { resourceGroupId: ruleGroupData.ruleGroupClusterId } });
      if (isEmpty(resourceGroup)) throw new HttpException(400, 'ResouceGroup/cluster is not available');
    }

    const updatedRuleGroupData = {
      ...ruleGroupData,
      resourceGroupKey: resourceGroup.resourceGroupKey,
      updatedBy: partyId,
      updatedAt: new Date(),
    };
    await this.ruleGroup.update(updatedRuleGroupData, { where: { ruleGroupId: ruleGroupId } });

    return await this.findRuleGroupById(ruleGroupId);
  }

  public async createRuleGroup(ruleGroupData: CreateRuleGroupDto, partyId: string): Promise<any> {
    if (isEmpty(ruleGroupData)) throw new HttpException(400, 'Create RuleGroup cannot be blank');
    const tableIdName = 'RuleGroup';
    const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdName);
    const ruleGroupId: string = responseTableIdData.tableIdFinalIssued;
    const resourceGroup = await this.resourceGroup.findOne({ where: { resourceGroupId: ruleGroupData.ruleGroupClusterId } });
    if (isEmpty(resourceGroup)) throw new HttpException(400, 'ResouceGroup/cluster is not available');
    const currentDate = new Date();
    const { ruleGroupDescription, ruleGroupName, ruleGroupStatus } = ruleGroupData;
    const newRuleGroup = {
      ruleGroupName,
      ruleGroupDescription,
      ruleGroupStatus,
      ruleGroupId,
      resourceGroupKey: resourceGroup.resourceGroupKey,
      createdAt: currentDate,
      createdBy: partyId,
    };
    await this.ruleGroup.create(newRuleGroup);
    const newRuleGroupData: IRuleGroup = await this.getRuleGroupById(ruleGroupId);
    return newRuleGroupData;
  }
  public async deleteRuleGroup(ruleGroupId: string): Promise<Object> {
    //step 1. find the requested roule group
    const getRuleGroup: IRuleGroup = await this.ruleGroup.findOne({ where: { deletedAt: null, ruleGroupId: ruleGroupId } });
    if (!getRuleGroup) throw new HttpException(404, `Can't find rule group - ${ruleGroupId}`);
    const ruleGroupKey = getRuleGroup.ruleGroupKey;
    //step 2. check whether the rule group belongs to any Bayesian model
    const isActiveRuleGroupforModel: IModelRuleScore[] = await this.modelRuleScore.findAll({
      where: { deletedAt: null, ruleGroupKey: ruleGroupKey },
    });
    console.log('isActiveRuleGroupforModel length', isActiveRuleGroupforModel.length);
    if (isActiveRuleGroupforModel.length > 0)
      throw new HttpException(409, `This rule group - ${ruleGroupId} is associated with the Bayesian Model. Can't delete.`);
    //step 3. Transactions - update RuleGroupResolutionAction, RuleGroupAlertRule and RuleGroup to delete
    try {
      return await DB.sequelize.transaction(async t => {
        let returnResult = {};
        const deleteData1 = { deletedAt: new Date(), status: 'CA' };
        const deleteData2 = { deletedAt: new Date() };

        const updateRuleGroupResolutionAction = await this.ruleGroupResolutionAction.update(deleteData2, {
          where: { ruleGroupKey: ruleGroupKey },
          transaction: t,
        });
        const updateRuleGroupAlertRule = await this.ruleGroupAlertRule.update(deleteData1, {
          where: { ruleGroupKey: ruleGroupKey },
          transaction: t,
        });
        const updateRuleGroup = await this.ruleGroup.update(deleteData1, {
          where: { ruleGroupKey: ruleGroupKey },
          transaction: t,
        });

        returnResult = { ...returnResult, deleted_RuleGroupResolutionAction: updateRuleGroupResolutionAction };
        returnResult = { ...returnResult, deleted_RuleGroupAlertRule: updateRuleGroupAlertRule };
        returnResult = { ...returnResult, deleted_RuleGroup: updateRuleGroup };
        console.log('Rule Group deleted - ', ruleGroupId);

        return returnResult;
      });
    } catch (err) {
      console.log(err);
      throw new HttpException(500, 'Unknown error while deleting rule group');
    }
  }
}

export default RuleGroupService;
