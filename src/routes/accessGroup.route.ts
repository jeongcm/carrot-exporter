import { Router } from 'express';
import AccessGroupController from '@controllers/accessGroup.controller';
import { CreateAccessGroupDto } from '@dtos/accessGroup.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import AuthService from '@services/auth.service';

class AccessGroupsRoute implements Routes {
  public router = Router();
  public accessGroupsController = new AccessGroupController();
  public authservice = new AuthService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/accessgroups', this.authservice.authenticate, this.accessGroupsController.getAccessGroups);
    this.router.get('/accessgroups/my', this.authservice.authenticate, this.accessGroupsController.getAccessGroupsByUserId);
    this.router.post(
      '/accessgroups',
      this.authservice.authenticate,
      validationMiddleware(CreateAccessGroupDto, 'body'),
      this.accessGroupsController.createAccessGroup,
    );
    this.router.get('/accessgroups/:id', this.authservice.authenticate, this.accessGroupsController.getAccessGroupById);
    this.router.put('/accessgroups/:id', this.authservice.authenticate, this.accessGroupsController.updateAccessGroup);
    this.router.post('/accessgroups/:id/members', this.authservice.authenticate, this.accessGroupsController.updateAccessGroupMembers);
    this.router.get('/accessgroups/:id/members', this.authservice.authenticate, this.accessGroupsController.getAccessGroupMembers);
    this.router.post('/accessgroups/:id/clusters', this.authservice.authenticate, this.accessGroupsController.updateAccessGroupClusters);
    this.router.get('/accessgroups/:id/clusters', this.authservice.authenticate, this.accessGroupsController.getAccessGroupClusters);
    this.router.post('/accessgroups/:id/channels', this.authservice.authenticate, this.accessGroupsController.updateAccessGroupChannels);
    this.router.get('/accessgroups/:id/channels', this.authservice.authenticate, this.accessGroupsController.getAccessGroupChannels);
  }
}

export default AccessGroupsRoute;
