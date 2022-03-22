import DB from '@/database';
import _ from 'lodash';
import { ICommonCode } from '@/common/interfaces/commonCode.interface';
import { CommonCodeDto } from '../dtos/commonCode.dto';
import { HttpException } from '@/common/exceptions/HttpException';
import { isEmpty } from '@/common/utils/util';

class CommonCodeService {
  public commonCode = DB.CommonCode;

  public async createCommonCode(commonCodeData: CommonCodeDto): Promise<ICommonCode> {
    if (isEmpty(commonCodeData)) throw new HttpException(400, 'CommonCode must not be empty');

    const createCommonCodeData: ICommonCode = await this.commonCode.create({ ...commonCodeData });
    return createCommonCodeData;
  }

  public async getAllCommonCodel(): Promise<ICommonCode[]> {
    const allCommonCode: ICommonCode[] = await this.commonCode.findAll({
      where: { isDeleted: false },
      attributes: { exclude: ['pk', 'isDeleted', 'updatedBy', 'createdBy'] },
    });
    return allCommonCode;
  }

  public async getCommonCodeById(id: string): Promise<ICommonCode> {
    const commonCode: ICommonCode = await this.commonCode.findOne({
      where: { id },
      attributes: { exclude: ['pk'] },
    });
    return commonCode;
  }

  public async updateCommonCode(commonCodeId: string, commonCodeData: CommonCodeDto, currentPk: number): Promise<ICommonCode> {
    if (isEmpty(commonCodeData)) throw new HttpException(400, 'CommonCode Data cannot be blank');
    const findCommonCode: ICommonCode = await this.commonCode.findOne({ where: { id: commonCodeId } });
    if (!findCommonCode) throw new HttpException(409, "CommonCode doesn't exist");
    const updatedCommonCodeData = {
      ...commonCodeData,
      updatedBy: currentPk,
      updatedAt: new Date(),
    };
    await this.commonCode.update(updatedCommonCodeData, { where: { id: commonCodeId } });

    return this.getCommonCodeById(commonCodeId);
  }
}
