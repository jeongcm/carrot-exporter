import DB from '@/database';
import { ICoupon } from '@/common/interfaces/coupon.interface';
import { IDiscount } from '@/common/interfaces/discount.interface';
import { CouponDto } from '../dtos/coupon.dto';
import { HttpException } from '@/common/exceptions/HttpException';
import { isEmpty } from '@/common/utils/util';
import tableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import { BillingAccountDto } from '../dtos/billingAccount.dto';
import AddressService from '@/modules/Address/services/address.service';
import PaymentTenderService from './paymentTender.service';
import { IBillingAccount } from '@/common/interfaces/billingAccount.interface';
const { Op } = require('sequelize');

class BillingAccountService {
  public coupon = DB.Coupon;
  public discount = DB.Discount;
  public billingAccount = DB.BillingAccount;
  public tableIdService = new tableIdService();
  public addressService = new AddressService();
  public paymentTenderService = new PaymentTenderService();

  public async createBillingAccount(billingAccountData: BillingAccountDto, customerAccountKey: number, partyId: string): Promise<IBillingAccount> {
    if (isEmpty(billingAccountData)) throw new HttpException(400, 'BillingAccount must not be empty');
    // get address key based on addressId
    const addressKey: number = await this.addressService.findAdreesKeyById(billingAccountData.addressId);
    // get payment tender key from paymentTender table
    const paymentTenderKey: number = await this.paymentTenderService.findTenderKeyById(billingAccountData.paymentTenderId);
    // get billingAccountId from billingAccount table
    const tableIdName: string = 'BillingAccount';
    const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdName);
    const billingAccountId: string = responseTableIdData.tableIdFinalIssued;
    const currentDate = new Date();
    const newbillingAccount = {
      ...billingAccountData,
      customerAccountKey: customerAccountKey,
      addressKey,
      paymentTenderKey,
      billingAccountId,
      createdAt: currentDate,
      createdBy: partyId,
    };
    const newBillingAccountData: IBillingAccount = await this.billingAccount.create(newbillingAccount);
    return newBillingAccountData;
  }

  public async getBillingAccount(): Promise<IBillingAccount[]> {
    const allBillingAccount: IBillingAccount[] = await this.billingAccount.findAll({
      where: { deletedAt: null },
      attributes: { exclude: ['billingAccountKey', 'deletedAt'] },
    });

    return allBillingAccount;
  }

  public async getBillingAccountKeyById(billingAccountId: string): Promise<number> {
    const billingAccount: IBillingAccount = await this.billingAccount.findOne({
      where: {
        billingAccountId,
        deletedAt: {
          [Op.eq]: null,
        }
      }
    });

    return billingAccount.billingAccountKey;
  }

  public async getBillingAccountById(billingAccountId: string): Promise<IBillingAccount> {
    const billingAccount: IBillingAccount = await this.billingAccount.findOne({
      where: {
        billingAccountId,
        deletedAt: {
          [Op.eq]: null,
        }
      },
      attributes: { exclude: ['billingAccountKey','deletedAt'] },
    });

    return billingAccount;
  }

  public async updateBillingAccountById(
    billingAccountId: string,
    billingAccountData: BillingAccountDto,
    customerAccountKey: number,
    partyId: string,
  ): Promise<IBillingAccount> {
    if (isEmpty(billingAccountData)) throw new HttpException(400, 'Billing Account data must not be empty');

    const findBillingAccount: IBillingAccount = await this.billingAccount.findOne({ where: { billingAccountId } });

    if (!findBillingAccount) throw new HttpException(400, "Billing Account doesn't exist");
    // get address key based on addressId
    const addressKey: number = await this.addressService.findAdreesKeyById(billingAccountData.addressId);
    // get payment tender key from paymentTender table
    const paymentTenderKey: number = await this.paymentTenderService.findTenderKeyById(billingAccountData.paymentTenderId);

    const updatedBillingAccount = {
      ...billingAccountData,
      customerAccountKey: customerAccountKey,
      addressKey,
      paymentTenderKey,
      updatedBy: partyId,
      updatedAt: new Date(),
    };

    await this.billingAccount.update(updatedBillingAccount, { where: { billingAccountId: billingAccountId } });

    return await this.getBillingAccountById(billingAccountId);
  }

  public async deleteBillingAccount(customerAccountKey: number, billingAccountId: string) {
    try {
      const deleteBillingAccountData = {
        deletedAt: new Date(),
      };

      const result = await this.billingAccount.update(deleteBillingAccountData, {
        where: {
          customerAccountKey: customerAccountKey,
          billingAccountId: billingAccountId,
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

export default BillingAccountService;
