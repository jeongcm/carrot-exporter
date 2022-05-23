import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import BayesianModelController  from '../controllers/bayesianModel.controller';
import { CreateBayesianModelDto, UpdateBayesianModelDto } from '../dtos/bayesianModel.dto';
import systemAuthMiddleware from '@/modules/ApiGateway/middlewares/systemAuth.middleware';

class BayesianModelRoute implements Routes {
  public router = Router();
  public bayesianModelController = new BayesianModelController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    
  }
}

export default BayesianModelRoute;
