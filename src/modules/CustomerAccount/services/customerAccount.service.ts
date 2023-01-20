import DB from '@/database';
import config from '@config/index';
import { isEmpty } from '@/common/utils/util';
import { HttpException } from '@/common/exceptions/HttpException';
import { CreateCustomerAccountDto } from '@/modules/CustomerAccount/dtos/customerAccount.dto';
import { ICustomerAccount } from '@/common/interfaces/customerAccount.interface';
import { AddressModel } from '@/modules/Address/models/address.model';
import tableIdService from '@/modules/CommonService/services/tableId.service';
import ResourceGroupService from '@/modules/Resources/services/resourceGroup.service';
import SendMailService from '@/modules/Messaging/services/sendMail.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import SudoryService from '@/modules/CommonService/services/sudory.service';
import PartyService from '@/modules/Party/services/party.service';
import SubscriptionService from '@/modules/Subscriptions/services/subscriptions.service';
import { IResourceGroup } from '@/common/interfaces/resourceGroup.interface';
import { CreateUserDto } from '@/modules/Party/dtos/party.dto';
import axios from 'common/httpClient/axios';
import { IParty, IPartyUser } from '@/common/interfaces/party.interface';
import bcrypt from 'bcrypt';
import { ISubscriptions } from '@/common/interfaces/subscription.interface';
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
/**
 * @memberof CustomerAccount
 */
class CustomerAccountService {
  public customerAccount = DB.CustomerAccount;
  public address = DB.Address;
  public resourceGroup = DB.ResourceGroup;
  public customerAccountAdress = DB.CustomerAccountAddress;
  public party = DB.Party;
  public partyUser = DB.PartyUser;
  public notification = DB.Notification;
  public tableIdService = new tableIdService();
  public sendMailService = new SendMailService();
  public sudoryService = new SudoryService();
  public partyService = new PartyService();
  public resourceGroupService = new ResourceGroupService();
  public subscriptionService = new SubscriptionService();

