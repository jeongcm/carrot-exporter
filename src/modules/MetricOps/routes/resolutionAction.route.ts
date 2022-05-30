import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import ResolutionActionController  from '../controllers/resolutionAction.controller';
import { CreateResolutionActionDto, UpdateResolutionActionDto } from '../dtos/resolutionAction.dto';
import createUserLogMiddleware from '@/modules/ApiGateway/middlewares/createUserLogMiddleware';

class ResolutionActionRoute implements Routes {
  public router = Router();
  public resoltutionActionController = new ResolutionActionController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/resolutionAction',
      authMiddleware,
      createUserLogMiddleware,
      validationMiddleware(CreateResolutionActionDto, 'body'),
      this.resoltutionActionController.createResolutionAction,
    );
    this.router.get('/resolutionActions', authMiddleware, createUserLogMiddleware,  this.resoltutionActionController.getAllResolutionAction);
    this.router.get('/resolutionAction/:resolutionActionId', authMiddleware, createUserLogMiddleware,  this.resoltutionActionController.getResolutionActionById);
    this.router.put(
      '/resolutionAction/:resolutionActionId',
      authMiddleware,
      createUserLogMiddleware,
      validationMiddleware(UpdateResolutionActionDto, 'body'),
      this.resoltutionActionController.updateResolutionAction,
    );
  }
}

export default ResolutionActionRoute;
