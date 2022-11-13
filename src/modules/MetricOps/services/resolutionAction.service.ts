import DB from '@/database';
import { CreateResolutionActionDto, UpdateResolutionActionDto } from '../dtos/resolutionAction.dto';
import { isEmpty } from '@/common/utils/util';
import { HttpException } from '@/common/exceptions/HttpException';
import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import { ResolutionActionModel } from '../models/resolutionAction.model';
import { IResolutionAction } from '@/common/interfaces/resolutionAction.interface';
import { SudoryTemplateModel } from '../models/sudoryTemplate.model';
const { Op } = require('sequelize');
import _ from 'lodash';
import { IRuleGroupResolutionAction } from '@/common/interfaces/ruleGroupResolutionAction.interface';
class ResolutionActionService {
  public resolutionAction = DB.ResolutionAction;
  public sudoryTemplate = DB.SudoryTemplate;
  public ruleGroup = DB.RuleGroup;
  public ruleGroupResolutionAction = DB.RuleGroupResolutionAction;
  public customerAccountService = new CustomerAccountService();
  public tableIdService = new TableIdService();

  /**
   * Find all resolutionAction List
   *
   * @returns Promise<IResolutionAction[]>
   * @author Shrishti Raj
   */
  public async findAllResolutionAction(): Promise<IResolutionAction[]> {
    const resolutionActionList: IResolutionAction[] = await this.resolutionAction.findAll({
      where: { deletedAt: null },
      include: [{ model: SudoryTemplateModel, as: 'sudoryTemplate' }],
    });
    return resolutionActionList;
  }