  /**
   * @param {CreateCustomerAccountDto} customerAccountData
   * @param {Object} partyData
   * @param {string} createdBy
   */
  public async createCustomerAccount(customerAccountData: CreateCustomerAccountDto, partyData: CreateUserDto, createdBy: string): Promise<object> {
    //0. Data Prep
    if (isEmpty(customerAccountData)) throw new HttpException(400, 'CustomerAccount  must not be empty');

    const currentDate = new Date();
    const { partyName, partyDescription, parentPartyId, firstName, lastName, userId, email, mobile, language } = partyData;

    //set customerAccount Api Key
    const uuid = require('uuid');
    const apiKey = uuid.v1();
    const apiBuff = Buffer.from(apiKey);
    const encodedApiKey = apiBuff.toString('base64');
    customerAccountData.customerAccountApiKey = encodedApiKey;
    customerAccountData.customerAccountApiKeyIssuedAt = new Date();

    let tableIdTableName = 'CustomerAccount';
    let responseTableIdData = await this.tableIdService.issueTableId(tableIdTableName);
    const customerAccountId = responseTableIdData.tableIdFinalIssued;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    tableIdTableName = 'Party';
    responseTableIdData = await this.tableIdService.issueTableId(tableIdTableName);
    const partyId = responseTableIdData.tableIdFinalIssued;

    //id creation for api user
    responseTableIdData = await this.tableIdService.issueTableId(tableIdTableName);
    const partyIdApi = responseTableIdData.tableIdFinalIssued;
    let customerAccountKey;
    let returnResult;
    let externalBillingCustomerId;
    try {
      await DB.sequelize.transaction(async t => {
        //1. create a customer account
        const createdCustomerAccount: ICustomerAccount = await this.customerAccount.create(
          {
            ...customerAccountData,
            customerAccountId: customerAccountId,
            createdBy: partyId,
          },
          { transaction: t },
        );
        customerAccountKey = createdCustomerAccount.customerAccountKey;

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
        const password = config.defaultPassword;
        const hashedPassword = await bcrypt.hash(password, 10);
        const createdPartyUser: IPartyUser = await this.partyUser.create(
          {
            partyUserId: partyId,
            partyKey: createdParty.partyKey,
            createdBy: createdBy,
            firstName: firstName,
            lastName: lastName,
            userId: userId,
            mobile: mobile,
            password: hashedPassword,
            email: email,
            timezone: timeZone,
            isEmailValidated: false,
            partyUserStatus: 'AC',
            adminYn: true,
            systemYn: false,
            language: language,
          },
          { transaction: t },
        )

        //create an API user
        const createdPartyApi: IParty = await this.party.create(
          {
            partyId: partyIdApi,
            partyName: customerAccountData.customerAccountName + '-API',
            partyDescription: customerAccountData.customerAccountName + '-API',
            parentPartyId: parentPartyId,
            partyType: 'US',
            customerAccountKey,
            createdBy: createdBy,
            createdAt: currentDate,
          },
          { transaction: t },
        );

        const partyKeyApi = createdPartyApi.partyKey;
        const createdPartyUserApi: IPartyUser = await this.partyUser.create(
          {
            partyUserId: partyIdApi,
            partyKey: partyKeyApi,
            createdBy: createdBy,
            firstName: 'API-User',
            lastName: customerAccountData.customerAccountName,
            userId: customerAccountId,
            mobile: '',
            password: password,
            email: partyIdApi,
            timezone: timeZone,
            isEmailValidated: false,
            partyUserStatus: 'AC',
            adminYn: false,
            systemYn: true,
            language: language,
          },
          { transaction: t },
        )

        //3. fusebill interface
        console.log('fuseBill Start');
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
          console.log('Provision customer infor to fusebill successfully');
          externalBillingCustomerId = fuseBillCustomer.data.id;
          const customerActivationPayload = {
            customerId: fuseBillCustomer.data.id,
            activateAllSubscriptions: true,
            activateAllDraftPurchases: true,
            temporarilyDisableAutoPost: false,
          };
          await axios({
            method: 'post',
            url: `${config.fuseBillApiDetail.baseURL}customerActivation`,
            data: customerActivationPayload,
            headers: headers,
          });
        } else {
          console.log('Fail to provision customer data to Fulsebill');
        }
        console.log('fuseBill End');
        //4. prep sending email to customer
        console.log('sending email to customer Start');
        let emailTemplateSource;
        try {
          emailTemplateSource = fs.readFileSync(path.join(__dirname, '../../Messaging/templates/emails/email-body/newCustomerAccount.hbs'), 'utf8');
        } catch (err) {
          console.log('email error-----', err);
        }
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
        console.log('sending email to customer end');
        //4.1 send email to customer
        console.log('sending email to customer start 4.1');
        let emailSent = false;
        await this.sendMailService.sendMailGeneral(mailOptions);
        emailSent = true;
        console.log('email sent to new customer');
        //6. set customer health check scheduling
        //const scheduleHealthService = await this.healthService.checkHealthByCustomerAccountId(customerAccountId);
        //console.log('operation schedules setup:', scheduleHealthService);
        //7. return message
        returnResult = {
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
      })
    } catch (err) {
      console.log(err);
      throw new HttpException(500, `Unknown error while creating account. cause: ${err}`);
    }

    // update externalbillingcustomerid into customerAccount table
    await this.customerAccount.update({ externalBillingCustomerId }, { where: { customerAccountId } });

    if (config.victoriaMetrics.vmOption === "MULTI") {
      //. create multi-tenant VM secret data
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
      console.log('auth-----', auth);
      const authBuff = Buffer.from(auth);
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
      console.log('CUSTOMER# - step', JSON.stringify(step));
      await this.sudoryService.postSudoryService(sudoryServiceName, summary, clusterUuid, templateUuid, step, customerAccountKey, subscribedChannel);
    }

    return returnResult;
  }

  public async getCustomerAccounts(): Promise<ICustomerAccount[]> {
    const customerAccountsAll: ICustomerAccount[] = await this.customerAccount.findAll({
      where: { deletedAt: null },
      attributes: { exclude: ['customerAccountKey', 'deletedAt'] },
    });

    return customerAccountsAll;
  }

  public async getCustomerAccountByKey(customerAccountKey: number): Promise<ICustomerAccount> {
    const customerAccount: ICustomerAccount = await this.customerAccount.findOne({
      where: { customerAccountKey },
      attributes: { exclude: ['customerAccountKey', 'deletedAt'] },
      include: [
        {
          model: AddressModel,
          as: 'address',
          attributes: { exclude: ['addressKey', 'deletedAt'] },
          through: { attributes: [], where: { deletedAt: null } },
        },
      ],
    });

    return customerAccount;
  }

