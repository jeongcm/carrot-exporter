import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import tableIdController from '@/modules/CommonService/controllers/tableId.controller';

class TableIdRoute implements Routes {
  public router = Router();
  public tableIdController = new tableIdController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // this.router.post('/tableId', authMiddleware, this.tableIdController.issueTableId);
    this.router.post('/tableId', this.tableIdController.issueTableId);
    this.router.post('/tableId/Bulk', this.tableIdController.issueTableIdBulk);
  }
}

export default TableIdRoute;
