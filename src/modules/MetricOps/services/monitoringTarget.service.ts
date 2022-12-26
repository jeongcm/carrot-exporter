import DB from '@/database';
import { CreateMonitoringTargetDto, UpdateMonitoringTargetDto } from '../dtos/monitoringTarget.dto';
import { isEmpty } from '@/common/utils/util';
import { HttpException } from '@/common/exceptions/HttpException';
//import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import { IAnomalyMonitoringTarget } from '@/common/interfaces/monitoringTarget.interface';
import { IAnomalyMonitoringTargetResource } from '@/common/interfaces/monitoringTargetResource.interface';
import { ResourceModel } from '@/modules/Resources/models/resource.model';
import { AnomalyMonitoringTargetResourceModel } from '@/modules/MetricOps/models/monitoringTargetResource.model';
import { ResourceGroupModel } from '@/modules/Resources/models/resourceGroup.model';
import { ISubscribedProduct, ISubscriptions } from '@/common/interfaces/subscription.interface';
//import Op from 'sequelize/types/operators';
import { BayesianModelTable } from '../models/bayesianModel.model';
import { IResource } from '@/common/interfaces/resource.interface';
import { ICatalogPlan, ICatalogPlanProduct } from '@/common/interfaces/productCatalog.interface';
import { QueryTypes } from 'sequelize';
const uuid = require('uuid');

class AnomalyMonitoringTargetService {
  public anomalyMonitoringTarget = DB.AnomalyMonitoringTarget;
  public anomalyMonitoringTargetResource = DB.AnomalyMonitoringTargetResource;
  public bayesianModel = DB.BayesianModel;
  public resource = DB.Resource;
  public subscription = DB.Subscription;
  public subscribedProduct = DB.SubscribedProduct;
  public catalogPlan = DB.CatalogPlan;
  public catalogPlanProduct = DB.CatalogPlanProduct;
  //public customerAccountService = new CustomerAccountService();
  public tableIdService = new TableIdService();

