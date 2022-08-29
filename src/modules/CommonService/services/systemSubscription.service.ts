import DB from '@/database';
import axios from 'axios';
import config from '@config/index';
import { HttpException } from '@/common/exceptions/HttpException';
import bcrypt from 'bcrypt';

import SubscriptionService from '@/modules/Subscriptions/services/subscriptions.service';
import SendMailService from '@/modules/Messaging/services/sendMail.service'
import tableIdService from '@/modules/CommonService/services/tableId.service';

import { Notification } from '@/common/interfaces/notification.interface';
import { customerAccountType, ICustomerAccount } from '@/common/interfaces/customerAccount.interface';
import { IPartyUser, IParty } from '@/common/interfaces/party.interface';
import { ISubscriptions } from '@/common/interfaces/subscription.interface';
import {CreateCustomerAccountDto} from '@/modules/CustomerAccount/dtos/customerAccount.dto'
import {CreateSubscriptionDto} from '@/modules/Subscriptions/dtos/subscriptions.dto'
import {CreateUserDto} from '@/modules/Party/dtos/party.dto'

import { PartyModel } from '@/modules/Party/models/party.model';
import { PartyUserModel } from '@/modules/Party/models/partyUser.model';
import urlJoin from 'url-join';

const nodeMailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

class systemSubscriptionService {

    public executorService = DB.ExecutorService; 
    public customerAccount = DB.CustomerAccount; 
    public party = DB.Party; 
    public partyUser = DB.PartyUser; 
    public notification = DB.Notification;
    public catalogPlan = DB.CatalogPlan;
    public subscription = DB.Subscription; 
    public subscriptionService = new SubscriptionService();
    public sendMailService = new SendMailService();
    public tableIdService = new tableIdService();

  /**
   * @param {CreateCustomerAccountDto} customerAccountData
   * @param {Object} partyData
   * @param {string} createdBy
   */
   public async createCustomerAccount(customerAccountData:CreateCustomerAccountDto, partyData: CreateUserDto, createdBy: string): Promise<object> {

    //0. Data Prep
    var returnResult = {};
    const currentDate = new Date();
    const CustomerAccountDataNew = {...customerAccountData,
      customerAccountType: "CO" as customerAccountType}

    const 
    {
      partyName,
      partyDescription,
      parentPartyId,
      firstName,
      lastName,
      userId,
      email,
      mobile,
      adminYn,
    } = partyData; 
    let tableIdTableName = 'CustomerAccount';
    let responseTableIdData = await this.tableIdService.issueTableId(tableIdTableName);
    let customerAccountId = responseTableIdData.tableIdFinalIssued;
    let timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    tableIdTableName = 'Party';
    responseTableIdData = await this.tableIdService.issueTableId(tableIdTableName);
    let partyId = responseTableIdData.tableIdFinalIssued;

    try {
        return await DB.sequelize.transaction(async t => {
          //1. create a customer account
          const createdCustomerAccount: ICustomerAccount = await this.customerAccount.create({
            ...CustomerAccountDataNew,
            customerAccountId: customerAccountId,
            createdBy: partyId,
          }, {transaction: t});
          const customerAccountKey = createdCustomerAccount.customerAccountKey;


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

          let partyKey = createdParty.partyKey;
          //let hashedPassword = await bcrypt.hash(password, 10);
          let password = config.defaultPassword;
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
              partyUserStatus: "AC",
              adminYn: true,
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
          let fuseBillInterface:boolean =   false; 
          let headers = {Authorization: `Basic ${config.Fulsebill.apiKey}`}; 

          await axios({
            method: 'post',
            url: config.Fulsebill.createCustomerUrl,
            data: fuseBillCreateCustomer,
            headers: headers,
          })
            .then(async (res: any) => {
              console.log(`got interface result -- ${res}`);
              fuseBillInterface = true;
            })
            .catch(error => {
              //console.log(error);
              console.log (error.response.data.Errors);
            });

          //4. prep sending email to customer
          const emailTemplateSource = fs.readFileSync(path.join(__dirname, '../../Messaging/templates/emails/email-body/newCustomerAccount.hbs'), 'utf8');
          const template = handlebars.compile(emailTemplateSource);
          let name = createdPartyUser.firstName
          const htmlToSend = template({ name });
          const mailOptions = {
            to: createdPartyUser.email,
            from: "service@nexclipper.io",
            subject: 'Welcome Onboard - NexClipper',
            html: htmlToSend
          }
          const notificationMessage = JSON.parse(JSON.stringify(mailOptions)); 
          
          //5 create notification history
          tableIdTableName = 'Notification';
          responseTableIdData = await this.tableIdService.issueTableId(tableIdTableName);
          let notificationId = responseTableIdData.tableIdFinalIssued;
          
          const newNotification = {
            notificationId: notificationId,
            partyKey: partyKey,
            createdBy: createdBy,
            createdAt: currentDate,
            notificationStatutsUpdatedAt: currentDate,
            customerAccountKey,
            notificationChannelType: "email",
            notificationType: "newCustomerAccount",
            notificationChannel: createdPartyUser.email,
            notificationMessage: notificationMessage,
            notificationStatus: "ST",
            }
      
          const createNotificationData: Notification = await this.notification.create(newNotification, {transaction: t});

          //4.1 send email to customer
          let emailSent: boolean = false;
          await this.sendMailService.sendMailGeneral(mailOptions);
          emailSent = true;
          console.log ("success!!!!!");  
          //6. return message
          return {customerAccountId: createdCustomerAccount.customerAccountId,
              customerAccountKey: createdCustomerAccount.customerAccountKey,
              customerAccountName: createdCustomerAccount.customerAccountName,
              customerAccountType: createdCustomerAccount.customerAccountType,
              firstName:  createdPartyUser.firstName, 
              lastName:  createdPartyUser.lastName, 
              userId:  createdPartyUser.userId, 
              email:  createdPartyUser.email, 
              mobile:  createdPartyUser.mobile,
              emailSent: emailSent,
              notificationId: notificationId,
              fuseBillInterface: fuseBillInterface,
              }
      });           
    } catch(err){
      console.log (err); 
      throw new HttpException(500, "Unknown error while creating account");
    }

    return returnResult;
}

