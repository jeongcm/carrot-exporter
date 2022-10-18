import DB from '@/database';

import { NextFunction, Request, Response } from 'express';

import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';
import AddressService from '@/modules/Address/services/address.service';

import { CreateCustomerAccountDto } from '@/modules/CustomerAccount/dtos/customerAccount.dto';
import { CreateAddressDto } from '@/modules/Address/dtos/address.dto';

import { RequestWithUser } from '@/common/interfaces/auth.interface';
import { ICustomerAccount } from '@/common/interfaces/customerAccount.interface';
import { IAddress } from '@/common/interfaces/address.interface';
import { IRequestWithSystem, IRequestWithUser } from '@/common/interfaces/party.interface';
import { CreateUserDto } from '@/modules/Party/dtos/party.dto';

class CustomerAccountController {
  public customerAccountService = new CustomerAccountService();
  public addressService = new AddressService();

  public createCustomerAccount = async (req: IRequestWithSystem, res: Response, next: NextFunction) => {
    try {
      const { body, systemId } = req;
      const { firstName, lastName, email } = body;
      const customerAccountData = {
        customerAccountName: `${firstName} ${lastName}`,
        customerAccountDescription: null,
        parentCustomerAccountId: null,
        customerAccountType: null,
        firstName,
        lastName,
        email,
      };

      const partyData: CreateUserDto = {
        partyName: `${firstName} ${lastName}`,
        partyDescription: null,
        parentPartyId: null,
        //partyType: 'US',
        //customerAccountKey:createdCustomerAccount.customerAccountKey,
        //createdBy: systemId || partyId,
        firstName,
        lastName,
        userId: email,
        password: '',
        email: email,
        partyUserStatus: 'DR',
        customerAccountId: '',
        timezone: '',
        adminYn: false,
        language: 'EN',
        mobile: '',
      };
      const createdCustomerAccount = await this.customerAccountService.createCustomerAccount(customerAccountData, partyData, systemId);

      res.status(201).json({ data: createdCustomerAccount, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public getCustomerAccounts = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountsAll: ICustomerAccount[] = await this.customerAccountService.getCustomerAccounts();

      res.status(200).json({ data: customerAccountsAll, message: 'success' });
    } catch (error) {
      next(error);
    }
  };

  public getCustomerAccountById = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountId = req.params.customerAccountId;

    try {
      const customerAccount: ICustomerAccount = await this.customerAccountService.getCustomerAccountById(customerAccountId);

      if (customerAccount) {
        res.status(200).json({ data: customerAccount, message: 'success' });
        return;
      } else {
        res.status(404).json({ message: `customerAccount id(${customerAccountId}) not found` });
        return;
      }
    } catch (error) {
      next(error);
    }
  };

  public getCustomerAccountByResourceGroupUuid = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const resourceGroupUuid = req.params.resourceGroupUuid;

    try {
      const customerAccount: ICustomerAccount = await this.customerAccountService.getCustomerAccountByResourceGroupUuid(resourceGroupUuid);

      if (customerAccount) {
        res.status(200).json({ data: customerAccount, message: 'success' });
        return;
      } else {
        res.status(404).json({ message: `ResourceGroupUud(${resourceGroupUuid}) not found` });
        return;
      }
    } catch (error) {
      next(error);
    }
  };
  public updateCustomerAccountById = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountId = req.params.customerAccountId;
    const logginedUserId = req.user.partyId;

    const customerAccount: ICustomerAccount = await this.customerAccountService.getCustomerAccountById(customerAccountId);

    if (!customerAccount) {
      return res.sendStatus(404);
    }

    try {
      const coustomerAccountData: CreateCustomerAccountDto = req.body;

      const updateCustomerAccount: ICustomerAccount = await this.customerAccountService.updateCustomerAccount(
        customerAccountId,
        coustomerAccountData,
        logginedUserId,
      );

      if (updateCustomerAccount) {
        res.status(200).json({ data: updateCustomerAccount, message: 'updated' });
        return;
      }
    } catch (error) {
      next(error);
    }
  };

  public addCustomerAddress = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountId = req.params.customerAccountId;
    const logginedUserId = req.user.partyId;

    const customerAccount: ICustomerAccount = await this.customerAccountService.getCustomerAccountById(customerAccountId);

    if (!customerAccount) {
      return res.sendStatus(404);
    }

    try {
      const addressData: CreateAddressDto = req.body;
      const currentUserPk = 1;

      const createdAddress: IAddress = await this.addressService.createAddress(addressData, logginedUserId);

      const addedCustomerAddress: ICustomerAccount = await this.customerAccountService.addCustomerAddress(
        customerAccountId,
        createdAddress.addressKey,
        logginedUserId,
      );

      res.status(200).json({ data: addedCustomerAddress, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public dropCustomerAddress = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountId = req.params.customerAccountId;
    const logginedUserId = req.user.partyId;

    const customerAccount: ICustomerAccount = await this.customerAccountService.getCustomerAccountById(customerAccountId);

    if (!customerAccount) {
      return res.sendStatus(404);
    }

    try {
      await this.customerAccountService.dropCustomerAddress(customerAccountId, logginedUserId);

      res.status(204).json({ message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
}

export default CustomerAccountController;
