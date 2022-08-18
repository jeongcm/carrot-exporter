import DB from '@/database';
import axios from 'axios';
import config from '@config/index';
import { HttpException } from '@/common/exceptions/HttpException';

import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';
import PartyService from '@/modules/Party/services/party.service';
import SubscriptionService from '@/modules/Subscriptions/services/subscriptions.service';
import SendMailService from '@/modules/Messaging/services/sendMail.service'

import { IPartyUserResponse, IRequestWithSystem, IRequestWithUser } from '@/common/interfaces/party.interface';
import { ICustomerAccount } from '@/common/interfaces/customerAccount.interface';
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
    public customerAccountService = new CustomerAccountService();
    public partyService = new PartyService();
    public subscriptionService = new SubscriptionService();
    public sendMailService = new SendMailService();

  /**
   * @param {CreateCustomerAccountDto} customerAccountData
   * @param {Object} partyData
   * @param {string} partyId
   */
   public async createCustomerAccount(customerAccountData:CreateCustomerAccountDto, partyData: CreateUserDto, partyId: string): Promise<object> {
    var returnResult = {};
    const 
    {
      partyName,
      partyDescription,
      parentPartyId,
      firstName,
      lastName,
      userId,
      password,
      email,
      mobile,
    } = partyData; 

    //1. create a customer account
    const createdCustomerAccount: ICustomerAccount = await this.customerAccountService.createCustomerAccount(customerAccountData, partyId);

    //2. create a party user

    const partyDataNew = {
        partyName,
        partyDescription,
        parentPartyId,
        partyType: 'US',
        createdBy: partyId,
        firstName,
        lastName,
        userId,
        password,
        email,
        mobile,
        partyUserStatus: "DR",
        customerAccountId: createdCustomerAccount.customerAccountId
    };

    const createdPartyUser: IPartyUserResponse = await this.partyService.createUser(partyDataNew, createdCustomerAccount.customerAccountKey, partyId);
    

    //3. fusebill interface


    //4. customer email 
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
    const resultMailSent = await this.sendMailService.sendMailGeneral(mailOptions);
    console.log (resultMailSent);

    //5. return message
    returnResult = {customerAccountId: createdCustomerAccount.customerAccountId,
        customerAccountName: createdCustomerAccount.customerAccountName,
        customerAccountType: createdCustomerAccount.customerAccountType,
        firstName:  createdPartyUser.firstName, 
        lastName:  createdPartyUser.lastName, 
        userId:  createdPartyUser.userId, 
        email:  createdPartyUser.email, 
        mobile:  createdPartyUser.mobile, 
}

    return returnResult;
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