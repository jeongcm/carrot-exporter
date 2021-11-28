import { Router } from 'express';
import AccessGroupController from '@controllers/accessGroup.controller';
import { CreateAccessGroupDto } from '@dtos/accessGroup.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import AuthService from '@services/auth.service'

class AccessGroupsRoute implements Routes {
  public path = '/accessgroups';
  public router = Router();
  public accessGroupsController = new AccessGroupController();
  public authservice = new AuthService();
  
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`,this.authservice.authenticate, this.accessGroupsController.getAccessGroups);
    this.router.get(`${this.path}/my`,this.authservice.authenticate, this.accessGroupsController.getAccessGroupsByUserId);
    this.router.post(`${this.path}`,this.authservice.authenticate,validationMiddleware(CreateAccessGroupDto, 'body'), this.accessGroupsController.createAccessGroup);
    this.router.get(`${this.path}/:id`,this.authservice.authenticate, this.accessGroupsController.getAccessGroupById);
    this.router.put(`${this.path}/:id`,this.authservice.authenticate, this.accessGroupsController.updateAccessGroup);
    this.router.post(`${this.path}/:id/members`,this.authservice.authenticate, this.accessGroupsController.updateAccessGroupMembers);
    this.router.post(`${this.path}/:id/clusters`,this.authservice.authenticate, this.accessGroupsController.updateAccessGroupClusters);
    this.router.post(`${this.path}/:id/channels`,this.authservice.authenticate, this.accessGroupsController.updateAccessGroupChannels);
  }
}

export default AccessGroupsRoute;
