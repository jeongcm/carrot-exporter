import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';

import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import { CreateAccessGroupDto, AddUserAccessGroupDto, AddResourceToAccessGroupDto } from '@/modules/Party/dtos/party.dto';
import validationMiddleware from '@/common/middlewares/validation.middleware';

import accessGroupController from '../controllers/accessgroup.controller';
import createUserLogMiddleware from '@/modules/ApiGateway/middlewares/createUserLogMiddleware';

class accessgroupRoute implements Routes {
  public router = Router();
  public accessGroupController = new accessGroupController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/party/accessgroup',
      authMiddleware,
      validationMiddleware(CreateAccessGroupDto, 'body'),
      createUserLogMiddleware,
      this.accessGroupController.createAccessGroup,
    );
    this.router.get('/party/accessgroup', authMiddleware, createUserLogMiddleware, this.accessGroupController.getAccessGroups);
    this.router.get('/party/accessgroup/:partyId', authMiddleware, createUserLogMiddleware, this.accessGroupController.getAccessGroup);
    this.router.put(
      '/party/accessgroup/:partyId',
      authMiddleware,
      validationMiddleware(CreateAccessGroupDto, 'body'),
      createUserLogMiddleware,
      this.accessGroupController.updateAccessGroup,
      );
      
    this.router.get('/party/accessgroup/channel/:channelId', authMiddleware, createUserLogMiddleware, this.accessGroupController.getAccessGroupsByChannel);
    this.router.post(
      '/party/accessgroup/:partyId/users',
      authMiddleware,
      validationMiddleware(AddUserAccessGroupDto, 'body'),
      createUserLogMiddleware,
      this.accessGroupController.addUserToAccessGroup,
    );
    this.router.get('/party/accessgroup/:partyId/users', authMiddleware, createUserLogMiddleware, this.accessGroupController.getUserOfAccessGroup);
    this.router.delete(
      '/party/accessgroup/:partyId/users',
      authMiddleware,
      validationMiddleware(AddUserAccessGroupDto, 'body'),
      createUserLogMiddleware,
      this.accessGroupController.removeUserFromAccessGroup,
    );

    this.router.post(
      '/party/accessgroup/:partyId/resource',
      authMiddleware,
      validationMiddleware(AddResourceToAccessGroupDto, 'body'),
      createUserLogMiddleware,
      this.accessGroupController.addResourceToAccessGroup,
    );
    this.router.delete(
      '/party/accessgroup/:partyId/resource',
      authMiddleware,
      validationMiddleware(AddResourceToAccessGroupDto, 'body'),
      createUserLogMiddleware,
      this.accessGroupController.removeResourceFromAccessGroup,
    );
    this.router.get(
      '/party/accessgroup/:partyId/resource',
      authMiddleware,
      createUserLogMiddleware,
      this.accessGroupController.getResourceOfAccessGroup,
    );
  }
}

export default accessgroupRoute;
