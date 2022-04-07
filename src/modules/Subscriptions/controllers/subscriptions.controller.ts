import { NextFunction, Request, Response } from 'express';
import { CreateCatalogPlanProductDto, CreateCatalogPlanDto, CreateProductPricingDto } from '@/modules/ProductCatalog/dtos/productCatalog.dto';
import { ICatalogPlan, ICatalogPlanProduct, ICatalogPlanProductPrice } from '@/common/interfaces/productCatalog.interface';
import SubscriptionService from '@/modules/Subscriptions/services/subscriptions.service';
import { RequestWithUser } from '@/common/interfaces/auth.interface';
import { ISubscriptions } from '@/common/interfaces/subscription.interface';
import { IRequestWithUser } from '@/common/interfaces/party.interface';
import { CreateSubscriptionDto } from '../dtos/subscriptions.dto';
class SubscriptionController {
  public subscriptionService = new SubscriptionService();


  public getAllSubscriptions = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const allSubscriptions: ISubscriptions[] = await this.subscriptionService.findSubscriptions();
      res.status(200).json({ data: allSubscriptions, message: 'success' });
    } catch (error) {
      next(error);
    }
  };

  public createSubscriptions = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const subscriptionData: CreateSubscriptionDto = req.body;
      const { user:{partyId}, systemId , customerAccountKey} = req;
      const newSubscription: ISubscriptions = await this.subscriptionService.createSubscription(subscriptionData, partyId, systemId, customerAccountKey);
      res.status(201).json({ data: newSubscription, message: 'success' });
    } catch (error) {
      next(error);
    }
  };

  public findSubscription = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const subscriptionId = req.params.subscriptionId;
      const subscriptionDetail: ISubscriptions = await this.subscriptionService.findSubscription(subscriptionId);
      res.status(200).json({ data: subscriptionDetail, message: 'success' });
    } catch (error) {
      next(error);
    }
  };

  public updateSubscription = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { params: { subscriptionId }, body , user:{partyId}, systemId} = req
      const updated: ISubscriptions = await this.subscriptionService.updateSubscription(subscriptionId, body, partyId, systemId);
      res.status(200).json({ updated });
    } catch (error) {
      next(error);
    }
  };




}

export default SubscriptionController;
