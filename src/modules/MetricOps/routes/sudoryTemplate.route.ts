import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import SudoryTemplateController  from '../controllers/sudoryTemplate.controller';
import { CreateSudoryTemplateDto, UpdateSudoryTemplateDto } from '../dtos/sudoryTemplate.dto';
import createUserLogMiddleware from '@/modules/ApiGateway/middlewares/createUserLogMiddleware';

class SudoryTemplateRoute implements Routes {
  public router = Router();
  public sudoryTemplateController = new SudoryTemplateController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/sudoryTemplate',
      authMiddleware,
      createUserLogMiddleware,
      validationMiddleware(CreateSudoryTemplateDto, 'body'),
      this.sudoryTemplateController.createSudoryTemplate,
    );
    this.router.get('/sudoryTemplates', authMiddleware, createUserLogMiddleware,  this.sudoryTemplateController.getAllSudoryTemplate);
    this.router.get('/sudoryTemplate/:sudoryTemplateId', authMiddleware, createUserLogMiddleware,  this.sudoryTemplateController.getSudoryTemplateById);
    this.router.put(
      '/sudoryTemplate/:sudoryTemplateId',
      authMiddleware,
      createUserLogMiddleware,
      validationMiddleware(UpdateSudoryTemplateDto, 'body'),
      this.sudoryTemplateController.updateSudoryTemplate,
    );
  }
}

export default SudoryTemplateRoute;
