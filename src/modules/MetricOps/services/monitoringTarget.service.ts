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
import { ISubscribedProduct, ISubscriptions } from '@/common/interfaces/subscription.interface';
import Op from 'sequelize/types/operators';
import { BayesianModelTable } from '../models/bayesianModel.model';
import { IResource } from '@/common/interfaces/resource.interface';
import { ICatalogPlan, ICatalogPlanProduct } from '@/common/interfaces/productCatalog.interface';

class AnomalyMonitoringTargetService {
  public AnomalyMonitoringTarget = DB.AnomalyMonitoringTarget;
  public bayesianModel = DB.BayesianModel;
  public resource = DB.Resource;
  public subscription = DB.Subscription;
  public subscribedProduct = DB.SubscribedProduct;
  public catalogPlan = DB.CatalogPlan;
  public catalogPlanProduct = DB.CatalogPlanProduct;
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
  public async createMonitoringTarget(targetData: CreateMonitoringTargetDto, systemId: string, customerAccountKey: number): Promise<Object> {
    if (isEmpty(targetData)) throw new HttpException(400, 'AnomalyMonitoringTarget Data cannot be blank');

    const subscribedProductId = await this.getTableId('SubscribedProduct');
    const anomalyMonitoringTargetId = await this.getTableId('AnomalyMonitoringTarget');
    const { anomalyMonitoringTargetDescription, anomalyMonitoringTargetName, anomalyMonitoringTargetStatus, bayesianModelId, resourceId } =
      targetData;

    //check the resource is active
    const resourceDetail: IResource = await this.resource.findOne({ where: { resourceId, deletedAt: null } });
    if (isEmpty(resourceDetail)) throw new HttpException(401, `Resource doesn't exist with ${resourceId}`);
    const resourceKey = resourceDetail.resourceKey;

    //check the resource is already target
    const checkResourceInAnomalyTarget: IAnomalyMonitoringTarget = await this.AnomalyMonitoringTarget.findOne({
      where: { resourceKey, deletedAt: null },
    });
    if (checkResourceInAnomalyTarget) throw new HttpException(402, `Resource is already registered as Monitoring Target ${resourceId}`);

    const resourceType = resourceDetail.resourceType;
    console.log('METRICOPS# - requested monitoring target resource type--', resourceType);

    //find subscription, catalogplanproduct, bayesianmodel key
    const findCatalogPlan: ICatalogPlan = await this.catalogPlan.findOne({ where: { deletedAt: null, catalogPlanType: 'MO' } });
    if (isEmpty(findCatalogPlan)) throw new HttpException(410, `Catalog plan issue - no MetricOps Plan`);
    const catalogPlanKey = findCatalogPlan.catalogPlanKey;
    const findSubscription: ISubscriptions = await this.subscription.findOne({ where: { deletedAt: null, customerAccountKey, catalogPlanKey } });
    if (isEmpty(findCatalogPlan)) throw new HttpException(411, `Cannot found subscribed MetricOps Plan`);
    const subscriptionKey = findSubscription.subscriptionKey;
    const findCatalogPlanProduct: ICatalogPlanProduct = await this.catalogPlanProduct.findOne({
      where: { deletedAt: null, catalogPlanKey, catalogPlanProductType: resourceType },
    });
    if (isEmpty(findCatalogPlan)) throw new HttpException(412, `Cannot found catalog plan product for resource type: ${resourceType}`);
    const catalogPlanProductKey = findCatalogPlanProduct.catalogPlanProductKey;
    const bayesianModelDetails = await this.bayesianModel.findOne({ where: { bayesianModelId } });
    if (isEmpty(bayesianModelDetails)) throw new HttpException(400, `Bayesian model doesn't exist with ${bayesianModelId}`);
    const bayesianModelKey = bayesianModelDetails.bayesianModelKey;

    const subscribedProductData = {
      subscribedProductId,
      resourceKey: resourceDetail.resourceKey,
      customerAccountKey,
      subscriptionKey: subscriptionKey,
      catalogPlanProductKey: catalogPlanProductKey,
      subscribedProductStatus: 'AC',
      subscribedProductFrom: new Date(),
      subscribedProductTo: new Date('9999-12-31T23:59:59Z'),
      createdBy: systemId,
    };
    const returnResult = [];
    try {
      return await DB.sequelize.transaction(async t => {
        const newsubscribedProduct = await this.subscribedProduct.create(subscribedProductData);
        console.log('METRICOPS# - subscribeProductDetails', newsubscribedProduct);
        returnResult.push(newsubscribedProduct);
        const currentDate = new Date();
        const anomalyMonitoringTarget = {
          anomalyMonitoringTargetId,
          createdBy: systemId,
          createdAt: currentDate,
          updatedAt: currentDate,
          anomalyMonitoringTargetDescription,
          anomalyMonitoringTargetName,
          bayesianModelKey,
          anomalyMonitoringTargetStatus,
          resourceKey: resourceDetail.resourceKey,
          customerAccountKey: customerAccountKey,
          subscribedProductKey: newsubscribedProduct.subscribedProductKey,
        };
        const newresolutionAction: IAnomalyMonitoringTarget = await this.AnomalyMonitoringTarget.create(anomalyMonitoringTarget);
        returnResult.push(newresolutionAction);
        console.log('METRICOPS# - subscribeProductDetails', newresolutionAction);
        return returnResult;
      });
    } catch (error) {
      console.log(`error on creating subscribedProduct and anomalyTarget`);
    }

    return returnResult;
  }

  /**
   * Remove a monitoring target
   *
   * @param  {anomalyMonitoringTargetId} string
   * @param  {partyId} string
   * @returns Promise<object>
   * @author Jerry Lee
   */
  public async deleteMonitoringTarget(anomalyMonitoringTargetId: string, partyId: string): Promise<object> {
    let result = {};
    if (isEmpty(anomalyMonitoringTargetId)) throw new HttpException(400, 'monitoringTargetId can not be blank');

    const resultAnomalyMonitoringTarget = await this.findMonitoringTargetById(anomalyMonitoringTargetId);
    if (isEmpty(resultAnomalyMonitoringTarget)) throw new HttpException(400, 'targetdata not found');

    try {
      return await DB.sequelize.transaction(async t => {
        const updateAMT = { updatedBy: partyId, updatedAt: new Date(), deletedAt: new Date(), anomalyMonitoringTargetStatus: 'CA' };
        await this.AnomalyMonitoringTarget.update(updateAMT, { where: { anomalyMonitoringTargetId }, transaction: t });
        const subscribedProductKey = resultAnomalyMonitoringTarget.subscribedProductKey;

        const updateSP = {
          updatedBy: partyId,
          updatedAt: new Date(),
          deletedAt: new Date(),
          subscribedProductTo: new Date(),
          subscribedProductStatus: 'CA',
        };
        const updateSubscribedProduct = await this.subscribedProduct.update(updateSP, { where: { subscribedProductKey }, transaction: t });
        console.log('update result:', updateSubscribedProduct);

        result = {
          anomalyMonitoringTargetId: anomalyMonitoringTargetId,
          resourceKey: resultAnomalyMonitoringTarget.resourceKey,
          anomalyMonitoringTargetStatus: 'CA',
          subscribedProductKey: subscribedProductKey,
          subscribedProductTo: Date(),
        };
        return result;
      });
    } catch (error) {
      console.log(error);
      throw new HttpException(500, 'Unknown error while deleting monitoring target');
    }
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
    console.log('find monitoring target', findMonitoringTarget);
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
