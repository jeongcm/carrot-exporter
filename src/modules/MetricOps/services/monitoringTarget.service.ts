import DB from '@/database';
import { CreateMonitoringTargetDto, UpdateMonitoringTargetDto } from '../dtos/monitoringTarget.dto';
import { isEmpty } from '@/common/utils/util';
import { HttpException } from '@/common/exceptions/HttpException';
import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import { IAnomalyMonitoringTarget } from '@/common/interfaces/monitoringTarget.interface';
import { ResourceModel } from '@/modules/Resources/models/resource.model';
import { ResourceGroupModel } from '@/modules/Resources/models/resourceGroup.model';
import { ISubscribedProduct } from '@/common/interfaces/subscription.interface';
import Op from 'sequelize/types/operators';
import { BayesianModelTable } from '../models/bayesianModel.model';

class AnomalyMonitoringTargetService {
  public AnomalyMonitoringTarget = DB.AnomalyMonitoringTarget;
  public bayesianModel = DB.BayesianModel;
  public resource = DB.Resource;
  public subscribedProduct = DB.SubscribedProduct;
  public customerAccountService = new CustomerAccountService();
  public tableIdService = new TableIdService();

  /**
   * Find all AnomalyMonitoringTarget List
   *
   * @returns Promise<IAnomalyMonitoringTarget[]>
   * @author Shrishti Raj
   */
  public async findAllMonitoringTargets(): Promise<IAnomalyMonitoringTarget[]> {
    const monitoringTargetList: IAnomalyMonitoringTarget[] = await this.AnomalyMonitoringTarget.findAll({
      where: { deletedAt: null },
      include: [{ model: ResourceModel, include: [{ model: ResourceGroupModel }] }],
    });
    return monitoringTargetList;
  }

  /**
   * Create a new AnomalyMonitoringTarget
   *
   * @param  {CreateResolutionActionDto} targetData
   * @returns Promise<IAnomalyMonitoringTarget>
   * @author Shrishti Raj
   */
  public async createMonitoringTarget(
    targetData: CreateMonitoringTargetDto,
    systemId: string,
    customerAccountKey: number,
  ): Promise<IAnomalyMonitoringTarget> {
    if (isEmpty(targetData)) throw new HttpException(400, 'AnomalyMonitoringTarget Data cannot be blank');

    const anomalyMonitoringTargetId = await this.getTableId('AnomalyMonitoringTarget');
    const { anomalyMonitoringTargetDescription, anomalyMonitoringTargetName, anomalyMonitoringTargetStatus, bayesianModelId, resourceId } =
      targetData;
    const resourceDetail = await this.resource.findOne({ where: { resourceId } });
    if (isEmpty(resourceDetail)) throw new HttpException(400, `Resource doesn't exist with ${resourceId}`);
    const subscribedProductId = await this.getTableId('SubscribedProduct');
    const subscribedProductData = {
      subscribedProductId,
      resourceKey: resourceDetail.resourceKey,
      customerAccountKey,
      subscriptionKey: Number(process.env.SUBSCRIPTION_KEY) || 1,
      catalogPlanProductKey: Number(process.env.CATALOGPLANPRODUCT_KEY) || 1,
      subscribedProductStatus: 'AC',
      subscribedProductFrom: new Date(),
      subscribedProductTo: new Date('Fri, 31 Dec 9999 23:59:59'),
      createdBy: systemId,
    };
    const subscribedProductDetail = await this.subscribedProduct.create(subscribedProductData);
    console.log('subscribeProductDetails', subscribedProductDetail);
    const bayesianModelDetails = await this.bayesianModel.findOne({ where: { bayesianModelId } });
    if (isEmpty(bayesianModelDetails)) throw new HttpException(400, `Bayesian model doesn't exist with ${bayesianModelId}`);

    const currentDate = new Date();
    const anomalyMonitoringTarget = {
      anomalyMonitoringTargetId,
      createdBy: systemId,
      createdAt: currentDate,
      updatedAt: currentDate,
      anomalyMonitoringTargetDescription,
      anomalyMonitoringTargetName,
      bayesianModelKey: bayesianModelDetails.bayesianModelKey,
      anomalyMonitoringTargetStatus,
      resourceKey: resourceDetail.resourceKey,
      customerAccountKey: customerAccountKey,
      subscribedProductKey: subscribedProductDetail.subscribedProductKey,
    };
    const newresolutionAction: IAnomalyMonitoringTarget = await this.AnomalyMonitoringTarget.create(anomalyMonitoringTarget);
    return newresolutionAction;
  }

  /**
   * Remove a monitoring target
   *
   * @param  {anomalyMonitoringTargetId} string
   * @param  {partyId} string
   * @returns Promise<object>
   * @author Jerry Lee
   */
  public async removeMonitoringTarget(anomalyMonitoringTargetId: string, partyId: string): Promise<object> {
    let result = {};
    try {
      if (isEmpty(anomalyMonitoringTargetId)) throw new HttpException(400, 'monitoringTargetId can not be blank');

      const resultAnomalyMonitoringTarget = await this.findMonitoringTargetById(anomalyMonitoringTargetId);
      if (isEmpty(resultAnomalyMonitoringTarget)) throw new HttpException(400, 'targetdata not found');

      const updateAMT = { updatedBy: partyId, updatedAt: new Date(), deletedAt: new Date(), anomalyMonitoringTargetStatus: 'CA' };
      await this.AnomalyMonitoringTarget.update(updateAMT, { where: { anomalyMonitoringTargetId } });
      const subscribedProductKey = resultAnomalyMonitoringTarget.subscribedProductKey;

      const updateSP = { updatedBy: partyId, updatedAt: new Date(), deletedAt: new Date(), subscribedProductTo: new Date() };
      await this.subscribedProduct.update(updateSP, { where: { subscribedProductKey } });

      result = {
        anomalyMonitoringTargetId: anomalyMonitoringTargetId,
        resourceKey: resultAnomalyMonitoringTarget.resourceKey,
        anomalyMonitoringTargetStatus: 'CA',
        subscribedProductKey: subscribedProductKey,
        subscribedProductTo: Date(),
      };
    } catch (error) {
      console.log(error);
    }
    return result;
  }

