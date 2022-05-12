import DB from '@/database';
import { HttpException } from '@/common/exceptions/HttpException';
import { isEmpty } from '@/common/utils/util';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import { IPaymentTender } from '@/common/interfaces/paymentTender.interface';
import { PaymentTenderDto } from '../dtos/paymentTender.dto';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import { IBillingAccount } from '@/common/interfaces/billingAccount.interface';
const { Op } = require('sequelize');

class PaymentTenderService {
  public paymentTender = DB.PaymentTender;
  public billingAccount = DB.BillingAccount;
  public tableIdService = new TableIdService();

  public async createPaymentTender(paymentTenderData: PaymentTenderDto, currentUserId: string): Promise<IPaymentTender> {
    if (isEmpty(paymentTenderData)) throw new HttpException(400, 'PaymentTender  must not be empty');
    const currentBillingAccount: IBillingAccount = await this.billingAccount.findOne({
      where: { billingAccountId: paymentTenderData.billingAccountId },
    });

    if (!currentBillingAccount) {
      throw new HttpException(400, 'billingAccountId not found');
    }

    try {
      const tableIdTableName = 'PaymentTender';
      const tableId = await this.tableIdService.getTableIdByTableName(tableIdTableName);

      if (!tableId) {
        return;
      }

      const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdTableName);

      const createPaymentTender: IPaymentTender = await this.paymentTender.create({
        paymentTenderId: responseTableIdData.tableIdFinalIssued,
        createdBy: currentUserId,
        billingAccountKey: currentBillingAccount.billingAccountKey,
        ...paymentTenderData,
        validatedAt: new Date(),
      });

      return createPaymentTender;
    } catch (error) {}
  }

  public async getPaymentTender(): Promise<IPaymentTender[]> {
    const allPaymentTender: IPaymentTender[] = await this.paymentTender.findAll({
      where: { deletedAt: null },
      attributes: { exclude: ['paymentTenderKey', 'deletedAt'] },
    });

    return allPaymentTender;
  }

  public async findTenderKeyById(paymentTenderId: string): Promise<IPaymentTender> {
    const paymentTender: IPaymentTender = await this.paymentTender.findOne({
      where: { paymentTenderId, deletedAt: null },
      attributes: { exclude: ['paymentTenderKey', 'deletedAt'] },
    });

    return paymentTender;
  }

  public async updatePaymentTenderById(paymentTenderId: string, paymentTenderData: PaymentTenderDto, currentUserId: string): Promise<IPaymentTender> {
    if (isEmpty(paymentTenderData)) throw new HttpException(400, 'PaymentTender  must not be empty');

    const findPaymentTender: IPaymentTender = await this.paymentTender.findOne({ where: { paymentTenderId: paymentTenderId } });

    if (!findPaymentTender) throw new HttpException(400, "PaymentTender  doesn't exist");

    const updatedPaymentTender = {
      ...paymentTenderData,
      updatedBy: currentUserId,
    };

    await this.paymentTender.update(updatedPaymentTender, { where: { paymentTenderId: paymentTenderId } });

    return this.findTenderKeyById(paymentTenderId);
  }

  public async deletePaymentTender(paymentTenderId: string) {
    try {
      const deletePaymentTenderData = {
        deletedAt: new Date(),
      };

      const result = await this.paymentTender.update(deletePaymentTenderData, {
        where: {
          paymentTenderId: paymentTenderId,
          deletedAt: {
            [Op.eq]: null,
          },
        },
      });
      if (result[0] == 1) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }
}

export default PaymentTenderService;
