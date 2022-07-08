import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import systemAuthMiddleware from '@/modules/ApiGateway/middlewares/systemAuth.middleware';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import {ExporterDto} from '@modules/Exporters/dtos/exporters.dto';
import exporterController from '@modules/Exporters/controllers/exporters.controller';
import createUserLogMiddleware from '@/modules/ApiGateway/middlewares/createUserLogMiddleware';

class ExporterRoute implements Routes {
  public router = Router();
  public exporterController = new exporterController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/exporter',
      authMiddleware,
      validationMiddleware(ExporterDto, 'body'),
      //      createUserLogMiddleware,
      this.exporterController.createExporter,
    );
    this.router.get(
      '/exporter/:exporterId',
      authMiddleware,
      //     createUserLogMiddleware,
      this.exporterController.getExporter,
    );
    this.router.get(
      '/exporters',
      authMiddleware,
      //     createUserLogMiddleware,
      this.exporterController.getExportersAll,
    );

  }
}

export default ExporterRoute;
