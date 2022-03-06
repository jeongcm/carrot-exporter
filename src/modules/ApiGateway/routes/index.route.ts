import { Router } from 'express';
import IndexController from '@/modules/ApiGateway/controllers/index.controller';
import { Routes } from '@/common/interfaces/routes.interface';

class IndexRoute implements Routes {
  public router = Router();
  public indexController = new IndexController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', this.indexController.index);
  }
}

export default IndexRoute;
