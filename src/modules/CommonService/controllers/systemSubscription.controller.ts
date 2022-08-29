import { NextFunction, Request, Response } from 'express';
import { IPartyUserResponse, IRequestWithSystem, IRequestWithUser } from '@/common/interfaces/party.interface';
import { ICustomerAccount } from '@/common/interfaces/customerAccount.interface';
import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';
import PartyService from '@/modules/Party/services/party.service';
import SubscriptionService from '@/modules/Subscriptions/services/subscriptions.service';
import { ISubscriptions } from '@/common/interfaces/subscription.interface';
import ResourceService from '@/modules/Resources/services/resource.service';
import SystemSubscriptionService from '@/modules/CommonService/services/systemSubscription.service';
import axios from 'axios';
import * as _ from 'lodash';
import { IResource } from '@/common/interfaces/resource.interface';
import config from '@config/index';
import { CreateProductPricingDto } from '@/modules/ProductCatalog/dtos/productCatalog.dto';
import catalogPlanProductModel from '@/modules/ProductCatalog/models/catalogPlanProduct.model';
import {CreateUserDto} from '@/modules/Party/dtos/party.dto'

class SystemSubscriptionController {

  public customerAccountService = new CustomerAccountService();
  public partyService = new PartyService();
  
  public resourceService = new ResourceService();
  public systemSubscriptionService = new SystemSubscriptionService();

  public createSystemSubscription = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { body: { eventType }, user: { partyId } = {}, systemId } = req;
      let createdResponse;
      const createdBy = systemId || partyId;
      switch (eventType) {
        case "CustomerCreated":
          const { body: { Customer: { firstName, lastName, id, primaryEmail, primaryPhone, companyName } } } = req;
          const customerAccountData = {
            customerAccountName: companyName || `${firstName} ${lastName}`,
            customerAccountDescription: null,
            parentCustomerAccountId: null,
            customerAccountType: null,
          };
          
          const partyData: CreateUserDto =
          {
            partyName: companyName || `${firstName} ${lastName}`,
            partyDescription: null,
            parentPartyId: null,
            firstName,
            lastName,
            userId: id,
            password: "",
            email: primaryEmail,
            mobile: primaryPhone,
            partyUserStatus: "DR",
            timezone: "",
            customerAccountId: "",
            adminYn: false,
          };
          
          const responseCustomerAccount = await this.systemSubscriptionService.createCustomerAccount(customerAccountData, partyData, createdBy)
          createdResponse = responseCustomerAccount;
          break;

        case "SubscriptionCreated":
          const { body: { Subscription: { catalogPlanId, subscriptionStatus, subscriptionTerminatedAt , 
                                          subscriptionCommitmentType= 'AC', subscriptionActivatedAt, 
                                          subscriptionConsent, customerAccountKey } } } = req;

          const subscriptionData = {
            subscriptionStatus,
            subscriptionConsent,
            subscriptionActivatedAt,
            subscriptionTerminatedAt,
            subscriptionCommitmentType  ,
            catalogPlanId
          }

          console.log (req);
          const responseSubscription = await this.systemSubscriptionService.createSubscription(subscriptionData, createdBy, customerAccountKey); 
          createdResponse = responseSubscription;
          break;
          
        default:
          break;
      }
          
      return res.status(200).json({ data:createdResponse });
          
      } catch (error) {
        console.log("errror", error)
        next(error);
    } // end of try
  };
}

export default SystemSubscriptionController;