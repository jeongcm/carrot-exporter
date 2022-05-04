import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import CommonCodeController from '../controllers/commonCode.controller';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import { CommonCodeDto } from '../dtos/commonCode.dto';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import createUserLogMiddleware from '@/modules/ApiGateway/middlewares/createUserLogMiddleware';

class CommonCodeRoute implements Routes {
  public router = Router();
  public commonCodeController = new CommonCodeController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/commonCode',
      authMiddleware,
      validationMiddleware(CommonCodeDto, 'body'),
      createUserLogMiddleware,
      this.commonCodeController.createCommonCode,
    );
    this.router.get('/commonCode', authMiddleware, createUserLogMiddleware, this.commonCodeController.getAllCommonCode);
    this.router.get('/commonCode/:commonCodeId', authMiddleware, createUserLogMiddleware, this.commonCodeController.getCommonCodeById);
    this.router.put(
      '/commonCode/:commonCodeId',
      authMiddleware,
      validationMiddleware(CommonCodeDto, 'body'),
      createUserLogMiddleware,
      this.commonCodeController.updateCommonCodeById,
    );
  }
}

export default CommonCodeRoute;
