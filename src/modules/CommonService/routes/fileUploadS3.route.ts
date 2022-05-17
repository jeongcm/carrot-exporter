import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import fileUploadS3Controller from '@/modules/CommonService/controllers/fileUploadS3.controller';
import AuthService from '@/modules/UserTenancy/services/auth.service';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import createUserLogMiddleware from '@/modules/ApiGateway/middlewares/createUserLogMiddleware';



class fileUploadS3Route implements Routes {
  public router = Router();
  public fileUploadS3Controller = new fileUploadS3Controller();
  public authservice = new AuthService();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/fileupload', authMiddleware, createUserLogMiddleware,this.fileUploadS3Controller.fileUploadS3);
  }
}

export default fileUploadS3Route;