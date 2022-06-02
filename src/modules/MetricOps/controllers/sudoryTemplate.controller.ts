import { NextFunction, Response } from 'express';
import { IRequestWithUser } from '@/common/interfaces/party.interface';

import { CreateSudoryTemplateDto, UpdateSudoryTemplateDto } from '../dtos/sudoryTemplate.dto';
import SudoryTemplateService from '../services/sudoryTemplate.service';
import { ISudoryTemplate } from '@/common/interfaces/sudoryTemplate.interface';

class SudoryTemplateController {
  public sudoryTemplateService = new SudoryTemplateService();

  public getAllSudoryTemplate = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const sudoryTemplateList: ISudoryTemplate[] = await this.sudoryTemplateService.findAllSudoryTemplate();
      res.status(200).json({ data: sudoryTemplateList, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  // public deleteSudoryTemplate = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
  //   try {
  //     const billingAccountId: string = req.params.billingAccountId;
  //     const customerAccountKey = req.customerAccountKey;
  //     const deletedFlag = await this.billingAccountService.deleteBillingAccount(customerAccountKey, billingAccountId);
  //     if (deletedFlag) {
  //       res.status(200).json({ data: deletedFlag, message: 'deleted' });
  //     } else {
  //       res.status(204).json({ data: deletedFlag, message: 'No Content' });
  //     }
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  public createSudoryTemplate = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const {
        user: { partyId } = {},
        systemId,
        customerAccountKey
      } = req;
      console.log("customerAccountKey", customerAccountKey)
      const sudoryTemplateData: CreateSudoryTemplateDto = req.body;
      const newSudoryTemplate: ISudoryTemplate = await this.sudoryTemplateService.createSudoryTemplate(
        sudoryTemplateData,
        systemId || partyId,
      );
      res.status(201).json({ data: newSudoryTemplate, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateSudoryTemplate = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const {
        user: { partyId } = {},
        params: { sudoryTemplateId } = {}
      } = req;
      const sudoryTemplateData: UpdateSudoryTemplateDto = req.body;
      const updateSudoryTemplateData: ISudoryTemplate = await this.sudoryTemplateService.updateSudoryTemplate(
        sudoryTemplateId,
        sudoryTemplateData,
        partyId,
      );
      res.status(200).json({ data: updateSudoryTemplateData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public getSudoryTemplateById = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const {
        user: { partyId },
        params: { sudoryTemplateId }
      } = req;
      const sudoryTemplateData: ISudoryTemplate = await this.sudoryTemplateService.findSudoryTemplateById(
        sudoryTemplateId
      );
      res.status(200).json({ data: sudoryTemplateData, message: 'find' });
    } catch (error) {
      next(error);
    }
  };
}

export default SudoryTemplateController;
