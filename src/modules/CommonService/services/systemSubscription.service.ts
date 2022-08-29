import DB from '@/database';
import axios from 'axios';
import config from '@config/index';
import { HttpException } from '@/common/exceptions/HttpException';
import bcrypt from 'bcrypt';

import SubscriptionService from '@/modules/Subscriptions/services/subscriptions.service';
import SendMailService from '@/modules/Messaging/services/sendMail.service'
import tableIdService from '@/modules/CommonService/services/tableId.service';

import NotificationService from '@/modules/Notification/services/notification.service'
import { Notification } from '@/common/interfaces/notification.interface';
import { IPartyUser, IParty } from '@/common/interfaces/party.interface';
import { customerAccountType, ICustomerAccount } from '@/common/interfaces/customerAccount.interface';
import { ISubscriptions } from '@/common/interfaces/subscription.interface';
import {CreateCustomerAccountDto} from '@/modules/CustomerAccount/dtos/customerAccount.dto'
import {CreateSubscriptionDto} from '@/modules/Subscriptions/dtos/subscriptions.dto'
import {CreateUserDto} from '@/modules/Party/dtos/party.dto'
import urlJoin from 'url-join';

const nodeMailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
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
    public notification = DB.Notification;
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
          console.log ("1. createdCustomerAccount", createdCustomerAccount);

    //2. create a party user    
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
    console.log ("2. createdParty", createdParty);
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
      },
      { transaction: t },
    );
    console.log ("3. createdPartyUser", createdPartyUser);  
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
    let headers = {Authorization: `Basic ${config.fuseBillApiDetail.apiKey}`}; 
    console.log (headers); 
    await axios({
      method: 'post',
      url: config.fuseBillApiDetail.createCustomerUrl,
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
    console.log ("5. createNotificationData", createNotificationData);  

    //4.1 send email to customer
    let emailSent: boolean = false;
    await this.sendMailService.sendMailGeneral(mailOptions);
    emailSent = true;
    console.log ("success!!!!!");  
    //6. return message
    return {customerAccountId: createdCustomerAccount.customerAccountId,
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

   }

  /**
   * @param {CreateCustomerAccountDto} CreateSubscriptionDto
   * @param {string} partyId
   * @param {number} customerAccountKey;
   */
   public async createSubscription(subscriptionData:CreateSubscriptionDto, partyId: string, customerAccountKey: number): Promise<object> { 

    //1.create subscription
        const newSubscription: ISubscriptions = await this.subscriptionService.createSubscription(subscriptionData, partyId, customerAccountKey);
    //2. call fusebill api

    //3. send notification to customer
        return newSubscription;

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