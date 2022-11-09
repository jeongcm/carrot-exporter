import DB from '@/database';
import { HttpException } from '@/common/exceptions/HttpException';
import { isEmpty } from '@/common/utils/util';
import { ISubscribedProduct, ISubscriptions } from '@/common/interfaces/subscription.interface';
import { ICatalogPlanProduct } from '@/common/interfaces/productCatalog.interface';
import {
  CreateSubscribedProductDto,
  CreateSubscriptionDto,
  CreateSubscriptionHistoryDto,
  UpdateSubscribedProductto,
  UpdateSubscriptionDto,
} from '../dtos/subscriptions.dto';
import tableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import { CatalogPlanModel } from '@/modules/ProductCatalog/models/catalogPlan.model';
import { IsURLOptions } from 'express-validator/src/options';
import { SubscribedProductModel } from '../models/subscribedProduct.model';
import { CatalogPlanProductModel } from '@/modules/ProductCatalog/models/catalogPlanProduct.model';
import { CatalogPlanProductPriceModel } from '@/modules/ProductCatalog/models/catalogPlanProductPrice.model';
import { ResourceGroupModel } from '@/modules/Resources/models/resourceGroup.model';
import { ResourceModel } from '@/modules/Resources/models/resource.model';

class SubscriptionService {
  public subscription = DB.Subscription;
  public catalogPlan = DB.CatalogPlan;
  public catalogPlanProduct = DB.CatalogPlanProduct;
  public subscriptionHistory = DB.SubscriptionHistory;
  public subscribedProduct = DB.SubscribedProduct;
  public resource = DB.Resource;
  public tableIdService = new tableIdService();

  /**
   * @function {findSubscriptions} find the all catalog Data
   * @returns
   */
  public async findSubscriptions(customerAccountKey: number): Promise<ISubscriptions[]> {
    const allSubscriptions: ISubscriptions[] = await this.subscription.findAll({
      where: {
        deletedAt: null,
        customerAccountKey,
      },
      include: [
        { model: CatalogPlanModel, where: { deletedAt: null } },
        {
          model: SubscribedProductModel,
          where: { deletedAt: null },
          attributes: { exclude: ['subscribedProductKey', 'deletedAt'] },
          include: [
            {
              model: CatalogPlanProductModel,
              where: { deletedAt: null },
              include: [{ model: CatalogPlanProductPriceModel, where: { deletedAt: null } }],
            },
            { model: ResourceModel, where: { deletedAt: null }, include: [{ model: ResourceGroupModel, where: { deletedAt: null } }] },
          ],
        },
      ],
    });
    return allSubscriptions;
  }

  public async createSubscription(data: CreateSubscriptionDto, createdBy: string, customerAccountKey: number): Promise<ISubscriptions> {
    const subscriptionId = await this.getTableId('Subscription');
    const catalogPlan = await this.catalogPlan.findOne({ where: { catalogPlanId: data.catalogPlanId } });
    const createObj = {
      ...data,
      subscriptionId,
      catalogPlanKey: catalogPlan.catalogPlanKey,
      customerAccountKey,
      createdBy,
    };
    const newSubscription: ISubscriptions = await this.subscription.create(createObj);
    delete newSubscription.subscriptionKey;
    return newSubscription;
  }

  /**
   * {findCatalogPlan} find the catalog plan by its catalogPlanId
   * @param {string} id
   * @returns {object} catalog plan object
   */

  public async findSubscription(id: string): Promise<ISubscriptions> {
    if (isEmpty(id)) throw new HttpException(400, 'Not a valid subscription');
    const subscriptionDetail: ISubscriptions = await this.subscription.findOne({
      where: {
        subscriptionId: id,
        deletedAt: null,
      },
      attributes: { exclude: ['subscriptionKey', 'deleteAt'] },
      include: [
        {
          model: CatalogPlanModel,
          attributes: { exclude: ['catalogPlanKey', 'deletedAt'] },
        },
      ],
    });
    if (!subscriptionDetail) throw new HttpException(409, 'No Subscription is found');
    return subscriptionDetail;
  }

