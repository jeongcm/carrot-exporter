import { NextFunction, Response } from 'express';
import { IRequestWithUser } from '@/common/interfaces/party.interface';
import { PaymentTenderDto } from '../dtos/paymentTender.dto';
import PaymentTenderService from '../services/paymentTender.service';
import { IPaymentTender } from '@/common/interfaces/paymentTender.interface';

class PaymentTenderController {
  public paymentTenderService = new PaymentTenderService();

  public getPaymentTender = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.customerAccountKey;
      const allPaymentTender: IPaymentTender[] = await this.paymentTenderService.getPaymentTender();
      res.status(200).json({ data: allPaymentTender, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public createPaymentTender = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const {
        user: { partyId },
      } = req;
      const paymentTenderData: PaymentTenderDto = req.body;
      const createPaymentTender: IPaymentTender = await this.paymentTenderService.createPaymentTender(paymentTenderData, partyId);
      res.status(201).json({ data: createPaymentTender, message: 'created' });
    } catch (error) {
      next(error);
    }
  };
}

export default PaymentTenderController;
