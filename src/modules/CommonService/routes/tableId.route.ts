import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import tableIdController from '@/modules/CommonService/controllers/tableId.controller';
import AuthService from '@/modules/UserTenancy/services/auth.service';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';

class TableIdRoute implements Routes {
  public router = Router();
  public tableIdController = new tableIdController();
  public authservice = new AuthService();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // this.router.post('/tableId', authMiddleware, this.tableIdController.issueTableId);
    this.router.post('/tableId', this.tableIdController.issueTableId);
  }
}

export default TableIdRoute;
