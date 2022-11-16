import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import massUploaderController from '@/modules/CommonService/controllers/massUploader.controller';
//import AuthService from '@/modules/UserTenancy/services/auth.service';
//import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';

class massUploaderRoute implements Routes {
  public router = Router();
  public massUploaderController = new massUploaderController();
  // public authservice = new AuthService();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // this.router.post('/tableId', authMiddleware, this.tableIdController.issueTableId);
    this.router.post('/resourceMass', this.massUploaderController.massUploadForResource);
  }
}

export default massUploaderRoute;
