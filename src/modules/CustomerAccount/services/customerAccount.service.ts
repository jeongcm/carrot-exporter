import DB from '@/database';
import config from '@config/index';

import { HttpException } from '@/common/exceptions/HttpException';
import { isEmpty } from '@/common/utils/util';
import { CreateCustomerAccountDto } from '@/modules/CustomerAccount/dtos/customerAccount.dto';
import { ICustomerAccount } from '@/common/interfaces/customerAccount.interface';
import { AddressModel } from '@/modules/Address/models/address.model';
import tableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import SudoryService from '@/modules/CommonService/services/sudory.service';
import { IResourceGroup } from '@/common/interfaces/resourceGroup.interface';
/**
 * @memberof CustomerAccount
 */
class CustomerAccountService {
  public customerAccount = DB.CustomerAccount;
  public address = DB.Address;
  public resourceGroup = DB.ResourceGroup;
  public customerAccountAdress = DB.CustomerAccountAddress;
  public party = DB.Party;
  public tableIdService = new tableIdService();
  public sudoryService = new SudoryService();

  public async createCustomerAccount(customerAccountData: CreateCustomerAccountDto, systemId: string): Promise<ICustomerAccount> {
    if (isEmpty(customerAccountData)) throw new HttpException(400, 'CustomerAccount  must not be empty');

    try {
      const tableIdTableName = 'CustomerAccount';
      const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdTableName);
      const customerAccountId = responseTableIdData.tableIdFinalIssued;
      //set customerAccount Api Key
      const uuid = require('uuid');
      const apiKey = uuid.v1();
      const apiBuff = Buffer.from(apiKey);
      const encodedApiKey = apiBuff.toString('base64');
      customerAccountData.customerAccountApiKey = encodedApiKey;
      customerAccountData.customerAccountApiKeyIssuedAt = new Date();

      const createdCustomerAccount: ICustomerAccount = await this.customerAccount.create({
        ...customerAccountData,
        customerAccountId: customerAccountId,
        createdBy: systemId || 'SYSTEM',
      });

      // create multi-tenant VM secret data
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

      const authBuff = Buffer.from(auth);
      const base64Auth = authBuff.toString('base64');

      //call sudory to patch VM multiline secret file

      const name = 'Update VM Secret';
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
                //value: `'$(base64<<<${auth})'`,
                value: base64Auth,
              },
            ],
          },
        },
      ];
      const customerAccountKey = createdCustomerAccount.customerAccountKey;
      const subscribedChannel = config.sudoryApiDetail.channel_webhook;
      const sudoryRequest = await this.sudoryService.postSudoryService(
        name,
        summary,
        clusterUuid,
        templateUuid,
        step,
        customerAccountKey,
        subscribedChannel,
      );

      return createdCustomerAccount;
    } catch (error) {
      console.log('error', error);
    }
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

  public async getCustomerAccountKeyById(customerAccountId: string): Promise<ICustomerAccount> {
    const customerAccountKey: ICustomerAccount = await this.customerAccount.findOne({
      where: { customerAccountId },
      attributes: ['customerAccountKey'],
    });

    return customerAccountKey;
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
}

export default CustomerAccountService;
