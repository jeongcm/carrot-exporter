import { HttpException } from '@/common/exceptions/HttpException';
import { IRuleGroup } from '@/common/interfaces/ruleGroup.interface';
import { isEmpty } from '@/common/utils/util';
import DB from '@/database';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import { RuleGroupDto } from '../dtos/ruleGroup.dto';
const { Op } = require('sequelize');
class RuleGroupService {
  public tableIdService = new TableIdService();
  public ruleGroup = DB.RuleGroup;

  public async getRuleGroup(): Promise<IRuleGroup[]> {
    const allRuleGroup: IRuleGroup[] = await this.ruleGroup.findAll({
      where: { deletedAt: null },
      attributes: { exclude: ['deletedAt', 'updatedBy', 'createdBy'] },
    });
    return allRuleGroup;
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
      }else{
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
      attributes: { exclude: ['ruleGroupId', 'deletedAt', 'updatedBy', 'createdBy'] },
    });
    if (!findRuleGroup) throw new HttpException(409, 'Rule Group Not found');

    return findRuleGroup;
  }
  
  public async updateRuleGroup(
    ruleGroupId: string,
    ruleGroupData: RuleGroupDto,
    partyId: string,
  ): Promise<IRuleGroup> {
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

  public async createRuleGroup(ruleGroupData: RuleGroupDto, partyId: string): Promise<IRuleGroup> {
    if (isEmpty(ruleGroupData)) throw new HttpException(400, 'Create RuleGroup cannot be blank');
    const tableIdName: string = 'RuleGroup';
    const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdName);
    const ruleGroupId: string = responseTableIdData.tableIdFinalIssued;

    const currentDate = new Date();
    const newRuleGroup = {
      ...ruleGroupData,
      ruleGroupId,
      createdAt: currentDate,
      createdBy: partyId,
    };
    const newRuleGroupData: IRuleGroup = await this.ruleGroup.create(newRuleGroup);
    return newRuleGroupData;
  }
}

export default RuleGroupService;
