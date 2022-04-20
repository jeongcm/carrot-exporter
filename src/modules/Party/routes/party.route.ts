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

class partyRoute implements Routes {
  public router = Router();
  public partyController = new PartyController();
  public authservice = new AuthService();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/login', validationMiddleware(LoginDto, 'body'), this.partyController.login);
    this.router.get('/logout', this.partyController.logout);

    this.router.post('/party/user', systemAuthMiddleware, validationMiddleware(CreateUserDto, 'body'), this.partyController.createUser);
    this.router.get('/party/user', authMiddleware, this.partyController.getUsers);
    this.router.get('/party/user/:partyUserId', authMiddleware, this.partyController.getUser);
    this.router.put('/party/user/:partyUserId', authMiddleware, validationMiddleware(UpdateUserDto, 'body'), this.partyController.updateUser);

    this.router.post(
      '/party/accessgroup',
      authMiddleware,
      validationMiddleware(CreateAccessGroupDto, 'body'),
      this.partyController.createAccessGroup,
    );
    this.router.get('/party/accessgroup', authMiddleware, this.partyController.getAccessGroups);
    this.router.get('/party/accessgroup/:partyId', authMiddleware, this.partyController.getAccessGroup);
    this.router.put(
      '/party/accessgroup/:partyId',
      authMiddleware,
      validationMiddleware(CreateAccessGroupDto, 'body'),
      this.partyController.updateAccessGroup,
    );

    this.router.post(
      '/party/accessgroup/:partyId/users',
      authMiddleware,
      validationMiddleware(AddUserAccessGroupDto, 'body'),
      this.partyController.addUserToAccessGroup,
    );
    this.router.get('/party/accessgroup/:partyId/users', authMiddleware, this.partyController.getUserOfAccessGroup);
    this.router.delete(
      '/party/accessgroup/:partyId/users',
      authMiddleware,
      validationMiddleware(AddUserAccessGroupDto, 'body'),
      this.partyController.removeUserFromAccessGroup,
    );

    this.router.post(
      '/party/accessgroup/:partyId/resource',
      authMiddleware,
      validationMiddleware(AddResourceToAccessGroupDto, 'body'),
      this.partyController.addResourceToAccessGroup,
    );
    this.router.delete(
      '/party/accessgroup/:partyId/resource',
      authMiddleware,
      validationMiddleware(AddResourceToAccessGroupDto, 'body'),
      this.partyController.removeResourceFromAccessGroup,
    );
    this.router.get('/party/accessgroup/:partyId/resource', authMiddleware, this.partyController.getResourceOfAccessGroup);
  }
}

export default partyRoute;
