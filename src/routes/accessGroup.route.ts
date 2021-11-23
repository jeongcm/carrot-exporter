import { Router } from 'express';
import AccessGroupController from '@controllers/accessGroup.controller';
import { CreateAccessGroupDto } from '@dtos/accessGroup.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';

class AccessGroupsRoute implements Routes {
  public path = '/accessgroups';
  public router = Router();
  public accessGroupsController = new AccessGroupController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.accessGroupsController.getAccessGroups);
    this.router.post(`${this.path}`, validationMiddleware(CreateAccessGroupDto, 'body'), this.accessGroupsController.createAccessGroup);
  }
}

export default AccessGroupsRoute;
