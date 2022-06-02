import { NextFunction, Request, Response } from 'express';
import FileUploadService from '@/modules/CommonService/services/fileUpload.service';

class fileUploadController {
  public fileUploadService = new FileUploadService();

  public fileUpload = async (req: any, res: Response, next: NextFunction) => {
    try {
      const fileUploadResult = await this.fileUploadService.upload(req);
      res.status(200).json({ message: 'File uploaded successfully' });
    } catch (error) {
      console.log('errror', error);
      next(error);
    }
  };

  public getUploadedFile = async (req: any, res: any, next: NextFunction) => {
    try {
      const fileUploadResult = await this.fileUploadService.get(req);
      res.contentType(fileUploadResult.ContentType);
      res.end(fileUploadResult.Body, 'binary');
    } catch (error) {
      next(error);
    }
  };

  public deleteUploadedFile = async (req: any, res: Response, next: NextFunction) => {
    try {
      const fileResult = await this.fileUploadService.delete(req);
      res.status(200).json({ message: 'file deleted successfully' });
    } catch (error) {
      console.log('errror', error);
      next(error);
    }
  };
}

export default fileUploadController;
