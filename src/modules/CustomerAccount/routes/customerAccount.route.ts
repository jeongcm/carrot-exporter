import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import systemAuthMiddleware from '@/modules/ApiGateway/middlewares/systemAuth.middleware';

import CustomerAccountController from '@modules/CustomerAccount/controllers/customerAccount.controller';
import { CreateCustomerAccountDto } from '@/modules/CustomerAccount/dtos/customerAccount.dto';
import { CreateAddressDto } from '@/modules/Address/dtos/address.dto';
import createUserLogMiddleware from '@/modules/ApiGateway/middlewares/createUserLogMiddleware';

class CustomerAccountRoute implements Routes {
  public router = Router();
  public customerAccountController = new CustomerAccountController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/customerAccount',
      systemAuthMiddleware,
      validationMiddleware(CreateCustomerAccountDto, 'body'),
      createUserLogMiddleware,
      this.customerAccountController.createCustomerAccount,
    );

    this.router.get(
      '/customerAccount',
      systemAuthMiddleware,
      authMiddleware,
      createUserLogMiddleware,
      this.customerAccountController.getCustomerAccounts,
    );
    this.router.get(
      '/customerAccount/:customerAccountId',
      systemAuthMiddleware,
      createUserLogMiddleware,
      this.customerAccountController.getCustomerAccountById,
    );
    this.router.put(
      '/customerAccount/:customerAccountId',
      authMiddleware,
      validationMiddleware(CreateCustomerAccountDto, 'body'),
      createUserLogMiddleware,
      this.customerAccountController.updateCustomerAccountById,
    );

    this.router.post(
      '/customerAccount/:customerAccountId/address',
      authMiddleware,
      validationMiddleware(CreateAddressDto, 'body'),
      createUserLogMiddleware,
      this.customerAccountController.addCustomerAddress,
    );

    this.router.delete(
      '/customerAccount/:customerAccountId/address',
      authMiddleware,
      createUserLogMiddleware,
      this.customerAccountController.dropCustomerAddress,
    );
  }
}

export default CustomerAccountRoute;
