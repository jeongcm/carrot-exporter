import DB from '@/database';
import { HttpException } from '@/common/exceptions/HttpException';
import { isEmpty } from '@/common/utils/util';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import { IPaymentTender } from '@/common/interfaces/paymentTender.interface';
import { PaymentTenderDto } from '../dtos/paymentTender.dto';
import BillingAccountService from './billingAccount.service';
import TableIdService from '@/modules/CommonService/services/tableId.service';
const { Op } = require('sequelize');

class PaymentTenderService {
  public paymentTender = DB.PaymentTender;
  public billingAccountService = new BillingAccountService();
  public tableIdService = new TableIdService();

  public async createPaymentTender(paymentTenderData: PaymentTenderDto, partyId: string): Promise<IPaymentTender> {
    if (isEmpty(paymentTenderData)) throw new HttpException(400, 'PaymentTender must not be empty');
    // get billingAccountKey from billingAccount table
    const billingAccountKey: number = await this.billingAccountService.getBillingAccountKeyById(paymentTenderData.billingAccountId);

    const tableIdName: string = 'PaymentTender';
    const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdName);
    const paymentTenderId: string = responseTableIdData.tableIdFinalIssued;
    const currentDate = new Date();
    const newPaymentTender = {
      ...paymentTenderData,
      billingAccountKey,
      paymentTenderId,
      validatedAt: currentDate,
      createdAt: currentDate,
      createdBy: partyId,
    };
    const newPaymentTenderData: IPaymentTender = await this.paymentTender.create(newPaymentTender);
    return newPaymentTenderData;
  }


  public async getPaymentTender(): Promise<IPaymentTender[]> {
    const allPaymentTender: IPaymentTender[] = await this.paymentTender.findAll({
      where: { deletedAt: null },
      attributes: { exclude: ['paymentTenderKey', 'deletedAt'] },
    });

    return allPaymentTender;
  }

  public async findTenderKeyById(paymentTenderId: string): Promise<number> {
    if (isEmpty(paymentTenderId)) throw new HttpException(400, 'Not a valid Payment Tender Id');

    const findPaymentTender: IPaymentTender = await this.paymentTender.findOne({
      where: { paymentTenderId, deletedAt: null },
      attributes: { exclude: ['paymentTenderId', 'deletedAt', 'updatedBy', 'createdBy'] },
    });
    if (!findPaymentTender) throw new HttpException(409, 'Payment Tender Not found');

    return findPaymentTender.paymentTenderKey;
  }
}

export default PaymentTenderService;
