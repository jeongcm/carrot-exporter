import DB from '@/database';
import axios from 'common/httpClient/axios';
import config from '@config/index';
import { HttpException } from '@/common/exceptions/HttpException';

import SubscriptionService from '@/modules/Subscriptions/services/subscriptions.service';
import SendMailService from '@/modules/Messaging/services/sendMail.service';
import tableIdService from '@/modules/CommonService/services/tableId.service';

import NotificationService from '@/modules/Notification/services/notification.service';//import { Notification } from '@/common/interfaces/notification.interface';

import { ISubscriptions } from '@/common/interfaces/subscription.interface';
import { CreateSubscriptionDto } from '@/modules/Subscriptions/dtos/subscriptions.dto';
import { ICatalogPlan } from '@/common/interfaces/productCatalog.interface';
import SudoryService from '@/modules/CommonService/services/sudory.service';

const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

class systemSubscriptionService {
  public executorService = DB.ExecutorService;
  public notificationService = new NotificationService();
  public subscriptionService = new SubscriptionService();
  public sendMailService = new SendMailService();
  public customerAccount = DB.CustomerAccount;
  public party = DB.Party;
  public partyUser = DB.PartyUser;
  public catalogPlan = DB.CatalogPlan;
  public notification = DB.Notification;
  public tableIdService = new tableIdService();
  public sudoryService = new SudoryService();

  /**
   * @param {CreateSubscriptionDto} CreateSubscriptionDto
   * @param {string} partyId
   * @param {number} customerAccountKey;
   */
  public async createSubscription(subscriptionData: CreateSubscriptionDto, partyId: string, customerAccountKey: number): Promise<object> {
    // check for customer account on fusebill server
    const customerDetails = await this.customerAccount.findOne({ where: { customerAccountKey } });
    const partyUserDeatils = await this.partyUser.findOne({ where: { partyUserId: partyId } });
    console.log('partyUserDeatils', partyUserDeatils);
    const response = await axios({
      method: 'get',
      url: `${config.fuseBillApiDetail.createCustomerUrl}/?query=reference:${customerDetails.customerAccountId}`,
      headers: { Authorization: `Basic ${config.fuseBillApiDetail.apiKey}` },
    });
    const fuseBillCustomerDetails = response.data[0];
    if (!fuseBillCustomerDetails) {
      throw new HttpException(404, `Can't find customerAccount information on fusebill: ${customerDetails.customerAccountId}`);
    }
    //2.create subscription
    const newSubscriptions: ISubscriptions = await this.subscriptionService.createSubscription(subscriptionData, partyId, customerAccountKey);
    //3. pull catalogPlan details to get fusbill id
    const catalogPlans: ICatalogPlan = await this.catalogPlan.findOne({ where: { catalogPlanId: subscriptionData.catalogPlanId } });

    if (!catalogPlans) {
      throw new HttpException(404, `Can't find catalog palns information : ${subscriptionData.catalogPlanId}`);
    }

    //4. call fusebill api to add subscription
    const fusebillSubscriptionPayload = {
      customerID: fuseBillCustomerDetails.id, // refrence
      planFrequencyID: catalogPlans.billingPlanFrequencyId,
    };
    const subscriptionAtFuseBill = await axios({
      method: 'post',
      url: `${config.fuseBillApiDetail.baseURL}subscriptions`,
      data: fusebillSubscriptionPayload,
      headers: { Authorization: `Basic ${config.fuseBillApiDetail.apiKey}` },
    });

    //5. activate subscription
    await axios({
      method: 'post',
      url: `${config.fuseBillApiDetail.baseURL}SubscriptionActivation/${subscriptionAtFuseBill.data.id}`,
      data: fusebillSubscriptionPayload,
      headers: { Authorization: `Basic ${config.fuseBillApiDetail.apiKey}` },
    });
    //6. send notification to customer
    const emailTemplateSource = fs.readFileSync(path.join(__dirname, '../../Messaging/templates/emails/email-body/newSubscriptions.hbs'), 'utf8');
    const template = handlebars.compile(emailTemplateSource);
    const name = fuseBillCustomerDetails.firstName;
    const htmlToSend = template({ name });
    const mailOptions = {
      to: fuseBillCustomerDetails.primaryEmail,
      from: 'service@nexclipper.io',
      subject: 'New Subscription - NexClipper',
      html: htmlToSend,
    };
    const notificationMessage = JSON.parse(JSON.stringify(mailOptions));

    //7. create notification history
    const tableIdTableName = 'Notification';
    let responseTableIdData = await this.tableIdService.issueTableId(tableIdTableName);
    responseTableIdData = await this.tableIdService.issueTableId(tableIdTableName);
    const notificationId = responseTableIdData.tableIdFinalIssued;

    const newNotification = {
      notificationId: notificationId,
      partyKey: partyUserDeatils.partyKey,
      createdBy: partyId,
      createdAt: new Date(),
      notificationStatutsUpdatedAt: new Date(),
      customerAccountKey,
      notificationChannelType: 'email',
      notificationType: 'newSubsctiptionAdded',
      notificationChannel: fuseBillCustomerDetails.primaryEmail,
      notificationMessage: notificationMessage,
      notificationStatus: 'ST',
    };

    await this.notification.create(newNotification);

    //8. send email to customer
    const mailSentDetail = await this.sendMailService.sendMailGeneral(mailOptions);
    console.log('mailSentDetail', mailSentDetail);
    console.log('success!!!!!');
    //6. return message
    return newSubscriptions;
  }

  /**
   * @param {string} clusterUuid
   */
  public async checkSudoryClient(clusterUuid: string): Promise<object> {
    let clientData;
    let clientUuid = '';
    let expirationTime;
    let executorServerUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathSession;
    let resultReturn;
    let validClient: boolean;
    const sessionQueryParameter = `?q=(eq%20cluster_uuid%20"${clusterUuid}")`;
    executorServerUrl = executorServerUrl + sessionQueryParameter;

    await axios({
      method: 'get',
      url: `${executorServerUrl}`,
      headers: { x_auth_token: `${config.sudoryApiDetail.authToken}` },
    })
      .then(async (res: any) => {
        if (!res.data[0]) {
          console.log(`Executor/Sudory client not found yet from cluster: ${clusterUuid}`);
          resultReturn = {
            clientUuid: 'notfound',
            validClient: false,
          };
          return resultReturn;
        }
        clientData = Object.assign({}, res.data[0]);
        clientUuid = clientData.uuid;
        expirationTime = new Date(clientData.expiration_time);
        const currentTime = new Date();
        if (expirationTime > currentTime) validClient = true;
        else validClient = false;

        resultReturn = {
          clientUuid: clientUuid,
          validClient: validClient,
        };
        console.log(resultReturn);
        console.log(`Successful to run API to search Executor/Sudory client ${clientUuid}`);
      })
      .catch(error => {
        console.log(error);
        throw new HttpException(500, 'Unknown error while searching executor/sudory client');
      });

    return resultReturn;
  }
}
export default systemSubscriptionService;
