import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';

import AuthService from '@/modules/UserTenancy/services/auth.service';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import {
  CreateUserDto,
  UpdateUserDto,
  CreateAccessGroupDto,
  AddUserAccessGroupDto,
  LoginDto,
  AddResourceToAccessGroupDto,
} from '@/modules/Party/dtos/party.dto';
import validationMiddleware from '@/common/middlewares/validation.middleware';

import PartyController from '../controllers/party.controller';
import systemAuthMiddleware from '@/modules/ApiGateway/middlewares/systemAuth.middleware';
import createUserLogMiddleware from '@/modules/ApiGateway/middlewares/createUserLogMiddleware';

class partyRoute implements Routes {
  public router = Router();
  public partyController = new PartyController();
  public authservice = new AuthService();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/login', systemAuthMiddleware, validationMiddleware(LoginDto, 'body'), createUserLogMiddleware, this.partyController.login);
    this.router.get('/logout', systemAuthMiddleware, createUserLogMiddleware, this.partyController.logout);

    this.router.post(
      '/party/user',
      systemAuthMiddleware,
      validationMiddleware(CreateUserDto, 'body'),
      createUserLogMiddleware,
      this.partyController.createUser,
    );
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

    this.router.post(
      '/party/accessgroup',
      authMiddleware,
      validationMiddleware(CreateAccessGroupDto, 'body'),
      createUserLogMiddleware,
      this.partyController.createAccessGroup,
    );
    this.router.get('/party/accessgroup', authMiddleware, createUserLogMiddleware, this.partyController.getAccessGroups);
    this.router.get('/party/accessgroup/:partyId', authMiddleware, createUserLogMiddleware, this.partyController.getAccessGroup);
    this.router.put(
      '/party/accessgroup/:partyId',
      authMiddleware,
      validationMiddleware(CreateAccessGroupDto, 'body'),
      createUserLogMiddleware,
      this.partyController.updateAccessGroup,
    );

    this.router.post(
      '/party/accessgroup/:partyId/users',
      authMiddleware,
      validationMiddleware(AddUserAccessGroupDto, 'body'),
      createUserLogMiddleware,
      this.partyController.addUserToAccessGroup,
    );
    this.router.get('/party/accessgroup/:partyId/users', authMiddleware, createUserLogMiddleware, this.partyController.getUserOfAccessGroup);
    this.router.delete(
      '/party/accessgroup/:partyId/users',
      authMiddleware,
      validationMiddleware(AddUserAccessGroupDto, 'body'),
      createUserLogMiddleware,
      this.partyController.removeUserFromAccessGroup,
    );

    this.router.post(
      '/party/accessgroup/:partyId/resource',
      authMiddleware,
      validationMiddleware(AddResourceToAccessGroupDto, 'body'),
      createUserLogMiddleware,
      this.partyController.addResourceToAccessGroup,
    );
    this.router.delete(
      '/party/accessgroup/:partyId/resource',
      authMiddleware,
      validationMiddleware(AddResourceToAccessGroupDto, 'body'),
      createUserLogMiddleware,
      this.partyController.removeResourceFromAccessGroup,
    );
    this.router.get('/party/accessgroup/:partyId/resource', authMiddleware, createUserLogMiddleware, this.partyController.getResourceOfAccessGroup);
    this.router.get('/party/:partyId/apilog', authMiddleware, createUserLogMiddleware, this.partyController.getUserAPILog);
  }
}

export default partyRoute;
