import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';

import RolePartyController from '@modules/Role/controllers/roleParty.controller';

class RolePartyRoute implements Routes {
  public router = Router();

  public rolePartyController = new RolePartyController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/role/:roleId/party/:partyId', authMiddleware, this.rolePartyController.assignRole);
    this.router.delete('/role/:roleId/party/:partyId', authMiddleware, this.rolePartyController.unassignRole);
  }
}

export default RolePartyRoute;
