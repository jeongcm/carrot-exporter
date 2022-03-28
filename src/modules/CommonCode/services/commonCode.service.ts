import DB from '@/database';
import _ from 'lodash';
import { ICommonCode } from '@/common/interfaces/commonCode.interface';
import { CommonCodeDto } from '../dtos/commonCode.dto';
import { IsEmptyError } from '@/common/exceptions/isEmpty';
import { isEmpty } from '@/common/utils/util';
import tableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';

class CommonCodeService {
  public commonCode = DB.CommonCode;
  public tableIdService = new tableIdService();

  /**
   * @param  {CommonCodeDto} commonCodeData
   * @param  {string} currentUserId
   * @returns ICommonCode[]
   */
  public async createCommonCode(commonCodeData: CommonCodeDto, currentUserId: string): Promise<ICommonCode> {
    if (isEmpty(commonCodeData)) throw new IsEmptyError('CommonCode must not be empty');

    try {
      const tableIdTableName = 'commonCode';
      const tableId = await this.tableIdService.getTableIdByTableName(tableIdTableName);

      if (!tableId) {
        return;
      }

      const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdTableName);

      const createCommonCode: ICommonCode = await this.commonCode.create({
        ...commonCodeData,
        commonCodeId: responseTableIdData.tableIdFinalIssued,
        createdBy: 'system',
      });

      return createCommonCode;
    } catch (error) {}

    // const createCommonCodeData: ICommonCode = await this.commonCode.create({
    //   createdBy: currentUserId,
    //   createdAt: new Date(),
    //   ...commonCodeData,
    // });

    // return createCommonCodeData;
  }

  /**
   * @returns ICommonCode[]
   */
  public async getAllCommonCode(): Promise<ICommonCode[]> {
    const allCommonCode: ICommonCode[] = await this.commonCode.findAll({
      where: { isDeleted: false },
      attributes: { exclude: ['commonCodeKey', 'isDeleted'] },
    });
    return allCommonCode;
  }

  /**
   * @param  {string} commonCodeId
   * @returns Promise
   */
  public async getCommonCodeById(commonCodeId: string): Promise<ICommonCode> {
    const commonCode: ICommonCode = await this.commonCode.findOne({
      where: { commonCodeId },
      attributes: { exclude: ['commonCodeKey', 'isDeleted'] },
    });
    return commonCode;
  }

  /**
   * @param  {string} commonCodeId
   * @param  {CommonCodeDto} commonCodeData
   * @param  {string} currentUserId
   * @returns Promise
   */
  public async updateCommonCodeById(commonCodeId: string, commonCodeData: CommonCodeDto, currentUserId: string): Promise<ICommonCode> {
    if (isEmpty(commonCodeData)) throw new IsEmptyError('CommonCode Data cannot be blank');
    const findCommonCode: ICommonCode = await this.commonCode.findOne({ where: { commonCodeId: commonCodeId } });
    if (!findCommonCode) throw new IsEmptyError("CommonCode doesn't exist");
    const updatedCommonCodeData = {
      ...commonCodeData,
      updatedBy: currentUserId,
      updatedAt: new Date(),
    };
    await this.commonCode.update(updatedCommonCodeData, { where: { commonCodeId: commonCodeId } });

    return this.getCommonCodeById(commonCodeId);
  }
}

export default CommonCodeService;
