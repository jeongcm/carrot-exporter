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
      const tableIdTableName = 'CommonCode';
      
      const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdTableName);
      if (!responseTableIdData) {
        console.log("error on issuing TableId for commoncode");
        return;
      }

      const createCommonCode: ICommonCode = await this.commonCode.create({
        commonCodeId: responseTableIdData.tableIdFinalIssued,
        createdBy: currentUserId,
        createdAt: new Date(),
        ...commonCodeData,
      });

      return createCommonCode;
    } catch (error) {
      console.log(error.code);
      
    }
  }

  /**
   * @returns ICommonCode[]
   */
  public async getAllCommonCode(): Promise<ICommonCode[]> {
    const allCommonCode: ICommonCode[] = await this.commonCode.findAll({
      where: { deletedAt: null },
      attributes: { exclude: ['commonCodeKey', 'deletedAt'] },
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
      attributes: { exclude: ['commonCodeKey', 'deletedAt'] },
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
