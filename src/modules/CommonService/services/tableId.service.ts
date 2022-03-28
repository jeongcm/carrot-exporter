import DB from '@/database';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import { HttpException } from '@/common/exceptions/HttpException';
import { ITableId as tableId } from '@/common/interfaces/tableId.interface';
import { isEmpty } from '@/common/utils/util';


/**
 * @memberof tableId
 */
class tableIdService {
  public tableId = DB.tableId;

  /**
   * Issue a new tableId information and update tableId table's matched row to save the issued tableId
   *
   * @param  {UpdateTableIdDto} tableIdData
   * @returns IResponseIssueTableIdDto
   * @author Jerry Lee jerry.lee@nexclipper.io
   */
  public async issueTableId(tableIdTableName: string): Promise<IResponseIssueTableIdDto> {
    if (isEmpty(tableIdTableName)) throw new HttpException(400, 'TableName Data cannot be blank');

    const getTableId: tableId = await this.tableId.findOne({ where: { tableIdTableName: tableIdTableName } });

    if (!getTableId) throw new HttpException(409, "Can't find a matched tableId record");

    const currentDate = new Date();
    const currentDay = currentDate.getDate() + getTableId.tableDay;
    const currentMonth = currentDate.getMonth() + 1 + getTableId.tableMonth;
    const currentFullYear = currentDate.getFullYear() + getTableId.tableYear;
    const currentYearText = currentFullYear.toString();
    const currentYear = currentYearText.substring(2, 4);

    const currentSequence = getTableId.tableIdIssuedSequence;
    let currentSequenceText = currentSequence.toString();

    while (currentSequenceText.length < getTableId.tableIdSequenceDigit) {
      currentSequenceText = "0" + currentSequenceText; 
    }

    const idFinalIssued = getTableId.tableIdHeader + currentYear + currentMonth + currentDay + currentSequenceText;
    const idIssuedSequence = getTableId.tableIdIssuedSequence + 1;

    const updateDataSet = { tableIdFinalIssued: idFinalIssued, tableIdIssuedSequence: idIssuedSequence, updatedAt: new Date() };
    await this.tableId.update({ ...updateDataSet }, { where: { tableIdTableName: getTableId.tableIdTableName } });

    const updateResult: IResponseIssueTableIdDto = await this.tableId.findOne({ where: { tableIdTableName: tableIdTableName } });
    return updateResult;
  }

  /**
   * getTableId information using TableName
   *
   * @param  {IssueTableIdDto} tableIdData
   * @returns tableIdTableName
   * @author Jerry Lee jerry.lee@nexclipper.io
   */

  public async getTableIdByTableName(tableIdTableName: string): Promise<tableId> {
    if (isEmpty(tableIdTableName)) throw new HttpException(400, 'Missing tableIdTableName');
    const getTableId: tableId = await this.tableId.findOne({ where: { tableIdTableName: tableIdTableName } });
    if (!getTableId) throw new HttpException(409, "can't find the table information in the table");

    return getTableId;
  }
}

export default tableIdService;