  public async updateMonitoringTarget(
    anomalyMonitoringTargetId: string,
    monitoringTargetData: UpdateMonitoringTargetDto,
    partyId: string,
  ): Promise<IAnomalyMonitoringTarget> {
    if (isEmpty(monitoringTargetData)) throw new HttpException(400, 'monitoringTarget can not be blank');
    const targetdata = await this.findMonitoringTargetById(anomalyMonitoringTargetId);
    if (isEmpty(targetdata)) throw new HttpException(400, 'targetdata not found');
    const updateObj = { ...monitoringTargetData, updatedBy: partyId, updatedAt: new Date() };
    await this.AnomalyMonitoringTarget.update(updateObj, { where: { anomalyMonitoringTargetId } });
    return await this.findMonitoringTargetById(anomalyMonitoringTargetId);
  }

  /**
   * find AnomalyMonitoringTarget by Id
   *
   * @param  {string} anomalyMonitoringTargetId
   * @returns Promise<IAnomalyMonitoringTarget>
   * @author Shrishti Raj
   */
  public async findMonitoringTargetById(anomalyMonitoringTargetId: string): Promise<IAnomalyMonitoringTarget> {
    const findMonitoringTarget: IAnomalyMonitoringTarget = await this.AnomalyMonitoringTarget.findOne({
      where: { anomalyMonitoringTargetId, deletedAt: null },
      include: [{ model: ResourceModel, include: [{ model: ResourceGroupModel }] }, { model: BayesianModelTable }],
    });
    if (!findMonitoringTarget) throw new HttpException(409, 'AnomalyMonitoringTarget Id Not found');

    return findMonitoringTarget;
  }

  /**
   * find AnomalyMonitoringTarget by BayesianModelKey
   *
   * @param  {number} bayesianModelKey
   * @returns Promise<IAnomalyMonitoringTarget>
   * @author Shrishti Raj
   */
  public async findMonitoringTargetByModelKey(bayesianModelKey: number): Promise<IAnomalyMonitoringTarget[]> {
    const findMonitoringTarget: IAnomalyMonitoringTarget[] = await this.AnomalyMonitoringTarget.findAll({
      where: { bayesianModelKey, deletedAt: null },
      include: [{ model: ResourceModel, include: [{ model: ResourceGroupModel }] }, { model: BayesianModelTable }],
    });
    if (!findMonitoringTarget) throw new HttpException(409, `no monitoring taregt under bayesianmodel key - ${bayesianModelKey}`);

    return findMonitoringTarget;
  }

  /**
   * find AnomalyMonitoringTarget by resourceKey
   *
   * @param  {string} resourceKey
   * @returns Promise<IAnomalyMonitoringTarget>
   * @author Jerry Lee
   */
  public async findMonitoringTargetsByResourceKeys(resourceKey: number): Promise<IAnomalyMonitoringTarget> {
    const findSubscribedProduct: ISubscribedProduct = await this.subscribedProduct.findOne({
      where: { deletedAt: null, resourceKey: resourceKey },
    });
    if (!findSubscribedProduct) throw new HttpException(409, 'AnomalyMonitoringTarget Not found');

    const findMonitoringTarget: IAnomalyMonitoringTarget = await this.AnomalyMonitoringTarget.findOne({
      where: { deletedAt: null, subscribedProductKey: findSubscribedProduct.subscribedProductKey },
    });
    if (!findMonitoringTarget) throw new HttpException(409, 'AnomalyMonitoringTarget Id Not found');

    return findMonitoringTarget;
  }

  /**
   * find AnomalyMonitoringTarget by customerKey
   *
   * @param  {string} customerAccountKey
   * @returns Promise<IAnomalyMonitoringTarget[]>
   * @author Jerry Lee
   */
  public async findMonitoringTargetsByCustomerAccountKey(customerAccountKey: number): Promise<IAnomalyMonitoringTarget[]> {
    const findMonitoringTarget: IAnomalyMonitoringTarget[] = await this.AnomalyMonitoringTarget.findAll({
      where: { deletedAt: null, customerAccountKey: customerAccountKey },
    });
    if (!findMonitoringTarget) throw new HttpException(409, `no anomaly monitoring target under customerAccount ${customerAccountKey}`);

    return findMonitoringTarget;
  }

  public getTableId = async (tableIdTableName: string) => {
    const tableId = await this.tableIdService.getTableIdByTableName(tableIdTableName);

    if (!tableId) {
      return;
    }
    const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdTableName);
    return responseTableIdData.tableIdFinalIssued;
  };
}

export default AnomalyMonitoringTargetService;
