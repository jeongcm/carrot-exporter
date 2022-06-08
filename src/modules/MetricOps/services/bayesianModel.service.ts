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
   * @returns Promise<IBayesianModel>
   * @author Shrishti Raj
   */
  public async createBayesianModel(
    bayesianModelData: CreateBayesianModelDto,
    customerAccountKey: number,
    systemId: string,
  ): Promise<IBayesianModel> {
    if (isEmpty(bayesianModelData)) throw new HttpException(400, 'BayesianModel Data cannot be blank');


    const tableIdName: string = 'BayesianModel';
    const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdName);
    const BayesianModelId: string = responseTableIdData.tableIdFinalIssued;
    const {bayesianModelName, bayesianModelDescription, bayesianModelResourceType} = bayesianModelData
    const currentDate = new Date();
    const BayesianModel = {
      bayesianModelId: BayesianModelId,
      createdBy: systemId,
      createdAt: currentDate,
      updatedAt: currentDate,
      bayesianModelName,
      bayesianModelDescription, 
      bayesianModelResourceType,
      customerAccountKey,
      bayesianModelStatus:"AC"
    };
    const newBayesianModel: IBayesianModel = await this.bayesianModel.create(BayesianModel);
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
    if (isEmpty(bayesianModelId)) throw new HttpException(400, 'Not a valid BayesianModelId');

    const findBayesianModel: IBayesianModel = await this.bayesianModel.findOne({
      where: { bayesianModelId, deletedAt: null },
    });
    if (!bayesianModelId) throw new HttpException(409, 'BayesianModel Id Not found');

    return findBayesianModel;
  }

  public async updateBayesianModel(
    bayesianModelId: string,
    bayesianModelData: UpdateBayesianModelDto,
    systemId: string,
  ): Promise<IBayesianModel> {
    if (isEmpty(UpdateBayesianModelDto)) throw new HttpException(400, 'BayesianModel Data cannot be blank');
    const findBayesianModel: IBayesianModel = await this.bayesianModel.findOne({ where: { bayesianModelId } });
    if (!findBayesianModel) throw new HttpException(409, "BayesianModel doesn't exist");

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
