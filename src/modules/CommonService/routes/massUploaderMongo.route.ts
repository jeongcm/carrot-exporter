import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import massUploaderMongoController from '@/modules/CommonService/controllers/massUploaderMongo.controller';
//import AuthService from '@/modules/UserTenancy/services/auth.service';
//import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';


class massUploaderRoute implements Routes {
  public router = Router();
  public massUploaderMongoController = new massUploaderMongoController();
 // public authservice = new AuthService();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/resourceMassMongo', 
    //validationMiddleware(ExecutorUuidDto, 'body'), 
    this.massUploaderMongoController.massUploadMongoForResource)
    this.router.post('/metricReceivedMassVm', 
    //validationMiddleware(ExecutorUuidDto, 'body'), 
    this.massUploaderMongoController.massUploadVMForMetricReceived)

  }

}

export default massUploaderRoute;
