import { IBayesianModel, IBayesianDBModel } from '@/common/interfaces/bayesianModel.interface';
import { IResourceGroup } from '@/common/interfaces/resourceGroup.interface';
import DB from '@/database';
import { CreateBayesianModelDto, UpdateBayesianModelDto } from '../dtos/bayesianModel.dto';
import { isEmpty } from '@/common/utils/util';
import { HttpException } from '@/common/exceptions/HttpException';
import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import { BayesianModelTable } from '../models/bayesianModel.model';
import { ModelRuleScoreTable } from '../models/modelRuleScore.model';
import { RuleGroupAlertRuleModel } from '../models/ruleGroupAlertRule.model';
import { RuleGroupModel } from '../models/ruleGroup.model';

class BayesianModelServices {
  public bayesianModel = DB.BayesianModel;
  public resourceGroup = DB.ResourceGroup;
  public customerAccountService = new CustomerAccountService();
  public tableIdService = new TableIdService();
  /**
   * Find all BayesianModel List
   *
   * @returns Promise<IBayesianModel[]>
   * @author Shrishti Raj
   */
  public async findAllBayesianModel(customerAccountKey: number): Promise<IBayesianModel[]> {
    const bayesianModelList: IBayesianDBModel[] = await this.bayesianModel.findAll({
      where: { customerAccountKey: customerAccountKey, deletedAt: null }
    });
    var resultAllBayesianModel = [];
    const modelLength = bayesianModelList.length;
    
    for (let i=0; i<modelLength; i++ ) {
      let resultResourceGroup: IResourceGroup = await this.resourceGroup.findOne({where: {resourceGroupKey: bayesianModelList[i].resourceGroupKey}}); 
      let { 
        bayesianModelKey,
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
        bayesianModelClusterId: resultResourceGroup.resourceGroupId
      };  
    }

    return resultAllBayesianModel;
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
    const { bayesianModelName, bayesianModelDescription, bayesianModelResourceType, bayesianModelClusterId } = bayesianModelData

    const resultResourceGroup: IResourceGroup = await this.resourceGroup.findOne({where: {resourceGroupId: bayesianModelClusterId}}); 
    if (!resultResourceGroup) throw new HttpException(409, "ResourceGroup doesn't exist");
    const resourceGroupKey = resultResourceGroup.resourceGroupKey

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
      bayesianModelStatus: "AC"
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
  public async findBayesianModelById(bayesianModelId: string): Promise<IBayesianModel> {
    if (isEmpty(bayesianModelId)) throw new HttpException(400, 'Not a valid BayesianModelId');

    const findBayesianModel: IBayesianDBModel = await this.bayesianModel.findOne({
      where: { bayesianModelId, deletedAt: null },
      include: [
        {
          model: ModelRuleScoreTable,
          attributes: ['bayesianModelKey'],
          include: [
            {
              model: RuleGroupModel,
              include:[
                {
                  model:RuleGroupAlertRuleModel
                }
              ]
            }
          ]
        }
      ]
    });
    if (!bayesianModelId) throw new HttpException(409, 'BayesianModel Id Not found');

    const { 
      bayesianModelKey,
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
      resourceGroupKey,
    } = findBayesianModel;

    const resultResourceGroup: IResourceGroup = await this.resourceGroup.findOne({where: {resourceGroupKey: resourceGroupKey}}); 
    if (!resultResourceGroup) throw new HttpException(409, "ResourceGroup doesn't exist");
    const bayesianModelClusterId = resultResourceGroup.resourceGroupId;

    const resultBayesianModel = {
      bayesianModelId,
      bayesianModelKey,
      createdBy,
      updatedBy,
      createdAt,
      updatedAt,
      deletedAt,
      customerAccountKey,
      bayesianModelName,
      bayesianModelStatus, 
      bayesianModelDescription, 
      bayesianModelResourceType, 
      bayesianModelScoreCard,
      bayesianModelClusterId };  

    return resultBayesianModel;
  }
  /**
   * find BayesianModel by Id
   *
   * @param  {string} BayesianModelId
   * @returns Promise<IBayesianModel>
   * @author Shrishti Raj
   */
  public async findBayesianModelByResourceType(resourceType: string): Promise<IBayesianModel[]> {

    if (isEmpty(resourceType)) throw new HttpException(400, 'No Resource Type');
    console.log("resourceTyperesourceType", resourceType)
    const bayesianModelList: IBayesianDBModel[] = await this.bayesianModel.findAll({
      where: { bayesianModelResourceType:resourceType, deletedAt: null },
    });
    if (!bayesianModelList) throw new HttpException(409, 'BayesianModel detail Not found');

    var resultAllBayesianModel = [];
    const modelLength = bayesianModelList.length;
    for (let i=0; i<modelLength; i++ ) {
      let resultResourceGroup: IResourceGroup = await this.resourceGroup.findOne({where: {resourceGroupKey: bayesianModelList[i].resourceGroupKey}}); 
      let { 
        bayesianModelKey,
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
        bayesianModelClusterId: resultResourceGroup.resourceGroupId
      };  
    }

    return resultAllBayesianModel;
  }

  public async updateBayesianModel(
    bayesianModelId: string,
    bayesianModelData: UpdateBayesianModelDto,
    systemId: string,
  ): Promise<IBayesianModel> {
    if (isEmpty(UpdateBayesianModelDto)) throw new HttpException(400, 'BayesianModel Data cannot be blank');
    const findBayesianModel: IBayesianDBModel = await this.bayesianModel.findOne({ where: { bayesianModelId } });
    if (!findBayesianModel) throw new HttpException(409, "BayesianModel doesn't exist");

    const { bayesianModelName, bayesianModelDescription, bayesianModelResourceType, bayesianModelScoreCard, bayesianModelClusterId } = bayesianModelData

    const resultResourceGroup: IResourceGroup = await this.resourceGroup.findOne({where: {resourceGroupId: bayesianModelClusterId}}); 
    if (!resultResourceGroup) throw new HttpException(409, "ResourceGroup doesn't exist");
    const resourceGroupKey = resultResourceGroup.resourceGroupKey;

    const currentDate = new Date();
    const updatedModelData = {
      bayesianModelName,
      bayesianModelDescription,
      bayesianModelResourceType,
      bayesianModelScoreCard,
      resourceGroupKey,
      updatedBy: systemId,
      updatedAt: currentDate
    };
    await this.bayesianModel.update(updatedModelData, { where: { bayesianModelId } });

    return this.findBayesianModelById(bayesianModelId);
  }
}

export default BayesianModelServices;
