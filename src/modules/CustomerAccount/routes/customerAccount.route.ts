import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import CustomerAccountController from '@modules/CustomerAccount/controllers/customerAccount.controller';
import { CreateCustomerAccountDto } from '@/modules/CustomerAccount/dtos/customerAccount.dto';
import { CreateAddressDto } from '@/modules/Address/dtos/address.dto';

class CustomerAccountRoute implements Routes {
  public router = Router();
  public customerAccountController = new CustomerAccountController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/customerAccount',
      validationMiddleware(CreateCustomerAccountDto, 'body'),
      this.customerAccountController.createCustomerAccount,
    );

    this.router.get('/customerAccount', this.customerAccountController.getCustomerAccounts);
    this.router.get('/customerAccount/:customerAccountId', this.customerAccountController.getCustomerAccountById);
    this.router.put(
      '/customerAccount/:customerAccountId',
      validationMiddleware(CreateCustomerAccountDto, 'body'),
      this.customerAccountController.updateCustomerAccountById,
    );

    this.router.post(
      '/customerAccount/:customerAccountId/address',
      validationMiddleware(CreateAddressDto, 'body'),
      this.customerAccountController.addCustomerAddress,
    );

    this.router.delete('/customerAccount/:customerAccountId/address', this.customerAccountController.dropCustomerAddress);
  }
}

export default CustomerAccountRoute;
