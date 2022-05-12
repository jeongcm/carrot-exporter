import DB from '@/database';
import { HttpException } from '@/common/exceptions/HttpException';
import { isEmpty } from '@/common/utils/util';
import tableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import { BillingAccountDto } from '../dtos/billingAccount.dto';
import AddressService from '@/modules/Address/services/address.service';
import { IBillingAccount } from '@/common/interfaces/billingAccount.interface';
import { BillingAccountDiscountDto } from '../dtos/billingAccountDiscount.dto';
import BillingAccountService from './billingAccount.service';
import DiscountService from './discount.service';
import { IDiscount } from '@/common/interfaces/discount.interface';
import { IBillingAccountDiscount } from '@/common/interfaces/billingAccountDiscount.interface';
const { Op } = require('sequelize');

class BillingAccountDiscountService {
  public tableIdService = new tableIdService();
  public billingAccountService = new BillingAccountService();
  public discountService = new DiscountService();
  public billingAccountDiscount = DB.BillingAccountDiscount;

  public async createBillingAccountDiscount(
    billingAccountDiscountData: BillingAccountDiscountDto,
    partyId: string,
  ): Promise<IBillingAccountDiscount> {
    if (isEmpty(billingAccountDiscountData)) throw new HttpException(400, 'BillingAccountDiscount must not be empty');
    // get billingAccountKey from BillingAccount based on billingAccountId
    const billingAccountKey: number = await this.billingAccountService.getBillingAccountKeyById(billingAccountDiscountData.billingAccountId);
    // get discountKey from discount table based on discountId
    const discountData: IDiscount = await this.discountService.getDiscountById(billingAccountDiscountData.discountId);

    const tableIdName: string = 'BillingAccountDiscount';
    const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdName);
    const billingAccountDiscountId: string = responseTableIdData.tableIdFinalIssued;
    const currentDate = new Date();
    const newbillingAccountDiscount = {
      ...billingAccountDiscountData,
      billingAccountKey,
      billingAccountDiscountId,
      discountKey: discountData.discountKey,
      createdAt: currentDate,
      createdBy: partyId,
    };
    const newBillingAccountDiscountData: IBillingAccountDiscount = await this.billingAccountDiscount.create(newbillingAccountDiscount);
    return newBillingAccountDiscountData;
  }

  public async getBillingAccountDiscount(): Promise<IBillingAccountDiscount[]> {
    const allBillingAccountDiscount: IBillingAccountDiscount[] = await this.billingAccountDiscount.findAll({
      where: { deletedAt: null },
      attributes: { exclude: ['billingAccountDiscountKey', 'deletedAt'] },
    });

    return allBillingAccountDiscount;
  }

  public async getBillingAccountDiscountKeyById(billingAccountId: string): Promise<number> {
    const billingAccount: IBillingAccount = await this.billingAccount.findOne({
      where: {
        billingAccountId,
        deletedAt: {
          [Op.eq]: null,
        },
      },
    });

    return billingAccount.billingAccountKey;
  }

  public async getBillingAccountDiscountById(billingAccountDiscountId: string): Promise<IBillingAccountDiscount> {
    const billingAccountDuscount: IBillingAccountDiscount = await this.billingAccountDiscount.findOne({
      where: {
        billingAccountDiscountId,
        deletedAt: {
          [Op.eq]: null,
        },
      },
      attributes: { exclude: ['billingAccountDiscountKey', 'deletedAt'] },
    });

    return billingAccountDuscount;
  }

  public async updateBillingAccountDiscountById(
    billingAccountDiscountId: string,
    billingAccountDiscountData: BillingAccountDiscountDto,
    partyId: string,
  ): Promise<IBillingAccountDiscount> {
    if (isEmpty(billingAccountDiscountData)) throw new HttpException(400, 'Billing Account Discount data must not be empty');
    // get billingAccountKey from BillingAccount based on billingAccountId
    const billingAccountKey: number = await this.billingAccountService.getBillingAccountKeyById(billingAccountDiscountData.billingAccountId);
    // get discountKey from discount table based on discountId
    const discountData: IDiscount = await this.discountService.getDiscountById(billingAccountDiscountData.discountId);

    const findBillingAccountDiscount: IBillingAccountDiscount = await this.billingAccountDiscount.findOne({ where: { billingAccountDiscountId } });

    if (!findBillingAccountDiscount) throw new HttpException(400, "Billing Account Discount doesn't exist");

    const updatedBillingAccountDiscount = {
      ...billingAccountDiscountData,
      updatedBy: partyId,
      billingAccountKey,
      discountKey: discountData.discountKey,
      updatedAt: new Date(),
    };

    await this.billingAccountDiscount.update(updatedBillingAccountDiscount, { where: { billingAccountDiscountId: billingAccountDiscountId } });

    return await this.getBillingAccountDiscountById(billingAccountDiscountId);
  }

  public async deleteBillingAccountDiscount(billingAccountDiscountId: string) {
    try {
      const deleteBillingAccountDiscountData = {
        deletedAt: new Date(),
      };

      const result = await this.billingAccountDiscount.update(deleteBillingAccountDiscountData, {
        where: {
            billingAccountDiscountId: billingAccountDiscountId,
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

export default BillingAccountDiscountService;
