import DB from '@/database';
import axios from 'common/httpClient/axios';
import config from '@config/index';
import { HttpException } from '@/common/exceptions/HttpException';
//import bcrypt from 'bcrypt';

import SubscriptionService from '@/modules/Subscriptions/services/subscriptions.service';
import SendMailService from '@/modules/Messaging/services/sendMail.service';
import tableIdService from '@/modules/CommonService/services/tableId.service';

import NotificationService from '@/modules/Notification/services/notification.service';
//import { Notification } from '@/common/interfaces/notification.interface';
import { IPartyUser, IParty } from '@/common/interfaces/party.interface';
import { customerAccountType, ICustomerAccount } from '@/common/interfaces/customerAccount.interface';
import { ISubscriptions } from '@/common/interfaces/subscription.interface';
import { CreateCustomerAccountDto } from '@/modules/CustomerAccount/dtos/customerAccount.dto';
import { CreateSubscriptionDto } from '@/modules/Subscriptions/dtos/subscriptions.dto';
import { CreateUserDto } from '@/modules/Party/dtos/party.dto';
//import urlJoin from 'url-join';
import { ICatalogPlan } from '@/common/interfaces/productCatalog.interface';
import SudoryService from '@/modules/CommonService/services/sudory.service';

//const nodeMailer = require('nodemailer');
//const mg = require('nodemailer-mailgun-transport');
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
   * @param {CreateCustomerAccountDto} customerAccountData
   * @param {Object} partyData
   * @param {string} createdBy
   */
  public async createCustomerAccount(customerAccountData: CreateCustomerAccountDto, partyData: CreateUserDto, createdBy: string): Promise<object> {
    //0. Data Prep
    const returnResult = {};
    const currentDate = new Date();
    const CustomerAccountDataNew = { ...customerAccountData, customerAccountType: 'CO' as customerAccountType };
    const { partyName, partyDescription, parentPartyId, firstName, lastName, userId, email, mobile, language } = partyData;

    let tableIdTableName = 'CustomerAccount';
    let responseTableIdData = await this.tableIdService.issueTableId(tableIdTableName);
    const customerAccountId = responseTableIdData.tableIdFinalIssued;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    tableIdTableName = 'Party';
    responseTableIdData = await this.tableIdService.issueTableId(tableIdTableName);
    const partyId = responseTableIdData.tableIdFinalIssued;

    try {
      return await DB.sequelize.transaction(async t => {
        //1. create a customer account
        const createdCustomerAccount: ICustomerAccount = await this.customerAccount.create(
          {
            ...CustomerAccountDataNew,
            customerAccountId: customerAccountId,
            createdBy: partyId,
          },
          { transaction: t },
        );
        const customerAccountKey = createdCustomerAccount.customerAccountKey;
        console.log('1. createdCustomerAccount', createdCustomerAccount);

        //1-1. create multi-tenant VM secret data

        const getActiveCustomerAccounts: ICustomerAccount[] = await this.customerAccount.findAll({
          where: { deletedAt: null },
        });
        let auth = '\n' + `users: ` + '\n';
        getActiveCustomerAccounts.forEach(customerAccount => {
          auth =
            auth +
            `- username: "S${customerAccount.customerAccountId}"
password: "${customerAccount.customerAccountId}"
url_prefix: "${config.victoriaMetrics.vmMultiBaseUrlSelect}/${customerAccount.customerAccountKey}/prometheus/"
- username: "I${customerAccount.customerAccountId}"
password: "${customerAccount.customerAccountId}"
url_prefix: "${config.victoriaMetrics.vmMultiBaseUrlInsert}/${customerAccount.customerAccountKey}/prometheus/"` +
            '\n';
        });
        const authBuff = new Buffer(auth);
        const base64Auth = authBuff.toString('base64');
        //call sudory to patch VM multiline secret file
        const sudoryServiceName = 'Update VM Secret';
        const summary = 'Update VM Secret';
        const clusterUuid = config.victoriaMetrics.vmMultiClusterUuid;
        const templateUuid = '00000000000000000000000000000037'; //tmplateUuid will be updated
        const step = [
          {
            args: {
              name: config.victoriaMetrics.vmMultiSecret,
              namespace: config.victoriaMetrics.vmMultiNamespaces,
              patch_type: 'json',
              patch_data: [
                {
                  op: 'replace',
                  path: '/data/auth.yml',
                  value: base64Auth,
                },
              ],
            },
          },
        ];
        const subscribedChannel = config.sudoryApiDetail.channel_webhook;
        await this.sudoryService.postSudoryService(
          sudoryServiceName,
          summary,
          clusterUuid,
          templateUuid,
          step,
          customerAccountKey,
          subscribedChannel,
        );
        //2. create a party & party user
        const createdParty: IParty = await this.party.create(
          {
            partyId: partyId,
            partyName: partyName,
            partyDescription: partyDescription,
            parentPartyId: parentPartyId,
            partyType: 'US',
            customerAccountKey,
            createdBy: createdBy,
            createdAt: currentDate,
          },
          { transaction: t },
        );

        const partyKey = createdParty.partyKey;
        //let hashedPassword = await bcrypt.hash(password, 10);
        const password = config.defaultPassword;
        const createdPartyUser: IPartyUser = await this.partyUser.create(
          {
            partyUserId: partyId,
            partyKey: createdParty.partyKey,
            createdBy: createdBy,
            firstName: firstName,
            lastName: lastName,
            userId: userId,
            mobile: mobile,
            password: password,
            email: email,
            timezone: timeZone,
            isEmailValidated: false,
            partyUserStatus: 'AC',
            adminYn: true,
            language: language,
          },
          { transaction: t },
        );

        //3. fusebill interface
        const fuseBillCreateCustomer = {
          firstName: firstName,
          lastName: lastName,
          companyName: partyName,
          primaryEmail: email,
          primaryPhone: mobile,
          reference: customerAccountId,
        };
        let fuseBillInterface = false;
        const headers = { Authorization: `Basic ${config.fuseBillApiDetail.apiKey}` };
        const fuseBillCustomer = await axios({
          method: 'post',
          url: config.fuseBillApiDetail.createCustomerUrl,
          data: fuseBillCreateCustomer,
          headers: headers,
        });
        if (fuseBillCustomer.data) {
          fuseBillInterface = true;
        }
        const customerActivationPayload = {
          customerId: fuseBillCustomer.data.id,
          activateAllSubscriptions: true,
          activateAllDraftPurchases: true,
          temporarilyDisableAutoPost: false,
        };
        await axios({
          method: 'post',
          url: `${config.fuseBillApiDetail.baseURL}customeractivation`,
          data: customerActivationPayload,
          headers: headers,
        });

        //4. prep sending email to customer
        const emailTemplateSource = fs.readFileSync(
          path.join(__dirname, '../../Messaging/templates/emails/email-body/newCustomerAccount.hbs'),
          'utf8',
        );
        const template = handlebars.compile(emailTemplateSource);
        const name = createdPartyUser.firstName;
        const htmlToSend = template({ name });
        const mailOptions = {
          to: createdPartyUser.email,
          from: 'service@nexclipper.io',
          subject: 'Welcome Onboard - NexClipper',
          html: htmlToSend,
        };
        const notificationMessage = JSON.parse(JSON.stringify(mailOptions));

        //5 create notification history
        tableIdTableName = 'Notification';
        responseTableIdData = await this.tableIdService.issueTableId(tableIdTableName);
        const notificationId = responseTableIdData.tableIdFinalIssued;

        const newNotification = {
          notificationId: notificationId,
          partyKey: partyKey,
          createdBy: createdBy,
          createdAt: currentDate,
          notificationStatutsUpdatedAt: currentDate,
          customerAccountKey,
          notificationChannelType: 'email',
          notificationType: 'newCustomerAccount',
          notificationChannel: createdPartyUser.email,
          notificationMessage: notificationMessage,
          notificationStatus: 'ST',
        };

        await this.notification.create(newNotification, { transaction: t });

        //4.1 send email to customer
        let emailSent = false;
        await this.sendMailService.sendMailGeneral(mailOptions);
        emailSent = true;
        console.log('success!!!!!');
        //6. return message
        return {
          customerAccountId: createdCustomerAccount.customerAccountId,
          customerAccountKey: createdCustomerAccount.customerAccountKey,
          customerAccountName: createdCustomerAccount.customerAccountName,
          customerAccountType: createdCustomerAccount.customerAccountType,
          firstName: createdPartyUser.firstName,
          lastName: createdPartyUser.lastName,
          userId: createdPartyUser.userId,
          email: createdPartyUser.email,
          mobile: createdPartyUser.mobile,
          emailSent: emailSent,
          notificationId: notificationId,
          fuseBillInterface: fuseBillInterface,
        };
      });
    } catch (err) {
      console.log(err);
      throw new HttpException(500, 'Unknown error while creating account');
    }
  }

  /**
   * @param {CreateCustomerAccountDto} CreateSubscriptionDto
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