  public async getCustomerAccountById(customerAccountId: string): Promise<ICustomerAccount> {
    const customerAccount: ICustomerAccount = await this.customerAccount.findOne({
      where: { customerAccountId, deletedAt: null },
      attributes: { exclude: ['deletedAt'] },
      include: [
        {
          model: AddressModel,
          as: 'address',
          attributes: { exclude: ['addressKey', 'deletedAt'] },
          through: { attributes: [], where: { deletedAt: null } },
        },
      ],
    });

    return customerAccount;
  }

  public async getCustomerAccountKeyById(customerAccountId: any): Promise<number> {
    const customerAccount: ICustomerAccount = await this.customerAccount.findOne({
      where: { customerAccountId },
      attributes: ['customerAccountKey'],
    });

    return customerAccount.customerAccountKey;
  }

  public async getCustomerAccountByResourceGroupUuid(resourceGroupUuid: string): Promise<ICustomerAccount> {
    const getResourceGroup: IResourceGroup = await this.resourceGroup.findOne({
      where: { resourceGroupUuid, deletedAt: null },
    });
    if (!getResourceGroup) throw new HttpException(404, 'No resource Group');
    const getCustomerAccount: ICustomerAccount = await this.customerAccount.findOne({
      where: { customerAccountKey: getResourceGroup.customerAccountKey, deletedAt: null },
    });
    if (!getCustomerAccount) throw new HttpException(404, 'No customer account');

    return getCustomerAccount;
  }

  public async getCustomerAccountIdByKey(customerAccountKey: number): Promise<string> {
    const customerAccountData: ICustomerAccount = await this.customerAccount.findOne({
      where: { customerAccountKey },
    });
    return customerAccountData.customerAccountId;
  }

  public async getCustomerAccountApiKeyById(customerAccountId: string): Promise<Object> {
    const customerAccount: ICustomerAccount = await this.customerAccount.findOne({
      where: { customerAccountId, deletedAt: null },
    });
    const encodedApiKey = customerAccount.customerAccountApiKey;
    const apiKeyBuff = Buffer.from(encodedApiKey, 'base64');
    const apiKey = apiKeyBuff.toString('ascii');
    const returnMsg = {
      customerAccount: customerAccountId,
      customerAccountApiKey: apiKey,
      customerAccountApiKeyIssuedAt: customerAccount.customerAccountApiKeyIssuedAt,
    };

    return returnMsg;
  }

  public async updateCustomerAccount(
    customerAccountId: string,
    coustomerAccountData: CreateCustomerAccountDto,
    logginedUserId: string,
  ): Promise<ICustomerAccount> {
    const updatedCustomerAccount: [number] = await this.customerAccount.update(
      { ...coustomerAccountData, updatedBy: logginedUserId },
      { where: { customerAccountId } },
    );

    if (updatedCustomerAccount) {
      return await this.getCustomerAccountById(customerAccountId);
    }
  }

