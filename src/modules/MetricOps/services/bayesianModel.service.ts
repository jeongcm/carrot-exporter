import { IBayesianModel } from '@/common/interfaces/bayesianModel.interface';
import DB from '@/database';
import { CreateBayesianModelDto, UpdateBayesianModelDto } from '../dtos/bayesianModel.dto';
import { isEmpty } from '@/common/utils/util';
import { HttpException } from '@/common/exceptions/HttpException';
import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import { BayesianModelTable } from '../models/bayesianModel.model';

class BayesianModelServices {
  public bayesianModel = DB.BayesianModel;
  public customerAccountService = new CustomerAccountService();
  public tableIdService = new TableIdService();
  /**
   * Find all BayesianModel List
   *
   * @returns Promise<IBayesianModel[]>
   * @author Shrishti Raj
   */
  public async findAllBayesianModel(customerAccountKey: number): Promise<IBayesianModel[]> {
    const bayesianModelList: IBayesianModel[] = await this.bayesianModel.findAll({
      where: { customerAccountKey: customerAccountKey, deletedAt: null }
    });
    return bayesianModelList;
  }
  /**
   * Create a new BayesianModel
   *
   * @param  {CreateBayesianModelDto} bayesianModelData
   * @returns Promise<Notification>
   * @author Shrishti Raj
   */
  public async createNotification(
    bayesianModelData: CreateBayesianModelDto,
    partyKey: number,
    customerAccountKey: number,
    systemId: string,
  ): Promise<IBayesianModel> {
    if (isEmpty(bayesianModelData)) throw new HttpException(400, 'Notification Data cannot be blank');


    const tableIdName: string = 'BayesianModel';
    const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdName);
    const tempNotificationId: string = responseTableIdData.tableIdFinalIssued;
    const {bayesianModelName, baysianModelDescription, baysianModelResourceType} = bayesianModelData
    const currentDate = new Date();
    const newNotification = {
      bayesianModelId: tempNotificationId,
      createdBy: systemId,
      createdAt: currentDate,
      updatedAt: currentDate,
      bayesianModelName,
      baysianModelDescription, 
      baysianModelResourceType,
      customerAccountKey,
    };
    const newBayesianModel: IBayesianModel = await this.bayesianModel.create(newNotification);
    return newBayesianModel;
  }

  /**
   * find BayesianModel by Id
   *
   * @param  {string} BayesianModelId
   * @returns Promise<IBayesianModel>
   * @author Shrishti Raj
   */
  public async findBayesianModelById(bayesianModelId: string): Promise<IBayesianModel> {
    if (isEmpty(bayesianModelId)) throw new HttpException(400, 'Not a valid notificationId');

    const findBayesianModel: IBayesianModel = await this.bayesianModel.findOne({
      where: { bayesianModelId, deletedAt: null },
    });
    if (!bayesianModelId) throw new HttpException(409, 'Notification Id Not found');

    return findBayesianModel;
  }

  public async updateBayesianModel(
    bayesianModelId: string,
    bayesianModelData: UpdateBayesianModelDto,
    systemId: string,
  ): Promise<IBayesianModel> {
    if (isEmpty(UpdateBayesianModelDto)) throw new HttpException(400, 'Notification Data cannot be blank');
    const findBayesianModel: IBayesianModel = await this.bayesianModel.findOne({ where: { bayesianModelId } });
    if (!findBayesianModel) throw new HttpException(409, "Notification doesn't exist");

    const currentDate = new Date();
    const updatedChannelData = {
      ...bayesianModelData,
      updatedBy: systemId,
      updatedAt: currentDate
    };
    await this.bayesianModel.update(updatedChannelData, { where: { bayesianModelId } });

    return this.findBayesianModelById(bayesianModelId);
  }
}

export default BayesianModelServices;