  public async updateSubscription(
    subscriptionId: string,
    subscriptionData: UpdateSubscriptionDto,
    userId: string,
    systemId: string,
  ): Promise<ISubscriptions> {
    if (isEmpty(subscriptionData)) throw new HttpException(400, 'Subscription Data cannot be blank');
    const subscriptionDetail: ISubscriptions = await this.findSubscriptionById(subscriptionId);
    if (!subscriptionDetail) {
      throw new HttpException(400, 'Subscription not found');
    }
    const updateObj = {
      ...subscriptionData,
      updatedBy: userId || systemId,
      updatedAt: new Date(),
    };

    await this.subscription.update(updateObj, { where: { subscriptionId } });

    const updateData: ISubscriptions = await this.subscription.findOne({
      where: { subscriptionId },
      attributes: { exclude: ['subscriptionKey', 'deletedAt'] },
    });

    return updateData;
  }

  public findSubscriptionById = async (subscriptionId: string) => {
    const subscriptionDetail: ISubscriptions = await this.subscription.findOne({ where: { subscriptionId } });
    return subscriptionDetail;
  };

  public createSubscriptionHistory = async (requestedData: UpdateSubscriptionDto, subscriptionId: string, partyId: string, systemId: string) => {
    try {
      const subscriptionHistoryId = await this.getTableId('SubscriptionHistory');
      const subscriptionDetail: ISubscriptions = await this.findSubscriptionById(subscriptionId);
      const { subscriptionStatus: subscriptionNewStatus = null, subscriptionCommitmentType: subscriptionNewCommitment = null } = requestedData;
      const {
        subscriptionStatus: subscriptionOldStatus = null,
        subscriptionCommitmentType: subscriptionOldCommitment = null,
        subscriptionKey,
      } = subscriptionDetail;
      const createObj = { subscriptionKey, subscriptionHistoryId, createdBy: partyId || systemId, updatedBy: partyId || systemId };
      let newObj = {};
      if (subscriptionNewStatus && subscriptionNewCommitment) {
        newObj = {
          ...createObj,
          subscriptionOldStatus,
          subscriptionNewStatus,
          subscriptionChangedAt: new Date(),
          subscriptionStatusChangeReason: 'BD',
          subscriptionOldCommitment,
          subscriptionNewCommitment,
          subscriptionCommitmentChangeReason: 'EA',
        };
      } else if (subscriptionNewCommitment) {
        newObj = {
          ...createObj,
          subscriptionChangedAt: new Date(),
          subscriptionOldCommitment,
          subscriptionNewCommitment,
          subscriptionCommitmentChangeReason: 'EA',
        };
      } else if (subscriptionNewStatus) {
        newObj = {
          ...createObj,
          subscriptionOldStatus,
          subscriptionNewStatus,
          subscriptionChangedAt: new Date(),
          subscriptionStatusChangeReason: 'BD',
        };
      }
      await this.subscriptionHistory.create(newObj);
    } catch (err) {
      throw new HttpException(400, err);
    }
  };

  public createSubscribedProduct = async (
    productData: CreateSubscribedProductDto,
    partyId: string,
    systemId: string,
    customerAccountKey: number,
    productCode?: string,
  ) => {
    const { subscribedProductStatus, subscribedProductFrom, subscribedProductTo, resourceId } = productData;
    const subscribedProductId = await this.getTableId('SubscribedProduct');
    const subscriptionDetail: ISubscriptions = await this.subscription.findOne({ where: { customerAccountKey } });
    if (!subscriptionDetail) {
      return { error: true, message: 'Subscription not found' };
    }
    let fuseBillProduct;
    const resourceDetail = await this.resource.findOne({ where: { resourceId } });
    if (!resourceDetail) {
      return { error: true, message: 'Resource not found' };
    }
    const catalogPlanProductDetails: ICatalogPlanProduct = await this.catalogPlanProduct.findOne({
      where: {
        catalogPlanKey: subscriptionDetail.catalogPlanKey,
        catalogPlanProductType: productData.catalogPlanProductType,
      },
    });
    if (productCode) {
      fuseBillProduct = await this.catalogPlanProduct.findOne({
        where: {
          catalogPlanProductId: productCode,
        },
      });
    }
    const createObj = {
      subscribedProductId,
      resourceKey: resourceDetail.resourceKey,
      customerAccountKey,
      subscriptionKey: subscriptionDetail.subscriptionKey,
      catalogPlanProductKey: catalogPlanProductDetails?.catalogPlanProductKey || fuseBillProduct.catalogPlanProductKey,
      subscribedProductStatus,
      subscribedProductFrom,
      subscribedProductTo,
      createdBy: partyId || systemId,
    };
    const newObj = await this.subscribedProduct.create(createObj);
    return { data: newObj, message: 'success' };
  };

