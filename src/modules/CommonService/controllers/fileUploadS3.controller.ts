import { NextFunction, Request, Response } from 'express';
import fileUploadS3Service from '@/modules/CommonService/services/fileUploadS3.service';

class fileUploadS3Controller {
  public fileUploadS3Service = new fileUploadS3Service();

  public fileUploadS3 = async (req: any, res: Response, next: NextFunction) => {
    if (!req.files) res.status(400).json({ error: 'No files were uploaded.' });
    try {
      const fileUploadResult =  await this.fileUploadS3Service.upload(req.files);
      res.status(200).json({ message: `file Uploaded Successfully` });
    } catch (error) {
      console.log('errror', error);
      next(error);
    }
  };
}

export default fileUploadS3Controller;