  /**
   * Find all AnomalyMonitoringTarget List
   *
   * @returns Promise<IAnomalyMonitoringTarget[]>
   * @author Shrishti Raj
   */
  public async findAllMonitoringTargets(): Promise<IAnomalyMonitoringTarget[]> {
    const monitoringTargetList: IAnomalyMonitoringTarget[] = await this.anomalyMonitoringTarget.findAll({
      where: { deletedAt: null },
      include: [
        { model: ResourceModel, where: { deletedAt: null }, include: [{ model: ResourceGroupModel, where: { deletedAt: null } }] },
        {
          model: AnomalyMonitoringTargetResourceModel,
          where: { deletedAt: null },
          required: false,
          include: [{ model: ResourceModel, where: { deletedAt: null } }],
        },
        { model: BayesianModelTable, where: { deletedAt: null } },
      ],
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
    if (!targetData) throw new HttpException(400, 'AnomalyMonitoringTarget Data cannot be blank');
    const returnResult = [];

    const subscribedProductId = await this.getTableId('SubscribedProduct');
    const anomalyMonitoringTargetId = await this.getTableId('AnomalyMonitoringTarget');
    const { anomalyMonitoringTargetDescription, anomalyMonitoringTargetName, anomalyMonitoringTargetStatus, bayesianModelId, resourceId } =
      targetData;

    //check the resource is active
    const findResource: IResource = await this.resource.findOne({ where: { resourceId, deletedAt: null } });
    if (!findResource) throw new HttpException(401, `Resource doesn't exist with ${resourceId}`);
    const resourceKey = findResource.resourceKey;
    const resourceGroupKey = findResource.resourceGroupKey;
    const resourceType = findResource.resourceType;
    const resourceLevel4 = findResource.resourceLevel4;
    const resourceName = findResource.resourceName;

    //check the resource is already target
    const checkResourceInAnomalyTarget: IAnomalyMonitoringTarget = await this.anomalyMonitoringTarget.findOne({
      where: { resourceKey, deletedAt: null },
    });
    if (checkResourceInAnomalyTarget) throw new HttpException(402, `Resource is already registered as Monitoring Target ${resourceId}`);

    console.log(`METRICOPS# - requested monitoring target resource type--, ${resourceType}, ${resourceLevel4}`);
    let podResourceKey = [];
    if (resourceLevel4 === 'WL') {
      let parentName;
      if (resourceType === 'DP') {
        //if resourceLevel4 is WL, get pods's resource id for AnomalyMonitoringTargetResource table
        const queryRs = `SELECT * FROM Resource WHERE deleted_at is null AND resource_type = 'RS' AND resource_name like '${resourceName}%' AND resource_group_key = ${resourceGroupKey} AND JSON_VALUE(resource_status, '$.replicas') > 0`;
        const findRs = await DB.sequelize.query(queryRs, { type: QueryTypes.SELECT });
        if (findRs.length <= 0) throw new HttpException(403, `Can't find Replicaset of ${resourceId}`);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        parentName = findRs[0].resource_name;
      } else {
        parentName = resourceName;
      }
      const queryPd = `SELECT * FROM Resource WHERE deleted_at is null AND resource_type = 'PD' AND resource_name like '${parentName}%' AND resource_group_key = ${resourceGroupKey}`;
      console.log(queryPd);
      const findPod = await DB.sequelize.query(queryPd, { type: QueryTypes.SELECT });
      if (findPod.length <= 0) throw new HttpException(403, `Can't find Pods of ${resourceId}`);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      podResourceKey = findPod.map(x => x.resource_key);
    } else {
      podResourceKey = [resourceKey];
    }
    console.log('podResourceKey', podResourceKey);

    //find subscription, catalogplanproduct, bayesianmodel key
    const findCatalogPlan: ICatalogPlan = await this.catalogPlan.findOne({ where: { deletedAt: null, catalogPlanType: 'MO' } });
    if (!findCatalogPlan) throw new HttpException(410, `Catalog plan issue - no MetricOps Plan`);
    const catalogPlanKey = findCatalogPlan.catalogPlanKey;
    const findSubscription: ISubscriptions = await this.subscription.findOne({ where: { deletedAt: null, customerAccountKey, catalogPlanKey } });
    if (!findCatalogPlan) throw new HttpException(411, `Cannot found subscribed MetricOps Plan`);
    const subscriptionKey = findSubscription.subscriptionKey;
    const findCatalogPlanProduct: ICatalogPlanProduct = await this.catalogPlanProduct.findOne({
      where: { deletedAt: null, catalogPlanKey, catalogPlanProductType: resourceLevel4 },
    });
    if (!findCatalogPlan) throw new HttpException(412, `Cannot found catalog plan product for resource level4: ${resourceLevel4}`);
    const catalogPlanProductKey = findCatalogPlanProduct.catalogPlanProductKey;
    const bayesianModelDetails = await this.bayesianModel.findOne({ where: { bayesianModelId } });
    if (!bayesianModelDetails) throw new HttpException(400, `Bayesian model doesn't exist with ${bayesianModelId}`);

    const bayesianModelKey = bayesianModelDetails.bayesianModelKey;
    const currentDate = new Date();
    const subscribedProductData = {
      subscribedProductId,
      resourceKey: findResource.resourceKey,
      customerAccountKey,
      subscriptionKey: subscriptionKey,
      catalogPlanProductKey: catalogPlanProductKey,
      subscribedProductStatus: 'AC',
      subscribedProductFrom: currentDate,
      subscribedProductTo: new Date('9999-12-31T23:59:59Z'),
      createdBy: systemId,
    };

    try {
      await DB.sequelize.transaction(async t => {
        const newSubscribedProduct = await this.subscribedProduct.create(subscribedProductData, { transaction: t });
        //console.log('METRICOPS# - subscribeProductDetails', newSubscribedProduct);
        returnResult.push(newSubscribedProduct);

        const anomalyMonitoringTarget = {
          anomalyMonitoringTargetId,
          createdBy: systemId,
          createdAt: currentDate,
          anomalyMonitoringTargetDescription,
          anomalyMonitoringTargetName,
          bayesianModelKey,
          anomalyMonitoringTargetStatus,
          resourceKey: findResource.resourceKey,
          customerAccountKey: customerAccountKey,
          subscribedProductKey: newSubscribedProduct.subscribedProductKey,
        };

        const newMonitoringTarget: IAnomalyMonitoringTarget = await this.anomalyMonitoringTarget.create(anomalyMonitoringTarget, { transaction: t });
        returnResult.push(newMonitoringTarget);
        console.log('METRICOPS# - newMonitoringTaregt', newMonitoringTarget);
        //console.log('length of key', podResourceKey.length);
        for (let i = 0; i < podResourceKey.length; i++) {
          const anomalyMonitoringTargetResource = {
            anomalyMonitoringTargetResourceId: uuid.v1(),
            createdBy: systemId,
            createdAt: currentDate,
            anomalyMonitoringTargetKey: newMonitoringTarget.anomalyMonitoringTargetKey,
            resourceKey: podResourceKey[i],
          };
          //console.log('METRICOPS# - anomalyMonitoringTargetResource', anomalyMonitoringTargetResource);
          const newMonitoringTargetResource: IAnomalyMonitoringTargetResource = await this.anomalyMonitoringTargetResource.create(
            anomalyMonitoringTargetResource,
            { transaction: t },
          );
          returnResult.push(newMonitoringTargetResource);
          console.log('METRICOPS# - newMonitoringTargetResource', newMonitoringTargetResource);
        } //end of for
      });
      return returnResult;
    } catch (error) {
      console.log(`error on creating subscribedProduct and anomalyTarget, ${error}`);
      throw new HttpException(500, `error to create monitoring target ${error}`);
    }
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

    const findAnomalyMonitoringTarget = await this.findMonitoringTargetById(anomalyMonitoringTargetId);
    const anomalyMonitoringTargetKey = findAnomalyMonitoringTarget.anomalyMonitoringTargetKey;
    const subscribedProductKey = findAnomalyMonitoringTarget.subscribedProductKey;
    if (!findAnomalyMonitoringTarget) throw new HttpException(404, 'target data not found');

    try {
      await DB.sequelize.transaction(async t => {
        const updateAMTS = { updatedBy: partyId, updatedAt: new Date(), deletedAt: new Date() };
        await this.anomalyMonitoringTargetResource.update(updateAMTS, { where: { anomalyMonitoringTargetKey }, transaction: t });

        const updateAMT = { updatedBy: partyId, updatedAt: new Date(), deletedAt: new Date(), anomalyMonitoringTargetStatus: 'CA' };
        await this.anomalyMonitoringTarget.update(updateAMT, { where: { anomalyMonitoringTargetId }, transaction: t });
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
          anomalyMOnitoringTargetResourceKey: findAnomalyMonitoringTarget.resourceKey,
          anomalyMonitoringTargetStatus: 'CA',
          subscribedProductKey: subscribedProductKey,
          subscribedProductTo: Date(),
        };
      });
    } catch (error) {
      console.log(error);
      throw new HttpException(500, 'Unknown error while deleting monitoring target');
    }
    return result;
  }

  public async updateMonitoringTarget(
    anomalyMonitoringTargetId: string,
    monitoringTargetData: UpdateMonitoringTargetDto,
    partyId: string,
  ): Promise<IAnomalyMonitoringTarget> {
    if (!monitoringTargetData) throw new HttpException(400, 'monitoringTarget can not be blank');
    const targetdata = await this.findMonitoringTargetById(anomalyMonitoringTargetId);
    if (!targetdata) throw new HttpException(404, 'targetdata not found');
    const anomalyMonitoringTargetKey = targetdata.anomalyMonitoringTargetKey;
    const updateMonitoringTarget = { updatedAt: new Date(), updatedBy: partyId, ...monitoringTargetData };
    console.log(updateMonitoringTarget);
    await this.anomalyMonitoringTarget.update(updateMonitoringTarget, { where: { anomalyMonitoringTargetKey } });

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
    const findMonitoringTarget: IAnomalyMonitoringTarget = await this.anomalyMonitoringTarget.findOne({
      where: { anomalyMonitoringTargetId, deletedAt: null },
      include: [
        { model: ResourceModel, where: { deletedAt: null }, include: [{ model: ResourceGroupModel, where: { deletedAt: null } }] },
        {
          model: AnomalyMonitoringTargetResourceModel,
          where: { deletedAt: null },
          required: false,
          include: [{ model: ResourceModel, where: { deletedAt: null } }],
        },
        { model: BayesianModelTable, where: { deletedAt: null } },
      ],
    });
    //console.log('find monitoring target', findMonitoringTarget);
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
    const findMonitoringTarget: IAnomalyMonitoringTarget[] = await this.anomalyMonitoringTarget.findAll({
      where: { bayesianModelKey, deletedAt: null },
      include: [
        { model: ResourceModel, where: { deletedAt: null }, include: [{ model: ResourceGroupModel, where: { deletedAt: null } }] },
        { model: AnomalyMonitoringTargetResourceModel, where: { deletedAt: null }, include: [{ model: ResourceModel, where: { deletedAt: null } }] },
        { model: BayesianModelTable, where: { deletedAt: null } },
      ],
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

    const findMonitoringTarget: IAnomalyMonitoringTarget = await this.anomalyMonitoringTarget.findOne({
      where: { deletedAt: null, subscribedProductKey: findSubscribedProduct.subscribedProductKey },
      include: [
        { model: ResourceModel, where: { deletedAt: null }, include: [{ model: ResourceGroupModel, where: { deletedAt: null } }] },
        { model: AnomalyMonitoringTargetResourceModel, where: { deletedAt: null }, include: [{ model: ResourceModel, where: { deletedAt: null } }] },
        { model: BayesianModelTable, where: { deletedAt: null } },
      ],
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
    const findMonitoringTarget: IAnomalyMonitoringTarget[] = await this.anomalyMonitoringTarget.findAll({
      where: { deletedAt: null, customerAccountKey: customerAccountKey },
      include: [
        { model: ResourceModel, where: { deletedAt: null }, include: [{ model: ResourceGroupModel, where: { deletedAt: null } }] },
        { model: AnomalyMonitoringTargetResourceModel, where: { deletedAt: null }, include: [{ model: ResourceModel, where: { deletedAt: null } }] },
        { model: BayesianModelTable, where: { deletedAt: null } },
      ],
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
