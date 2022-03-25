import { NextFunction, Request, Response } from 'express';
import { ICommonCode } from '@/common/interfaces/commonCode.interface';
import CommonCodeService from '../services/commonCode.service';
import { CommonCodeDto } from '../dtos/commonCode.dto';
import { RequestWithUser } from '@/common/interfaces/auth.interface';

class CommonCodeController {
  public commonCodeService = new CommonCodeService();

  public createCommonCode = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const commonCodeData: CommonCodeDto = req.body;
      const currentUserId = req.user.id;
      const createCommonCodeData: ICommonCode = await this.commonCodeService.createCommonCode(commonCodeData,currentUserId);
      res.status(201).json({ data: createCommonCodeData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public getAllCommonCode = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const findAllCommonCodeData: CommonCodeDto[] = await this.commonCodeService.getAllCommonCode();
      res.status(200).json({ data: findAllCommonCodeData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getCommonCode = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const id = req.params.id;

    try {
      const commonCode: ICommonCode = await this.commonCodeService.getCommonCodeById(id);
      res.status(200).json({ data: commonCode, message: `find commonCode id(${id}) ` });
    } catch (error) {
      next(error);
    }
  };

  public updateCommonCode = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const commonCodeId = req.params.id;
      const commonCodeData = req.body;
      const currentUserId = req.user.id;
      const updateCommonCodeData: ICommonCode = await this.commonCodeService.updateCommonCode(commonCodeId, commonCodeData, currentUserId);
      res.status(200).json({ data: updateCommonCodeData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

}

export default CommonCodeController;
