import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import systemAuthMiddleware from '@/modules/ApiGateway/middlewares/systemAuth.middleware';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';

import ResourceGroupController from '@modules/Resources/controllers/resourceGroup.controller';
import sudoryController from '@modules/CommonService/controllers/sudory.controller';
import createUserLogMiddleware from '@/modules/ApiGateway/middlewares/createUserLogMiddleware';

class SudoryRoute implements Routes {
  public router = Router();
  public resourceGroupController = new ResourceGroupController();
  public sudoryController = new sudoryController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      '/sudory/:clusterUuid',
      authMiddleware,
      //     createUserLogMiddleware,
      this.sudoryController.checkSudoryClient,
    );

  }
}

export default SudoryRoute;
