import DB from '@/database';
import { HttpException } from '@/common/exceptions/HttpException';
import { isEmpty } from '@/common/utils/util';
import { ISubscriptions } from '@/common/interfaces/subscription.interface';
import { CreateSubscriptionDto } from '../dtos/subscriptions.dto';
import tableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import { CatalogPlanModel } from '@/modules/ProductCatalog/models/catalogPlan.model';
import { IsURLOptions } from 'express-validator/src/options';

class SubscriptionService {
  public subscription = DB.Subscription;
  public catalogPlan = DB.CatalogPlan;
  public catalogPlanProduct = DB.CatalogPlanProduct;
  public catalogPlanProductPrice = DB.CatalogPlanProductPrice;
  public tableIdService = new tableIdService();


  /**
   * @function {findSubscriptions} find the all catalog Data
   * @returns 
   */
  public async findSubscriptions(): Promise<ISubscriptions[]> {
    const allSubscriptions: ISubscriptions[] = await this.subscription.findAll({ where: { deletedAt: null } });
    return allSubscriptions;
  }


  public async createSubscription(data: CreateSubscriptionDto, userId: string, systemId: string, customerAccountKey: number): Promise<ISubscriptions> {
    const subscriptionId = await this.getTableId('Subscription');
    const catalogPlan = await this.catalogPlan.findOne({ where: { catalogPlanId: data.catalogPlanId } })
    const createObj = {
      ...data,
      subscriptionId,
      catalogPlanKey: catalogPlan.catalogPlanKey,
      customerAccountKey
    }
    const newCatalogPlan: ISubscriptions = await this.subscription.create(createObj);
    return newCatalogPlan;
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
      include: [
        { model: CatalogPlanModel }
      ]
    });
    if (!subscriptionDetail) throw new HttpException(409, 'No Subscription is found');
    return subscriptionDetail;
  }


  public async updateSubscription(subscriptionId: string, subscriptionData: CreateSubscriptionDto, userId: string, systemId: string): Promise<ISubscriptions> {
    if (isEmpty(subscriptionData)) throw new HttpException(400, 'Subscription Data cannot be blank');

    const updateObj = {
      ...subscriptionData,
      updatedBy: userId || systemId,
      updatedAt: new Date(),
    };

    await this.subscription.update(updateObj, { where: { subscriptionId } });

    const updateData: ISubscriptions = await this.subscription.findOne({ where: { subscriptionId } });

    return updateData;
  }


  public getTableId = async (tableIdTableName: string) => {
    const tableId = await this.tableIdService.getTableIdByTableName(tableIdTableName);

    if (!tableId) {
      return;
    }
    const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdTableName);
    return responseTableIdData.tableIdFinalIssued;
  }


}

export default SubscriptionService;
