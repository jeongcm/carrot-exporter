/*
Access Group Routes

Notion:
https://www.notion.so/nexclipper/Feature-Access-Group-21340340a14c4037b22ebda3ebc76e83
*/
import { Router } from 'express';
import AccessGroupController from '@/modules/UserTenancy/controllers/accessGroup.controller';
import { CreateAccessGroupDto } from '@/modules/UserTenancy/dtos/accessGroup.dto';
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import AuthService from '@/modules/UserTenancy/services/auth.service';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';

class AccessGroupsRoute implements Routes {
  public router = Router();
  public accessGroupsController = new AccessGroupController();
  public authservice = new AuthService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/accessgroups', authMiddleware, this.accessGroupsController.getAccessGroups);
    this.router.get('/accessgroups/my', authMiddleware, this.accessGroupsController.getAccessGroupsByUserId);
    this.router.post(
      '/accessgroups',
      authMiddleware,
      validationMiddleware(CreateAccessGroupDto, 'body'),
      this.accessGroupsController.createAccessGroup,
    );
    this.router.get('/accessgroups/:id', authMiddleware, this.accessGroupsController.getAccessGroupById);
    this.router.put('/accessgroups/:id', authMiddleware, this.accessGroupsController.updateAccessGroup);
    this.router.post('/accessgroups/:id/members', authMiddleware, this.accessGroupsController.updateAccessGroupMembers);
    this.router.get('/accessgroups/:id/members', authMiddleware, this.accessGroupsController.getAccessGroupMembers);
    this.router.post('/accessgroups/:id/clusters', authMiddleware, this.accessGroupsController.updateAccessGroupClusters);
    this.router.get('/accessgroups/:id/clusters', authMiddleware, this.accessGroupsController.getAccessGroupClusters);
    this.router.post('/accessgroups/:id/channels', authMiddleware, this.accessGroupsController.updateAccessGroupChannels);
    this.router.get('/accessgroups/:id/channels', authMiddleware, this.accessGroupsController.getAccessGroupChannels);
    this.router.get('/accessgroups/:id/detail', authMiddleware, this.accessGroupsController.getAccessGroupDetail);
  }
}

export default AccessGroupsRoute;
