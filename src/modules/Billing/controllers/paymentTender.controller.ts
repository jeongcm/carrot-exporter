import { NextFunction, Response } from 'express';
import { IRequestWithUser } from '@/common/interfaces/party.interface';
import { PaymentTenderDto } from '../dtos/paymentTender.dto';
import PaymentTenderService from '../services/paymentTender.service';
import { IPaymentTender } from '@/common/interfaces/paymentTender.interface';

class PaymentTenderController {
  public paymentTenderService = new PaymentTenderService();

  public getPaymentTender = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      // const customerAccountKey = req.customerAccountKey;
      const allPaymentTender: IPaymentTender[] = await this.paymentTenderService.getPaymentTender();
      res.status(200).json({ data: allPaymentTender, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public createPaymentTender = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const currentUserId = req?.user?.partyId;
      const paymentTenderData: PaymentTenderDto = req.body;
      const createPaymentTender: IPaymentTender = await this.paymentTenderService.createPaymentTender(paymentTenderData, currentUserId);
      const {
        paymentTenderId,
        billingAccountKey,
        createdBy,
        createdAt,
        paymentTenderDefault,
        paymentTenderDetails1,
        paymentTenderDetails2,
        paymentTenderDetails3,
        paymentTenderDetails4,
        isValidated,
        validatedAt,
        paymentTenderType,
      } = createPaymentTender;

      const response = {
        paymentTenderId,
        billingAccountKey,
        createdBy,
        createdAt,
        paymentTenderDefault,
        paymentTenderDetails1,
        paymentTenderDetails2,
        paymentTenderDetails3,
        paymentTenderDetails4,
        isValidated,
        validatedAt,
        paymentTenderType,
      };
      res.status(201).json({ data: response, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public getPaymentTenderById = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const paymentTenderId = req.params.paymentTenderId;

    try {
      const paymentTender: IPaymentTender = await this.paymentTenderService.findTenderKeyById(paymentTenderId);
      res.status(200).json({ data: paymentTender, message: `find PaymentTender id(${paymentTenderId}) ` });
    } catch (error) {
      next(error);
    }
  };

  public updatePaymentTenderById = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const paymentTenderId = req.params.paymentTenderId;
      const paymentTenderData = req.body;
      const currentUserId = req?.user?.partyId;

      const updatePaymentTenderData: IPaymentTender = await this.paymentTenderService.updatePaymentTenderById(
        paymentTenderId,
        paymentTenderData,
        currentUserId,
      );

      res.status(200).json({ data: updatePaymentTenderData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deletePaymentTender = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const paymentTenderId: string = req.params.paymentTenderId;

      const deletedPaymentTender = await this.paymentTenderService.deletePaymentTender(paymentTenderId);
      if (deletedPaymentTender) {
        res.status(200).json({ data: deletedPaymentTender, message: 'deleted' });
      } else {
        res.status(204).json({ data: deletedPaymentTender, message: 'No Content' });
      }
    } catch (error) {
      next(error);
    }
  };
}

export default PaymentTenderController;
