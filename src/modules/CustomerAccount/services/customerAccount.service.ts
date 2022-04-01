import DB from '@/database';

import { HttpException } from '@/common/exceptions/HttpException';
import { isEmpty } from '@/common/utils/util';

import { CreateCustomerAccountDto } from '@/modules/CustomerAccount/dtos/customerAccount.dto';

import { ICustomerAccount } from '@/common/interfaces/customerAccount.interface';

import { CustomerAccountModel } from '../models/customerAccount.model';
import { CustomerAccountAddressModel } from '@/modules/CustomerAccount/models/customerAccountAddress.model';
import { AddressModel } from '@/modules/Address/models/address.model';
import tableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import { IParty } from '@/common/interfaces/party.interface';

/**
 * @memberof CustomerAccount
 */
class CustomerAccountService {
  public customerAccount = DB.CustomerAccount;
  public address = DB.Address;
  public customerAccountAdress = DB.CustomerAccountAddress;
  public party = DB.Party;
  public tableIdService = new tableIdService();

  public async createCustomerAccount(customerAccountData: CreateCustomerAccountDto, systemId: string): Promise<ICustomerAccount> {
    if (isEmpty(customerAccountData)) throw new HttpException(400, 'CustomerAccount  must not be empty');

    try {
      const tableIdTableName = 'CustomerAccount';
      const tableId = await this.tableIdService.getTableIdByTableName(tableIdTableName);

      if (!tableId) {
        return;
      }

      const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdTableName);

      const createdCustomerAccount: ICustomerAccount = await this.customerAccount.create({
        ...customerAccountData,
        customerAccountId: responseTableIdData.tableIdFinalIssued,
        createdBy: systemId,
      });

      return createdCustomerAccount;
    } catch (error) {}
  }

  public async getCustomerAccounts(): Promise<ICustomerAccount[]> {
    const customerAccountsAll: ICustomerAccount[] = await this.customerAccount.findAll({
      where: { isDeleted: false },
      attributes: { exclude: ['customerAccountKey', 'isDeleted'] },
    });

    return customerAccountsAll;
  }

  public async getCustomerAccountById(customerAccountId: string): Promise<ICustomerAccount> {
    const customerAccount: ICustomerAccount = await this.customerAccount.findOne({
      where: { customerAccountId },
      attributes: { exclude: ['customerAccountKey', 'isDeleted'] },
      include: [
        {
          model: AddressModel,
          as: 'address',
          attributes: { exclude: ['addressKey', 'isDeleted'] },
          through: { attributes: [], where: { isDeleted: false } },
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

  public async updateCustomerAccount(
    customerAccountId: string,
    coustomerAccountData: CreateCustomerAccountDto,
    logginedUserId: string,
  ): Promise<ICustomerAccount> {
    const updatedCustomerAccount: [number, CustomerAccountModel[]] = await this.customerAccount.update(
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
          { isDeleted: true, updatedBy: logginedUserId, customerAccountAddressTo: new Date() },
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

  public async dropCustomerAddress(customerAccountId: string, logginedUserId: string): Promise<[number, CustomerAccountAddressModel[]]> {
    const customerAccount = await this.customerAccount.findOne({
      where: { customerAccountId },
      attributes: ['customerAccountKey'],
    });

    const droppedCustomerAddress: [number, CustomerAccountAddressModel[]] = await this.customerAccountAdress.update(
      { isDeleted: true, updatedBy: logginedUserId, customerAccountAddressTo: new Date() },
      { where: { customerAccountKey: customerAccount.customerAccountKey, isDeleted: false } },
    );

    return droppedCustomerAddress;
  }
}

export default CustomerAccountService;
