import { NextFunction, Request, Response } from 'express';
import SubscriptionService from '@/modules/Subscriptions/services/subscriptions.service';
import { RequestWithUser } from '@/common/interfaces/auth.interface';
import { ISubscribedProduct, ISubscriptions } from '@/common/interfaces/subscription.interface';
import { IRequestWithUser } from '@/common/interfaces/party.interface';
import { CreateSubscribedProductDto, CreateSubscriptionDto } from '../dtos/subscriptions.dto';

class SubscriptionController {
  public subscriptionService = new SubscriptionService();


  public getAllSubscriptions = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const allSubscriptions: ISubscriptions[] = await this.subscriptionService.findSubscriptions(req.customerAccountKey);
      res.status(200).json({ data: allSubscriptions, message: 'success' });
    } catch (error) {
      next(error);
    }
  };

  public createSubscriptions = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const subscriptionData: CreateSubscriptionDto = req.body;
      const { user: { partyId } = {}, systemId, customerAccountKey } = req;
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
      const { params: { subscriptionId }, body, user: { partyId }, systemId } = req
      const updated: ISubscriptions = await this.subscriptionService.updateSubscription(subscriptionId, body, partyId, systemId);
      if (body.subscriptionCommitmentType || body.subscriptionStatus) {
        this.subscriptionService.createSubscriptionHistory(body, subscriptionId, partyId, systemId)
      }
      res.status(200).json({ updated });
    } catch (error) {
      res.status(400).json({ error, message: 'failure' });
    }
  };

  public createSubscribeProduct = async (req: IRequestWithUser, res: Response, next: NextFunction)=>{
    try{
      const productData: CreateSubscribedProductDto = req.body;
      const { user: { partyId }, systemId, customerAccountKey } = req;
      const newSubscribedProduct = await this.subscriptionService.createSubscribedProduct(productData, partyId, systemId, customerAccountKey);
      if(newSubscribedProduct.error){
        return res.status(400).json(newSubscribedProduct);
      }
      res.status(201).json(newSubscribedProduct);
    }catch(error){
      res.status(400).json({ error, message: 'failure' });
    }
  }


  public getSubscribeProduct = async (req: IRequestWithUser, res: Response, next: NextFunction)=>{
    try {
      const subscribedProductId = req.params.subscribedProductId;
      const subscribedProduct: ISubscribedProduct = await this.subscriptionService.findSubscribedProduct(subscribedProductId);
      if(subscribedProduct == null){
        return res.status(200).json({message: 'No data Found' });
      }else{
        return res.status(200).json({ data: subscribedProduct, message: 'success' });
      }
    } catch (error) {
      next(error);
    }
  }

  
  public updateSubscribedProduct = async (req: IRequestWithUser, res: Response, next: NextFunction)=>{
    try {
     const {body, user:{partyId}, systemId, params:{subscribedProductId}} = req
      const updatedData = await this.subscriptionService.updateSubscribedProduct(subscribedProductId,body, partyId, systemId);
      if(updatedData.error){
        return res.status(400).json(updatedData)
      }
      if(updatedData == null){
        return res.status(200).json({message: 'No data Found' });
      }else{

        return   res.status(200).json(updatedData);
      }
    } catch (error) {
      next(error);
    }
  }





}

export default SubscriptionController;
