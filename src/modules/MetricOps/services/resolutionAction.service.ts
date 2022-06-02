import DB from '@/database';
import { CreateResolutionActionDto, UpdateResolutionActionDto } from '../dtos/resolutionAction.dto';
import { isEmpty } from '@/common/utils/util';
import { HttpException } from '@/common/exceptions/HttpException';
import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import { ResolutionActionModel } from '../models/resolutionAction.model';
import { IResolutionAction } from '@/common/interfaces/resolutionAction.interface';

class ResolutionActionService {
  public resolutionAction = DB.ResolutionAction;
  public sudoryTemplate = DB.SudoryTemplate;
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
      where: {deletedAt: null }
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
  public async createResolutionAction(
    resolutionActionData: CreateResolutionActionDto,
    systemId: string,
  ): Promise<IResolutionAction> {
    if (isEmpty(resolutionActionData)) throw new HttpException(400, 'resolutionAction Data cannot be blank');


    const tableIdName: string = 'ResolutionAction';
    const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdName);
    const resolutionActionId: string = responseTableIdData.tableIdFinalIssued;
    const {resolutionActionName, resolutionActionDescription, sudoryTemplateKey} = resolutionActionData;
    const sudoryTemplateDetails = await this.sudoryTemplate.findOne({where:{sudoryTemplateKey}});
    if(!sudoryTemplateDetails)  throw new HttpException(400, 'SudoryTemplate is not found');
    const currentDate = new Date();
    const resolutionAction = {
      resolutionActionId: resolutionActionId,
      createdBy: systemId,
      createdAt: currentDate,
      updatedAt: currentDate,
      resolutionActionName,
      resolutionActionDescription, 
      sudoryTemplateKey
    };
    const newresolutionAction: IResolutionAction = await this.resolutionAction.create(resolutionAction);
    return newresolutionAction;
  }

  /**
   * find resolutionAction by Id
   *
   * @param  {string} resolutionActionId
   * @returns Promise<IResolutionAction>
   * @author Shrishti Raj
   */
  public async findResolutionActionById(resolutionActionId: string): Promise<IResolutionAction> {
    if (isEmpty(resolutionActionId)) throw new HttpException(400, 'Not a valid resolutionActionId');

    const findResolutionAction: IResolutionAction = await this.resolutionAction.findOne({
      where: { resolutionActionId, deletedAt: null },
    });
    if (!resolutionActionId) throw new HttpException(409, 'resolutionAction Id Not found');

    return findResolutionAction;
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
  ): Promise<IResolutionAction> {
    if (isEmpty(UpdateResolutionActionDto)) throw new HttpException(400, 'resolutionAction Data cannot be blank');
    const findResolutionAction: IResolutionAction = await this.resolutionAction.findOne({ where: { resolutionActionId } });
    if (!findResolutionAction) throw new HttpException(409, "resolutionAction doesn't exist");

    const currentDate = new Date();
    const updatedChannelData = {
      ...resolutionActionData,
      updatedBy: systemId,
      updatedAt: currentDate
    };
    await this.resolutionAction.update(updatedChannelData, { where: { resolutionActionId } });

    return await this.findResolutionActionById(resolutionActionId);
  }
}

export default ResolutionActionService;
