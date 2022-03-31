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
      const createCommonCodeData: ICommonCode = await this.commonCodeService.createCommonCode(commonCodeData, currentUserId);

      const { commonCodeId, createdBy, createdAt, commonCodeDescription, commonCodeDisplayENG, commonCodeDisplayKOR } = createCommonCodeData;

      const response = {
        commonCodeId,
        createdBy,
        createdAt,
        commonCodeDescription,
        commonCodeDisplayENG,
        commonCodeDisplayKOR,
      };
      res.status(201).json({ data: response, message: 'created' });
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

  public getCommonCodeById = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const commonCodeId = req.params.commonCodeId;

    try {
      const commonCode: ICommonCode = await this.commonCodeService.getCommonCodeById(commonCodeId);
      res.status(200).json({ data: commonCode, message: `find commonCode id(${commonCodeId}) ` });
    } catch (error) {
      next(error);
    }
  };

  public updateCommonCodeById = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const commonCodeId = req.params.commonCodeId;
      const commonCodeData = req.body;
      const currentUserId = req.user.id;
      const updateCommonCodeData: ICommonCode = await this.commonCodeService.updateCommonCodeById(commonCodeId, commonCodeData, currentUserId);
      res.status(200).json({ data: updateCommonCodeData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };
}

export default CommonCodeController;
