import DB from '@/database';

import { HttpException } from '@/common/exceptions/HttpException';
import { isEmpty } from '@/common/utils/util';

import { CreateCustomerAccountDto } from '@/modules/CustomerAccount/dtos/customerAccount.dto';

import { ICustomerAccount } from '@/common/interfaces/customerAccount.interface';

import { CustomerAccountModel } from '../models/customerAccount.model';
import { CustomerAccountAddressModel } from '@/modules/CustomerAccount/models/customerAccountAddress.model';
import { AddressModel } from '@/modules/Address/models/address.model';

/**
 * @memberof CustomerAccount
 */
class CustomerAccountService {
  public customerAccount = DB.CustomerAccount;
  public address = DB.Address;
  public customerAccountAdress = DB.CustomerAccountAddress;

  public async createCustomerAccount(customerAccountData: CreateCustomerAccountDto, currentPartyUserPk: number): Promise<ICustomerAccount> {
    if (isEmpty(customerAccountData)) throw new HttpException(400, 'CustomerAccount  must not be empty');

    const createdCustomerAccount: ICustomerAccount = await this.customerAccount.create({
      ...customerAccountData,
      customerAccountId: Date.now().toString(),
      createdBy: 'system',
    });

    return createdCustomerAccount;
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

  public async updateCustomerAccount(
    customerAccountId: string,
    coustomerAccountData: CreateCustomerAccountDto,
    currentUserPk: number,
  ): Promise<ICustomerAccount> {
    const updatedCustomerAccount: [number, CustomerAccountModel[]] = await this.customerAccount.update(
      { ...coustomerAccountData, updatedBy: 'system' },
      { where: { customerAccountId } },
    );

    if (updatedCustomerAccount) {
      return await this.getCustomerAccountById(customerAccountId);
    }
  }

  public async addCustomerAddress(customerAccountId: string, newAddressKey: number, currentUserPk: number): Promise<ICustomerAccount> {
    try {
      await DB.sequelize.transaction(async t => {
        const customerAccount = await this.customerAccount.findOne({
          where: { customerAccountId },
          attributes: ['customerAccountKey'],
          transaction: t,
        });

        await this.customerAccountAdress.update(
          { isDeleted: true, updatedBy: 'system', customerAccountAddressTo: new Date() },
          { where: { customerAccountKey: customerAccount.customerAccountKey }, transaction: t },
        );

        await this.customerAccountAdress.create(
          {
            customerAccountKey: customerAccount.customerAccountKey,
            addressKey: newAddressKey,
            createdBy: 'system',
            customerAccountAddressId: Date.now().toString(),
            customerAccountAddressFrom: new Date(),
          },
          { transaction: t },
        );
      });

      return await this.getCustomerAccountById(customerAccountId);
    } catch (error) {}
  }

  public async dropCustomerAddress(customerAccountId: string, currentUserPk: number): Promise<[number, CustomerAccountAddressModel[]]> {
    const customerAccount = await this.customerAccount.findOne({
      where: { customerAccountId },
      attributes: ['customerAccountKey'],
    });

    const droppedCustomerAddress: [number, CustomerAccountAddressModel[]] = await this.customerAccountAdress.update(
      { isDeleted: true, updatedBy: 'system', customerAccountAddressTo: new Date() },
      { where: { customerAccountKey: customerAccount.customerAccountKey, isDeleted: false } },
    );

    return droppedCustomerAddress;
  }
}

export default CustomerAccountService;
