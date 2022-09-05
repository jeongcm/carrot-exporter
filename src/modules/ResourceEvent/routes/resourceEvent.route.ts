import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import ResourceEventController from '@/modules/ResourceEvent/controllers/resourceEvent.controller';
//import AuthService from '@/modules/UserTenancy/services/auth.service';
//import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';


class resourceEventRoute implements Routes {
  public router = Router();
  public resourceEventController = new ResourceEventController();
 // public authservice = new AuthService();
  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    // this.router.post('/tableId', authMiddleware, this.tableIdController.issueTableId);
    this.router.post('/resourceEventMass', this.resourceEventController.massUploadForResource);
  }
}

export default resourceEventRoute;
