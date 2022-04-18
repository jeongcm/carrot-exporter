import { NextFunction, Request, Response } from 'express';
import { IRequestWithSystem } from '@/common/interfaces/party.interface';

class webhookForBillingController {

    public receiveBillingInterface = async (req: IRequestWithSystem, res: Response, next: NextFunction) => {

    try {
        const eventType = req.body.eventType;
        
        console.log(req.body); 

        switch(eventType) {
            case "CustomerCreated": 

               const CustomerAccount = {
                firstName: req.body.Customer.firstName,
                lastName: req.body.Customer.lastName,
                extCustomerId: req.body.Customer.id,
                primaryEmail: req.body.Customer.primaryEmail,
                primaryPhone: req.body.Customer.primaryPhone,
                Company: req.body.Customer.companyName,
               };
               //call party/party user creation services
               //also, customerAccount should be created. 
               console.log (CustomerAccount);

               break;
            case "SubscriptionCreated":
                const Subscription = {
                    subscriptionCustomerId: req.body.Subscription.customerId,
                    subscriptionPlanCode: req.body.Subscription.planCode,
                    subscriptionExtSubscriptionId: req.body.Subscription.id,
                    subscriptionPlanName: req.body.Subscription.planName,
                    subscriptionCreatedAt: req.body.Subscription.createdTimestamp,
                    subscrptionStatus: req.body.Subscription.status,
                   };
                // call subscription creation    
                // need to call subscription api in Fusebill to get plan product information
                
                   console.log (Subscription);               
               break;
            case "SubscriptionUpdated":
                const SubscriptionUpdate = {
                    subscriptionCustomerId: req.body.Subscription.customerId,
                    subscriptionPlanCode: req.body.Subscription.planCode,
                    subscriptionExtSubscriptionId: req.body.Subscription.id,
                    subscriptionPlanName: req.body.Subscription.planName,
                    subscriptionCreatedAt: req.body.Subscription.createdTimestamp,
                    subscriptionActivatedAt: req.body.Subscription.activatedTimestamp,
                    subscrptionStatus: req.body.Subscription.status,
                   };
                //call subscription update

                   console.log (SubscriptionUpdate);                 
               break;
            default: 
         
          } 


          res.status(200).json({  message: `${eventType} processed` });  
      } catch (error) {
        next(error);
      }
  };
}

export default webhookForBillingController;