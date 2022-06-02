import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import fileUploadController from '@/modules/CommonService/controllers/fileUpload.controller';
import AuthService from '@/modules/UserTenancy/services/auth.service';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import createUserLogMiddleware from '@/modules/ApiGateway/middlewares/createUserLogMiddleware';
import multer from 'multer';

class fileUploadRoute implements Routes {
  public router = Router();
  public fileUploadController = new fileUploadController();
  public authservice = new AuthService();
  public storage = multer.memoryStorage();
  public upload = multer({ storage: this.storage });
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/file/upload',
      // authMiddleware, createUserLogMiddleware,
      this.upload.single('file'),
      this.fileUploadController.fileUpload,
    );

    this.router.get(
      '/file/:fileName',
      // authMiddleware, createUserLogMiddleware,
      this.fileUploadController.getUploadedFile,
    );

    this.router.delete(
      '/file',
      // authMiddleware, createUserLogMiddleware,
      this.fileUploadController.deleteUploadedFile,
    );
  }
}

export default fileUploadRoute;