  /**
   * @param {CreateSubscriptionDto} subscriptionData
   * @param {string} createdBy
   * @param {number} customerAccountKey;
   */
   public async createSubscription(subscriptionData:CreateSubscriptionDto, createdBy: string, customerAccountKey: number): Promise<object> { 
    //0. prep data. 
    const custPartyQuery = {where: {customerAccountKey, deletedAt: null},
            include: [
              {
                model: PartyModel,
                where: { deletedAt: null},
                include: [
                {
                    model: PartyUserModel,
                    where: {deletedAt: null, adminYn: true},
                }
              ]}]
    };
    const resultCustomerAccount = await this.customerAccount.findOne(custPartyQuery);
    console.log (resultCustomerAccount);
    
    let tableIdTableName = 'Subscription';
    let responseTableIdData = await this.tableIdService.issueTableId(tableIdTableName);
    let subscriptionId = responseTableIdData.tableIdFinalIssued;

    const catalogPlan = await this.catalogPlan.findOne({ where: { catalogPlanId: subscriptionData.catalogPlanId } })
    const createObj = {
                ...subscriptionData,
                subscriptionId,
                catalogPlanKey: catalogPlan.catalogPlanKey,
                customerAccountKey,
                createdBy,
              }

    //1.create subscription
    try {
      return await DB.sequelize.transaction(async t => {
        const newSubscription: ISubscriptions = await this.subscription.create(createObj,{ transaction: t },);
              //delete newSubscription.subscriptionKey;
    
    //2. call fusebill api

    //3. send notification to customer
    /*
              const emailTemplateSource = fs.readFileSync(path.join(__dirname, '../../Messaging/templates/emails/email-body/newCustomerAccount.hbs'), 'utf8');
              const template = handlebars.compile(emailTemplateSource);
              let name = resultCustomerAccount.customerAccountName;
              const htmlToSend = template({ name });
              const mailOptions = {
                to: createdPartyUser.email,
                from: "service@nexclipper.io",
                subject: 'Welcome Onboard - NexClipper',
                html: htmlToSend
              }
              const notificationMessage = JSON.parse(JSON.stringify(mailOptions)); 
              
              //5 create notification history
              tableIdTableName = 'Notification';
              responseTableIdData = await this.tableIdService.issueTableId(tableIdTableName);
              let notificationId = responseTableIdData.tableIdFinalIssued;
              
              const newNotification = {
                notificationId: notificationId,
                partyKey: partyKey,
                createdBy: createdBy,
                createdAt: currentDate,
                notificationStatutsUpdatedAt: currentDate,
                customerAccountKey,
                notificationChannelType: "email",
                notificationType: "newCustomerAccount",
                notificationChannel: createdPartyUser.email,
                notificationMessage: notificationMessage,
                notificationStatus: "ST",
                }  
          
              const createNotificationData: Notification = await this.notification.create(newNotification, {transaction: t});
     */         
        return newSubscription;
    });
   } catch(err){
    console.log (err); 
    throw new HttpException(500, "Unknown error while creating account");
  }
}

 /**
   * @param {string} clusterUuid
  */
  public async checkSudoryClient(clusterUuid: string): Promise<object> {
    var clientData;
    var clientUuid = "";
    var expirationTime;
    var executorServerUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathSession;
    var resultReturn;
    var validClient:boolean;
    const sessionQueryParameter = `?q=(eq%20cluster_uuid%20"${clusterUuid}")`; 
    executorServerUrl = executorServerUrl + sessionQueryParameter;
    
    await axios(
    {
        method: 'get',
        url: `${executorServerUrl}`,
        headers: { 'x_auth_token': `${config.sudoryApiDetail.authToken}` }
    }).then(async (res: any) => {
        if(!res.data[0]) {  
          console.log(`Executor/Sudory client not found yet from cluster: ${clusterUuid}`); 
          resultReturn = {
            clientUuid: "notfound",
            validClient: false,
          };
          return resultReturn;
        };
        clientData = Object.assign({},res.data[0]); 
        clientUuid = clientData.uuid;
        expirationTime = new Date(clientData.expiration_time);
        let currentTime = new Date();
        if (expirationTime> currentTime)
          validClient = true;
        else validClient = false;

        resultReturn = {
          clientUuid: clientUuid,
          validClient: validClient,
        };
        console.log (resultReturn)
        console.log(`Successful to run API to search Executor/Sudory client ${clientUuid}`);
    }).catch(error => {
        console.log(error);
        throw new HttpException(500, "Unknown error while searching executor/sudory client");
    });

    return resultReturn;

  }


}
export default systemSubscriptionService;