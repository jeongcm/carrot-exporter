import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import CostController from '@modules/Cost/controllers/ncp/cost.controller';

class ResourceRoute implements Routes {
  public router = Router();
  public costCotroller = new CostController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/ncp/cost', this.costCotroller.uploadNcpCost);
  }
}

export default ResourceRoute;
