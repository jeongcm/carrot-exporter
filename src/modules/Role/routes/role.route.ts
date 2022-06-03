import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';

import RoleController from '@modules/Role/controllers/role.controller';

class RoleRoute implements Routes {
  public router = Router();

  public roleController = new RoleController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/role', authMiddleware, this.roleController.getRoles);
  }
}

export default RoleRoute;
