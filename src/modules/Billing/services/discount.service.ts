import DB from '@/database';
import { IDiscount } from '@/common/interfaces/discount.interface';
import { DiscountDto } from '../dtos/discount.dto';
import { HttpException } from '@/common/exceptions/HttpException';
import { isEmpty } from '@/common/utils/util';
import tableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
const { Op } = require('sequelize');

class DiscountService {
  public discount = DB.Discount;
  public tableIdService = new tableIdService();

  public async createDiscount(discountData: DiscountDto, currentUserId: string): Promise<IDiscount> {
    if (isEmpty(discountData)) throw new HttpException(400, 'Discount  must not be empty');

    try {
      const tableIdTableName = 'Discount';
      const tableId = await this.tableIdService.getTableIdByTableName(tableIdTableName);

      if (!tableId) {
        return;
      }

      const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdTableName);

      const createDiscount: IDiscount = await this.discount.create({
        discountId: responseTableIdData.tableIdFinalIssued,
        createdBy: currentUserId,
        ...discountData,
      });

      return createDiscount;
    } catch (error) {}
  }

  public async getAllDiscount(): Promise<IDiscount[]> {
    const allDiscount: IDiscount[] = await this.discount.findAll({
      where: { deletedAt: null },
      attributes: { exclude: ['discountKey', 'deletedAt'] },
    });

    return allDiscount;
  }

  public async getDiscountById(discountId: string): Promise<IDiscount> {
    const discount: IDiscount = await this.discount.findOne({
      where: { discountId, deletedAt: null },
      attributes: { exclude: ['discountKey', 'deletedAt'] },
    });

    return discount;
  }

  public async updateDiscountById(discountId: string, discountData: DiscountDto, currentUserId: string): Promise<IDiscount> {
    if (isEmpty(discountData)) throw new HttpException(400, 'Discount  must not be empty');

    const findDiscount: IDiscount = await this.discount.findOne({ where: { discountId: discountId } });

    if (!findDiscount) throw new HttpException(400, "Discount  doesn't exist");

    const updatedDiscount = {
      ...discountData,
      updatedBy: currentUserId,
    };

    await this.discount.update(updatedDiscount, { where: { discountId: discountId } });

    return this.getDiscountById(discountId);
  }

  public async deleteDiscount(discountId: string) {
    try {
      const deleteDiscountData = {
        deletedAt: new Date(),
      };

      const result = await this.discount.update(deleteDiscountData, {
        where: {
          discountId: discountId,
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

export default DiscountService;
