import { NextFunction, Request, Response } from 'express';
import { IPartyUserResponse, IRequestWithSystem, IRequestWithUser } from '@/common/interfaces/party.interface';
import { ICustomerAccount } from '@/common/interfaces/customerAccount.interface';
import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';
import PartyService from '@/modules/Party/services/party.service';
import SubscriptionService from '@/modules/Subscriptions/services/subscriptions.service';
import { ISubscriptions } from '@/common/interfaces/subscription.interface';
import axios from 'axios';
class webhookForBillingController {

  public customerAccountService = new CustomerAccountService();
  public partyService = new PartyService();
  public subscriptionService = new SubscriptionService();
  public receiveBillingInterface = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const{body:{eventType}, user:{partyId}, systemId, customerAccountKey} = req;

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
          const { body: { Subscription: { customerId, planCode, id: subscriptionExtSubscriptionId, planName, createdTimestamp, activatedTimestamp, terminatedTimeStamp, status } } } = req;

          const subscriptionData = {
            subscriptionStatus: status,
            subscriptionConsent: true,
            subscriptionActivatedAt: activatedTimestamp,
            subscriptionTerminatedAt: terminatedTimeStamp,
            subscriptionCommitmentType: status,
            catalogPlanId: planCode

          }
          const newSubscription: ISubscriptions = await this.subscriptionService.createSubscription(subscriptionData, partyId, systemId, customerAccountKey);
          // console.log("newSubscription=============", newSubscription)
          let fusebillProducts ;
          await axios(
            {
            method:'get',
            url:`https://secure.fusebill.com/v1/Plans/?query=code:${planCode}`, 
            headers: {'Authorization': 'Basic MDppU0dtQXk2R1BBQ1dUd2hEOXJ0SWFtcE5wMjNWaFR2Vm1xMWdhZUtDdEMxN0k3NGlZSTVMcDhEbjdaenByTDRa'}
          }).then(async (res:any)=>{
            console.log("res----------------------------------", res.data)
             await axios(
              {
              method:'get',
              url:`https://secure.fusebill.com/v1/plans/${res.data[0].id}/planProducts`,
              timeout: 60000, 
              headers: {'Authorization': 'Basic MDppU0dtQXk2R1BBQ1dUd2hEOXJ0SWFtcE5wMjNWaFR2Vm1xMWdhZUtDdEMxN0k3NGlZSTVMcDhEbjdaenByTDRa'}
            }).then(productRes=>{fusebillProducts = productRes.data}).catch(error=>{
              console.log("error in 2 ", error)
            });
          }).catch(error=>{
            console.log("error11111111111111111111111111111111111111111111111", error)
          });


          console.log("fusebillProducts", fusebillProducts);
          // res.status(200).json({ message: `${eventType} processed` , data:fusebillProducts});
          // const Subscription = {
          //   subscriptionCustomerId: customerId,
          //   subscriptionPlanCode: planCode,
          //   subscriptionExtSubscriptionId,
          //   subscriptionPlanName: planName,
          //   subscriptionCreatedAt: createdTimestamp,
          //   subscriptionActivatedAt: activatedTimestamp,
          //   subscrptionStatus: status,
          // };
          // call subscription creation    
          // need to call subscription api in Fusebill to get plan product information

          console.log(newSubscription);
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

          console.log(SubscriptionUpdate);
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