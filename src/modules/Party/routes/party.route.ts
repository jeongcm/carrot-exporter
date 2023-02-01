import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';

import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import { CreateUserDto, UpdateUserDto, LoginDto, LoginApiDto } from '@/modules/Party/dtos/party.dto';
import validationMiddleware from '@/common/middlewares/validation.middleware';

import PartyController from '../controllers/party.controller';
import systemAuthMiddleware from '@/modules/ApiGateway/middlewares/systemAuth.middleware';
import createUserLogMiddleware from '@/modules/ApiGateway/middlewares/createUserLogMiddleware';

class partyRoute implements Routes {
  public router = Router();
  public partyController = new PartyController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/login', systemAuthMiddleware, validationMiddleware(LoginDto, 'body'), createUserLogMiddleware, this.partyController.login);
    // login by parent customerAccount
    this.router.post('/loginInSystem', systemAuthMiddleware, createUserLogMiddleware, this.partyController.loginInSystem);
    this.router.post(
      '/apiLogin',
      systemAuthMiddleware,
      validationMiddleware(LoginApiDto, 'body'),
      createUserLogMiddleware,
      this.partyController.apiLogin,
    );
    this.router.get('/logout', systemAuthMiddleware, createUserLogMiddleware, this.partyController.logout);
    this.router.get('/password/reset/:email', systemAuthMiddleware, createUserLogMiddleware, this.partyController.requestPasswordReset);
    this.router.post('/updatePassword', systemAuthMiddleware, createUserLogMiddleware, this.partyController.resetPassword);

    this.router.post(
      '/party/user',
      systemAuthMiddleware,
      validationMiddleware(CreateUserDto, 'body'),
      createUserLogMiddleware,
      this.partyController.createUser,
    );

    this.router.post(
      '/resetPasswordByAdmin',
      systemAuthMiddleware,
      //validationMiddleware(CreateUserDto, 'body'),
      //createUserLogMiddleware,
      this.partyController.resetPasswordByAdmin,
    );
    this.router.delete('/party/:partyId', authMiddleware, this.partyController.deleteParty);
    this.router.get('/party/me', authMiddleware, createUserLogMiddleware, this.partyController.getCurrentUser);
    this.router.get('/party/user', authMiddleware, createUserLogMiddleware, this.partyController.getUsers);
    this.router.get('/party/user/:partyUserId', authMiddleware, createUserLogMiddleware, this.partyController.getUser);
    this.router.put(
      '/party/user/:partyUserId',
      authMiddleware,
      validationMiddleware(UpdateUserDto, 'body'),
      createUserLogMiddleware,
      this.partyController.updateUser,
    );
  }
}

export default partyRoute;
