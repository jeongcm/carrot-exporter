import { HttpException } from '@/common/exceptions/HttpException';
import { IRuleGroup } from '@/common/interfaces/ruleGroup.interface';
import { isEmpty } from '@/common/utils/util';
import DB from '@/database';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import { CreateRuleGroupDto, UpdateRuleGroupDto } from '../dtos/ruleGroup.dto';
import { BayesianModelTable } from '../models/bayesianModel.model';
import { ModelRuleScoreTable } from '../models/modelRuleScore.model';
import { SudoryTemplateModel } from '../models/sudoryTemplate.model';
const { Op } = require('sequelize');
import pluck from 'lodash/map';
import couponModel from '@/modules/Billing/models/coupon.model';
import resourceGroupModel, { ResourceGroupModel } from '@/modules/Resources/models/resourceGroup.model';
class RuleGroupService {
  public tableIdService = new TableIdService();
  public ruleGroup = DB.RuleGroup;
  public modelRuleScore = DB.ModelRuleScore;
  public bayesianModel = DB.BayesianModel;
  public resourceGroup = DB.ResourceGroup;

  public async getRuleGroupByModelId(bayesianModelId?: string): Promise<IRuleGroup[]> {
    if (bayesianModelId) {
      const bayesianModelDetail = await this.bayesianModel.findOne({ where: { bayesianModelId } })
      const bayesianModelRuleGroup = await this.modelRuleScore.findAll({ where: { deletedAt: null, bayesianModelKey: bayesianModelDetail.bayesianModelKey } })
      const ruleGroupKeys = pluck(bayesianModelRuleGroup, 'ruleGroupKey');
      const allRuleGroup: IRuleGroup[] = await this.ruleGroup.findAll({
        where: { deletedAt: null, ruleGroupKey: { [Op.notIn]: ruleGroupKeys }, },
        include: [{ model: ModelRuleScoreTable, attributes: ["bayesianModelKey"], include: [{ model: BayesianModelTable, required: false }] }],
        attributes: { exclude: ['deletedAt', 'updatedBy', 'createdBy'] },
      });
      return allRuleGroup;
    } else {
      return await this.getRuleGroup()
    }

  }

  public async getRuleGroup(): Promise<IRuleGroup[]> {
    const allRuleGroup: IRuleGroup[] = await this.ruleGroup.findAll({
      where: { deletedAt: null },
      include: [
        {
          model: ModelRuleScoreTable,
          attributes: ["bayesianModelKey"],
          include: [
            {
              model: BayesianModelTable,
              required: false
            }
          ]
        }, {
          model: ResourceGroupModel
        }
      ],
      attributes: { exclude: ['deletedAt', 'updatedBy', 'createdBy'] },
    });

    return allRuleGroup;
  }

  public async getRuleGroupById(ruleGroupId: string): Promise<IRuleGroup> {
    const ruleGroup: IRuleGroup = await this.ruleGroup.findOne({
      where: { ruleGroupId: ruleGroupId, deletedAt: null },
      include: [{
        model: ResourceGroupModel
      },
      {
        model: ModelRuleScoreTable,
        attributes: ["bayesianModelKey"],
        include: [
          {
            model: BayesianModelTable,
            required: false
          }
        ]
      }
      ],
      attributes: { exclude: ['deletedAt', 'updatedBy', 'createdBy'] },
    });
    return ruleGroup;
  }

  public async deleteRuleGroup(ruleGroupId: string) {
    try {
      const deleteRuleGroupData = {
        deletedAt: new Date(),
      };

      const result = await this.ruleGroup.update(deleteRuleGroupData, {
        where: {
          ruleGroupId: ruleGroupId,
          deletedAt: {
            [Op.eq]: null,
          },
        },
      });
      if (result[0] == 1) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  public async findRuleGroupById(ruleGroupId: string): Promise<IRuleGroup> {
    if (isEmpty(ruleGroupId)) throw new HttpException(400, 'Not a valid Rule Group ID');

    const findRuleGroup: IRuleGroup = await this.ruleGroup.findOne({
      where: { ruleGroupId, deletedAt: null },
      attributes: { exclude: ['deletedAt', 'updatedBy', 'createdBy'] },
    });
    if (!findRuleGroup) throw new HttpException(409, 'Rule Group Not found');

    return findRuleGroup;
  }

  public async updateRuleGroup(ruleGroupId: string, ruleGroupData: UpdateRuleGroupDto, partyId: string): Promise<IRuleGroup> {
    if (isEmpty(ruleGroupData)) throw new HttpException(400, 'RuleGroup Data cannot be blank');
    const findRuleGroupData: IRuleGroup = await this.ruleGroup.findOne({ where: { ruleGroupId } });
    if (!findRuleGroupData) throw new HttpException(409, "RuleGroup doesn't exist");

    const updatedRuleGroupData = {
      ...ruleGroupData,
      updatedBy: partyId,
      updatedAt: new Date(),
    };
    await this.ruleGroup.update(updatedRuleGroupData, { where: { ruleGroupId: ruleGroupId } });

    return await this.findRuleGroupById(ruleGroupId);
  }

  public async createRuleGroup(ruleGroupData: CreateRuleGroupDto, partyId: string): Promise<any> {
    if (isEmpty(ruleGroupData)) throw new HttpException(400, 'Create RuleGroup cannot be blank');
    const tableIdName: string = 'RuleGroup';
    const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdName);
    const ruleGroupId: string = responseTableIdData.tableIdFinalIssued;
    console.log("ruleGroupData", ruleGroupData)
    const resourceGroup = await this.resourceGroup.findOne({ where: { resourceGroupId: ruleGroupData.ruleGroupClusterId } })
    console.log("resourceGroup", resourceGroup)
    if (isEmpty(resourceGroup)) throw new HttpException(400, 'ResouceGroup/cluster is not available');
    const currentDate = new Date();
    const {ruleGroupDescription, ruleGroupName, ruleGroupStatus} = ruleGroupData
    const newRuleGroup = {
      ruleGroupName,
      ruleGroupDescription,
      ruleGroupStatus,
      ruleGroupId,
      resourceGroupKey: resourceGroup.resourceGroupKey,
      createdAt: currentDate,
      createdBy: partyId,
    };
    const newRuleGroupData: IRuleGroup = await this.ruleGroup.create(newRuleGroup);
    return newRuleGroup;
  }
}

export default RuleGroupService;
