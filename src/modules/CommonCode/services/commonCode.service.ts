import DB from '@/database';
import _ from 'lodash';
import { ICommonCode } from '@/common/interfaces/commonCode.interface';
import { CommonCodeDto } from '../dtos/commonCode.dto';
import { IsEmptyError } from '@/common/exceptions/isEmpty';
import { isEmpty } from '@/common/utils/util';

class CommonCodeService {
  public commonCode = DB.CommonCode;

  /**
   * @param  {CommonCodeDto} commonCodeData
   * @param  {string} currentUserId
   * @returns ICommonCode[]
   */
  public async createCommonCode(commonCodeData: CommonCodeDto, currentUserId: string): Promise<ICommonCode> {
    if (isEmpty(commonCodeData)) throw new IsEmptyError('CommonCode must not be empty');

    const createCommonCodeData: ICommonCode = await this.commonCode.create({
      createdBy: currentUserId,
      createdAt: new Date(),
      ...commonCodeData,
    });

    return createCommonCodeData;
  }

  /**
   * @returns ICommonCode[]
   */
  public async getAllCommonCode(): Promise<ICommonCode[]> {
    const allCommonCode: ICommonCode[] = await this.commonCode.findAll({
      // where: { isDeleted: false },
      attributes: { exclude: ['pk', 'isDeleted', 'updatedBy', 'createdBy'] },
    });
    return allCommonCode;
  }

  /**
   * @param  {string} id
   * @returns Promise
   */
  public async getCommonCodeById(id: string): Promise<ICommonCode> {
    const commonCode: ICommonCode = await this.commonCode.findOne({
      where: { id },
      attributes: { exclude: ['pk'] },
    });
    return commonCode;
  }

  /**
   * @param  {string} commonCodeId
   * @param  {CommonCodeDto} commonCodeData
   * @param  {string} currentUserId
   * @returns Promise
   */
  public async updateCommonCode(commonCodeId: string, commonCodeData: CommonCodeDto, currentUserId: string): Promise<ICommonCode> {
    if (isEmpty(commonCodeData)) throw new IsEmptyError('CommonCode Data cannot be blank');
    const findCommonCode: ICommonCode = await this.commonCode.findOne({ where: { id: commonCodeId } });
    if (!findCommonCode) throw new IsEmptyError("CommonCode doesn't exist");
    const updatedCommonCodeData = {
      ...commonCodeData,
      updatedBy: currentUserId,
      updatedAt: new Date(),
    };
    await this.commonCode.update(updatedCommonCodeData, { where: { id: commonCodeId } });

    return this.getCommonCodeById(commonCodeId);
  }
}

export default CommonCodeService;
