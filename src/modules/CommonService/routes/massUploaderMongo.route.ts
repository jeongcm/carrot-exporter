import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import massUploaderMongoController from '@/modules/CommonService/controllers/massUploaderMongo.controller';

class massUploaderRoute implements Routes {
  public router = Router();
  public massUploaderMongoController = new massUploaderMongoController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/resourceMassMongo',
      //validationMiddleware(ExecutorUuidDto, 'body'),
      this.massUploaderMongoController.massUploadMongoForResource,
    );
    this.router.post(
      '/metricReceivedMassVm',
      //validationMiddleware(ExecutorUuidDto, 'body'),
      this.massUploaderMongoController.massUploadVMForMetricReceived,
    );
  }
}

export default massUploaderRoute;