  public async addCustomerAddress(customerAccountId: string, newAddressKey: number, logginedUserId: string): Promise<ICustomerAccount> {
    try {
      const tableIdTableName = 'CustomerAccountAddress';
      const tableId = await this.tableIdService.getTableIdByTableName(tableIdTableName);

      if (!tableId) {
        return;
      }

      const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdTableName);

      await DB.sequelize.transaction(async t => {
        const customerAccount = await this.customerAccount.findOne({
          where: { customerAccountId },
          attributes: ['customerAccountKey'],
          transaction: t,
        });

        await this.customerAccountAdress.update(
          { deletedAt: new Date(), updatedBy: logginedUserId, customerAccountAddressTo: new Date() },
          { where: { customerAccountKey: customerAccount.customerAccountKey }, transaction: t },
        );

        await this.customerAccountAdress.create(
          {
            customerAccountKey: customerAccount.customerAccountKey,
            addressKey: newAddressKey,
            createdBy: logginedUserId,
            customerAccountAddressId: responseTableIdData.tableIdFinalIssued,
            customerAccountAddressFrom: new Date(),
          },
          { transaction: t },
        );
      });

      return await this.getCustomerAccountById(customerAccountId);
    } catch (error) {}
  }

  public async dropCustomerAddress(customerAccountId: string, logginedUserId: string): Promise<[number]> {
    const customerAccount = await this.customerAccount.findOne({
      where: { customerAccountId },
      attributes: ['customerAccountKey'],
    });

    const droppedCustomerAddress: [number] = await this.customerAccountAdress.update(
      { deletedAt: new Date(), updatedBy: logginedUserId, customerAccountAddressTo: new Date() },
      { where: { customerAccountKey: customerAccount.customerAccountKey, deletedAt: null } },
    );

    return droppedCustomerAddress;
  }

  public async deleteCustomerAccount(customerAccountId, clusterDeleteOption: string): Promise<Object> {
    //1. confirm customerAccount
    const findCustomerAccount: ICustomerAccount = await this.customerAccount.findOne({ where: { customerAccountId, deletedAt: null } });
    if (!findCustomerAccount) throw new HttpException(404, 'Cannot find customerAccount');
    const customerAccountKey = findCustomerAccount.customerAccountKey;
    const externalBillingCustomerId = findCustomerAccount.externalBillingCustomerId;

    //2. find ResourceGroup
    const findResourceGroup: IResourceGroup[] = await this.resourceGroup.findAll({ where: { customerAccountKey, deletedAt: null } });
    if (findResourceGroup.length > 0) {
      //3. delete ResourceGroups
      for (let i = 0; i < findResourceGroup.length; i++) {
        const resourceGroupUuid = findResourceGroup[i].resourceGroupUuid;
        await this.resourceGroupService.deleteResourceGroupByResourceGroupUuid(resourceGroupUuid, customerAccountKey, clusterDeleteOption);
      }
    }
    //4. delete subscription/subscribed products

    const findSubscriptions: ISubscriptions[] = await this.subscriptionService.findSubscriptions(customerAccountKey);
    if (findSubscriptions.length > 0) {
      for (let i = 0; i < findSubscriptions.length; i++) {
        const subscriptionId = findSubscriptions[i].subscriptionId;
        await this.subscriptionService.cancelSubscription(subscriptionId);
      }
    }
    //5. delete party & party user
    const findParty: IParty[] = await this.party.findAll({ where: { customerAccountKey, deletedAt: null } });
    if (findParty.length > 0) {
      for (let i = 0; i < findParty.length; i++) {
        const partyId = findParty[i].partyId;
        await this.partyService.deleteParty(partyId);
      }
    }
    //6. delete customerAccount with fusebill interface
    await this.customerAccount.update({ deletedAt: new Date() }, { where: { customerAccountKey } });

    console.log('fuseBill Provisoning Start');
    const fuseBillCancelCustomer = {
      customerId: externalBillingCustomerId,
      cancellationOption: 'None',
    };
    let fuseBillInterface = false;
    const headers = { Authorization: `Basic ${config.fuseBillApiDetail.apiKey}` };
    console.log('url', config.fuseBillApiDetail.cancelCustomerUrl);
    console.log('data', fuseBillCancelCustomer);

    try {
      const fuseBillCustomer = await axios({
        method: 'post',
        url: config.fuseBillApiDetail.cancelCustomerUrl,
        data: fuseBillCancelCustomer,
        headers: headers,
      });
      fuseBillInterface = true;
      console.log('Provision customer infor to fusebill successfully');
    } catch (error) {
      console.log('Fail to provision customer data to Fulsebill', error);
    }
    console.log('fuseBill Provisoning End');

    //7. reprovision customerAccountid to vm-multi-tenant model

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
    //console.log('auth-----', auth);
    const authBuff = Buffer.from(auth);
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
    //console.log('CUSTOMER# - step', JSON.stringify(step));
    await this.sudoryService.postSudoryService(sudoryServiceName, summary, clusterUuid, templateUuid, step, customerAccountKey, subscribedChannel);

    const returnMessage = { customerAccountId: customerAccountId, fuseBillInterface: fuseBillInterface };
    return returnMessage;
  }

  public async getCustomerAccountKeysByParentCustomerAccountId(parentCustomerAccountId: string): Promise<number[]> {
    let customerAccounts = await this.customerAccount.findAll({
      where: {deletedAt: null, parentCustomerAccountId: parentCustomerAccountId}
    })

    var customerAccountKeys = customerAccounts.map(ca => {
      return ca.customerAccountKey
    })

    return customerAccountKeys
  }
}

export default CustomerAccountService;
