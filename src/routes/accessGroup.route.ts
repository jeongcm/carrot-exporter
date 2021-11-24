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
    this.router.post(`${this.path}`,this.authservice.authenticate, validationMiddleware(CreateAccessGroupDto, 'body'), this.accessGroupsController.createAccessGroup);
  }
}

export default AccessGroupsRoute;