  public createBulkSubscribedProduct = async (
    productData: CreateSubscribedProductDto[],
    partyId: string,
    systemId: string,
    customerAccountKey: number,
    productCode?: string,
  ) => {
    const createObj = [];
    productData.map(async (data: CreateSubscribedProductDto) => {
      const { subscribedProductStatus, subscribedProductFrom, subscribedProductTo, resourceId } = data;
      const subscribedProductId = await this.getTableId('SubscribedProduct');
      const subscriptionDetail: ISubscriptions = await this.subscription.findOne({ where: { customerAccountKey } });
      if (!subscriptionDetail) {
        return { error: true, message: 'Subscription not found' };
      }
      let fuseBillProduct;
      const resourceDetail = await this.resource.findOne({ where: { resourceId } });
      if (!resourceDetail) {
        return { error: true, message: 'Resource not found' };
      }
      const catalogPlanProductDetails: ICatalogPlanProduct = await this.catalogPlanProduct.findOne({
        where: {
          catalogPlanKey: subscriptionDetail.catalogPlanKey,
          catalogPlanProductType: data.catalogPlanProductType,
        },
      });
      if (productCode) {
        fuseBillProduct = await this.catalogPlanProduct.findOne({
          where: {
            catalogPlanProductId: productCode,
          },
        });
      }

      createObj.push({
        subscribedProductId,
        resourceKey: resourceDetail.resourceKey,
        customerAccountKey,
        subscriptionKey: subscriptionDetail.subscriptionKey,
        catalogPlanProductKey: catalogPlanProductDetails?.catalogPlanProductKey || fuseBillProduct.catalogPlanProductKey,
        subscribedProductStatus,
        subscribedProductFrom,
        subscribedProductTo,
        createdBy: partyId || systemId,
      });
    });
    const newObj = await this.subscribedProduct.bulkCreate(createObj);
    return { data: newObj, message: 'success' };
  };

  public findSubscribedProduct = async (subscribedProductId: string) => {
    const productDetails = await this.subscribedProduct.findOne({
      where: { subscribedProductId },
      attributes: { exclude: ['subscribedProductKey', 'deletedAt', 'subscription_key'] },
    });
    return productDetails;
  };

  public updateSubscribedProduct = async (subscribedProductId: string, productData: UpdateSubscribedProductto, userId: string, systemId: string) => {
    if (isEmpty(productData)) throw new HttpException(400, 'Subscribe product Data cannot be blank');
    const productDetail: ISubscribedProduct = await this.subscribedProduct.findOne({ where: { subscribedProductId } });
    if (!productDetail) {
      return { error: true, message: 'Subscription not found' };
    }
    const updateObj = {
      ...productData,
      updatedBy: userId || systemId,
      updatedAt: new Date(),
    };

    await this.subscribedProduct.update(updateObj, { where: { subscribedProductId } });

    const updateData: ISubscribedProduct = await this.subscribedProduct.findOne({
      where: { subscribedProductId },
      attributes: { exclude: ['subscribedProductKey', 'deletedAt'] },
    });

    return { data: updateData, message: 'success' };
  };

  public getTableId = async (tableIdTableName: string) => {
    const tableId = await this.tableIdService.getTableIdByTableName(tableIdTableName);
    const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdTableName);
    return responseTableIdData.tableIdFinalIssued;
  };
}

export default SubscriptionService;
