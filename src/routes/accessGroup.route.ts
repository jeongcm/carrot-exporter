import { Router } from 'express';
import AccessGroupController from '@controllers/accessGroup.controller';
import { CreateAccessGroupDto } from '@dtos/accessGroup.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import AuthService from '@services/auth.service';
import authMiddleware from '@middlewares/auth.middleware';


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
  }
}

export default AccessGroupsRoute;
