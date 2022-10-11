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
/**
 * @memberof CustomerAccount
 */
class CustomerAccountService {
  public customerAccount = DB.CustomerAccount;
  public address = DB.Address;
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
      const createdCustomerAccount: ICustomerAccount = await this.customerAccount.create({
        ...customerAccountData,
        customerAccountId: customerAccountId,
        createdBy: systemId || 'SYSTEM',
      });
      /*
      // create multi-tenant VM secret data
      const getActiveCustomerAccounts: ICustomerAccount[] = await this.customerAccount.findAll({
        where: { deletedAt: null },
      });
      let auth = '\n' + `Users: ` + '\n';
      getActiveCustomerAccounts.forEach(customerAccount => {
        auth =
          auth +
          `- username: ${customerAccount.customerAccountId}
  password: ${customerAccount.customerAccountId}
  url_prefix: "${config.victoriaMetrics.vmMultiBaseUrlSelect}/${customerAccount.customerAccountId}/prometheus/"
- username: ${customerAccount.customerAccountId}
  password: ${customerAccount.customerAccountId}
  url_prefix: "${config.victoriaMetrics.vmMultiBaseUrlInsert}/${customerAccount.customerAccountId}/prometheus/"` +
          '\n';
      });
      console.log(auth);
      //call sudory to patch VM multiline secret file

      const name = 'Update VM Secret';
      const summary = 'Update VM Secret';
      const clusterUuid = config.victoriaMetrics.vmMultiClusterUuid;
      const templateUuid = ''; //tmplateUuid will be updated
      const step = [
        {
          args: {
            name: config.victoriaMetrics.vmMultiSecret,
            namespace: config.victoriaMetrics.vmMultiNamespaces,
            op: 'replace',
            path: "/data/'auth.yml'",
            value: `'$(base64<<<${auth})'`,
          },
        },
      ];
      const customerAccountKey = createdCustomerAccount.customerAccountKey;
      const subscribedChannel = config.sudoryApiDetail.channel_webhook;
      const updateVmSecret = await this.sudoryService.postSudoryService(
        name,
        summary,
        clusterUuid,
        templateUuid,
        step,
        customerAccountKey,
        subscribedChannel,
      );
      */
      /* blocked due to Maximum call stack size exceeded error
      //schdule Heathcheck of customer Account clusters //improvement/547
      let cronTabforHealth = config.healthCron;     
      await this.healthService.scheduleCheckHealthByCustomerAccountId(customerAccountId, cronTabforHealth
        ).then(async (res: any) =>{
          console.log(`Submitted Health  schedule reqeust on ${customerAccountId} cluster successfully`);
        }).catch(error => {
          console.log(error);
          throw new HttpException(500, `create CustomerAccount but fail to schedule health check service - ${customerAccountId}`);
        }); //end of catch  
      */
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

  public async getCustomerAccountIdByKey(customerAccountKey: number): Promise<string> {
    const customerAccountData: ICustomerAccount = await this.customerAccount.findOne({
      where: { customerAccountKey },
    });
    return customerAccountData.customerAccountId;
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