  /**
   * Create a new resolutionAction
   *
   * @param  {CreateResolutionActionDto} resolutionActionData
   * @returns Promise<IResolutionAction>
   * @author Shrishti Raj
   */
  public async createResolutionAction(resolutionActionData: CreateResolutionActionDto, systemId: string): Promise<IResolutionAction> {
    if (isEmpty(resolutionActionData)) throw new HttpException(400, 'resolutionAction Data cannot be blank');

    const tableIdName = 'ResolutionAction';
    const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdName);
    const resolutionActionId: string = responseTableIdData.tableIdFinalIssued;
    const {
      resolutionActionName,
      resolutionActionDescription,
      sudoryTemplateId,
      resolutionActionTemplateSteps,
      resolutionActionType,
      resolutionActionPrerequisiteKey,
    } = resolutionActionData;
    const sudoryTemplateDetails = await this.sudoryTemplate.findOne({ where: { sudoryTemplateId: sudoryTemplateId } });
    if (!sudoryTemplateDetails) throw new HttpException(400, 'SudoryTemplate is not found');
    const currentDate = new Date();
    const resolutionAction = {
      resolutionActionId: resolutionActionId,
      createdBy: systemId,
      createdAt: currentDate,
      updatedAt: currentDate,
      resolutionActionName,
      resolutionActionDescription,
      resolutionActionTemplateSteps,
      resolutionActionType,
      resolutionActionPrerequisiteNumber: resolutionActionPrerequisiteKey || null,
      sudoryTemplateKey: sudoryTemplateDetails.sudoryTemplateKey,
    };
    const newresolutionAction: IResolutionAction = await this.resolutionAction.create(resolutionAction);
    console.log('newresolutionAction', newresolutionAction);
    return newresolutionAction;
  }

  /**
   * find resolutionAction by Id
   *
   * @param  {string} resolutionActionId
   * @returns Promise<IResolutionAction>
   * @author Shrishti Raj
   */
  public async findResolutionActionById(resolutionActionId: string): Promise<Object> {
    if (isEmpty(resolutionActionId)) throw new HttpException(400, 'Not a valid resolutionActionId');
    const returnResult = [];
    const findResolutionAction: IResolutionAction = await this.resolutionAction.findOne({
      where: { resolutionActionId, deletedAt: null },
      include: [{ model: SudoryTemplateModel, as: 'sudoryTemplate' }],
    });
    if (!resolutionActionId) throw new HttpException(409, 'resolutionAction Id Not found');
    returnResult.push(findResolutionAction);
    if (findResolutionAction.resolutionActionPrerequisiteKey) {
      const findPrerequisiteResolutionAction = await this.resolutionAction.findOne({
        where: {
          resolutionActionKey: findResolutionAction.resolutionActionPrerequisiteKey,
          deletedAt: null,
        },
      });
      returnResult.push(findPrerequisiteResolutionAction);
    }

    return returnResult;
  }

  /**
   *
   * @param {string} resolutionActionId
   * @param {object} resolutionActionData
   * @param {string} systemId
   * @returns  Promise<IResolutionAction>
   */
  public async updateResolutionAction(
    resolutionActionId: string,
    resolutionActionData: UpdateResolutionActionDto,
    systemId: string,
  ): Promise<Object> {
    if (isEmpty(UpdateResolutionActionDto)) throw new HttpException(400, 'resolutionAction Data cannot be blank');
    const findResolutionAction: IResolutionAction = await this.resolutionAction.findOne({ where: { resolutionActionId } });
    if (!findResolutionAction) throw new HttpException(409, "resolutionAction doesn't exist");

    const currentDate = new Date();
    const updatedChannelData = {
      ...resolutionActionData,
      updatedBy: systemId,
      updatedAt: currentDate,
    };
    await this.resolutionAction.update(updatedChannelData, { where: { resolutionActionId } });

    return await this.findResolutionActionById(resolutionActionId);
  }

  public async getResolutionActionByRuleGroupId(ruleGroupId: string): Promise<IResolutionAction[]> {
    try {
      const ruleGroupDetail: any = await this.ruleGroup.findOne({ where: { ruleGroupId } });
      const ruleGroupResolutionAction = await this.ruleGroupResolutionAction.findAll({
        where: { deletedAt: null, ruleGroupKey: ruleGroupDetail.ruleGroupKey },
        attributes: ['resolutionActionKey'],
      });
      let resolutionActionKeys: any[];
      if (ruleGroupResolutionAction) {
        resolutionActionKeys = _.map(ruleGroupResolutionAction, 'resolutionActionKey');
      }

      const whereCondition = {
        where: {
          deletedAt: null,
          resolutionActionKey: {
            [Op.in]: resolutionActionKeys,
          },
        },
        include: [
          {
            model: SudoryTemplateModel,
            as: 'sudoryTemplate',
          },
        ],
      };

      const allResolutionAction: IResolutionAction[] = await this.resolutionAction.findAll(whereCondition);
      return allResolutionAction;
    } catch (error) {
      console.log('error============', error);
      return [];
    }
  }

  public async deleteResolutionActionByResolutionActionId(resolutionActionId: string): Promise<Object> {
    let resultMsg = {};
    if (isEmpty(resolutionActionId)) throw new HttpException(400, 'resolutionActionId cannot be blank');
    const getResolutionAction: IResolutionAction = await this.resolutionAction.findOne({
      where: { resolutionActionId: resolutionActionId, deletedAt: null },
    });
    if (!getResolutionAction) throw new HttpException(404, 'cannot find resolutin action');
    const resolutionActionKey = getResolutionAction.resolutionActionKey;

    const findRuleGroupResolutionAction: IRuleGroupResolutionAction[] = await this.ruleGroupResolutionAction.findAll({
      where: { resolutionActionKey, deletedAt: null },
    });
    if (findRuleGroupResolutionAction)
      throw new HttpException(409, `The resolution action is associated with rule group: ${findRuleGroupResolutionAction[0].ruleGroupKey}`);

    const deleteResolutionAction = await this.resolutionAction.update({ deletedAt: new Date() }, { where: { resolutionActionId } });

    console.log('deleteResolutionAction', deleteResolutionAction);
    resultMsg = { result: 'delete success', requestedResolutionAction: resolutionActionId };
    return resultMsg;
  }
}

export default ResolutionActionService;
