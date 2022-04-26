import { NextFunction, Request, Response } from 'express';
import { IPartyUserResponse, IRequestWithSystem, IRequestWithUser } from '@/common/interfaces/party.interface';
import { ICustomerAccount } from '@/common/interfaces/customerAccount.interface';
import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';
import PartyService from '@/modules/Party/services/party.service';
import SubscriptionService from '@/modules/Subscriptions/services/subscriptions.service';
import { ISubscriptions } from '@/common/interfaces/subscription.interface';
import ResourceService from '@/modules/Resources/services/resource.service';
import axios from 'axios';
import * as _ from 'lodash';
import { IResource } from '@/common/interfaces/resource.interface';
import config from 'config';
import { CreateProductPricingDto } from '@/modules/ProductCatalog/dtos/productCatalog.dto';
import catalogPlanProductModel from '@/modules/ProductCatalog/models/catalogPlanProduct.model';
class webhookForBillingController {

  public customerAccountService = new CustomerAccountService();
  public partyService = new PartyService();
  public subscriptionService = new SubscriptionService();
  public resourceService = new ResourceService();
  public receiveBillingInterface = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { body: { eventType }, user: { partyId }, systemId, customerAccountKey } = req;

      switch (eventType) {
        case "CustomerCreated":
          const { body: { Customer: { firstName, lastName, id, primaryEmail, primaryPhone, companyName } } } = req;
          const customerAccountData = {
            customerAccountName: companyName || `${firstName} ${lastName}`,
            customerAccountDescription: null,
            parentCustomerAccountId: null,
            customerAccountType: null
          };
          const createdCustomerAccount: ICustomerAccount = await this.customerAccountService.createCustomerAccount(customerAccountData, systemId || partyId);
          const partyData =
          {
            partyName: companyName || `${firstName} ${lastName}`,
            partyDescription: null,
            parentPartyId: null,
            partyType: 'US',
            customerAccountKey,
            createdBy: systemId || partyId,
            firstName,
            lastName,
            userId: id,
            password: null,
            email: primaryEmail,
            mobile: primaryPhone,
            partyUserStatus: "DRAFT",
            customerAccountId: createdCustomerAccount.customerAccountId
          };
          await this.partyService.createUser(partyData, createdCustomerAccount.customerAccountKey, systemId || partyId);
          break;
        case "SubscriptionCreated":
          const { body: { Subscription: { customerId, id: subscriptionExtSubscriptionId, planName, createdTimestamp, activatedTimestamp, terminatedTimeStamp } } } = req;

          let fusebillResponse;
          await axios(
            {
              method: 'get',
              url: `${config.fuseBillApiDetail.baseURL}subscriptions/${subscriptionExtSubscriptionId}`,
              headers: { 'Authorization': `Basic ${config.fuseBillApiDetail.apiKey}` }
            }).then(async (res: any) => {
              fusebillResponse = res.data;
            }).catch(error => {
            });
          const { status, nextPeriodStartDate, lastPeriodStartDate, subscriptionCommitmentType = "AC", planCode } = fusebillResponse ;
          let subscriptionStatus;
          if (status === "Active") {
            subscriptionStatus = 'AC'
          }
          const subscriptionData = {
            subscriptionStatus: subscriptionStatus,
            subscriptionConsent: true,
            subscriptionActivatedAt: nextPeriodStartDate,
            subscriptionTerminatedAt: lastPeriodStartDate,
            subscriptionCommitmentType: subscriptionCommitmentType,
            catalogPlanId: planCode

          }
          const newSubscription: ISubscriptions = await this.subscriptionService.createSubscription(subscriptionData, partyId, systemId, customerAccountKey);

          const productDetails = fusebillResponse.subscriptionProductscd.filter((data) => { data.customFields });
          const { key, value } = productDetails[0].customFields;
          const { productStatus, productCode } = productDetails[0].planProduct;

          const customerAccountId = await this.customerAccountService.getCustomerAccountIdByKey(customerAccountKey);
          const resource = await this.resourceService.getResourceByTypeCustomerAccountId(value, customerAccountId);
          const {resourceId, createdAt, deletedAt} = resource[0];
          let st;
          if(productStatus == 'Active'){
            st =  "AC" ;
          }
          const subscribeProduct = {
            "subscribedProductFrom": createdAt,
            "subscribedProductTo": deletedAt ,
            "catalogPlanProductType": "ON",
            "resourceId": resourceId,
            subscribedProductStatus: st

          }
        await this.subscriptionService.createSubscribedProduct(subscribeProduct, partyId, systemId, customerAccountKey, productCode);   
        break;
        case "SubscriptionUpdated":
          await this.subscriptionService.updateSubscription(subscriptionExtSubscriptionId, subscriptionData, partyId, systemId);
          break;
        default:
          break;

      }


      res.status(200).json({ message: `${eventType} processed` });
    } catch (error) {
      next(error);
    }
  };
}

export default webhookForBillingController;