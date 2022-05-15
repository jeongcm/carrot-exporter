import config from '@/config/index';
import DB from '@/database';
import { IResponseIssueTableIdDto, IResponseIssueTableIdBulkDto } from '@/modules/CommonService/dtos/tableId.dto';
import { HttpException } from '@/common/exceptions/HttpException';
import { ITableId as tableId } from '@/common/interfaces/tableId.interface';
import { isEmpty } from '@/common/utils/util';
import { IParty } from '@/common/interfaces/party.interface';

/**
 * @memberof tableId
 */
class TableIdService {
  public tableId = DB.TableId;

  /**
   * Issue a new tableId information and update tableId table's matched row to save the issued tableId
   *
   * @param  tableIdData
   * @returns IResponseIssueTableIdDto
   * @author Jerry Lee jerry.lee@nexclipper.io
   */
  public async issueTableId(tableIdTableName: string ): Promise<IResponseIssueTableIdDto> {

    if (isEmpty(tableIdTableName)) throw new HttpException(400, 'TableName Data cannot be blank');

    const getTableId: tableId = await this.tableId.findOne({ where: { tableIdTableName: tableIdTableName } });
    if (!getTableId) throw new HttpException(409, "Can't find a matched tableId record");

    const currentDate = new Date();
    const currentDay = currentDate.getDate() + getTableId.tableDay;

    let currentDayText = currentDay.toString();
    if (currentDayText.length == 1) {
      currentDayText = "0"+ currentDayText;
    }

    const currentMonth = currentDate.getMonth() + 1 + getTableId.tableMonth;

    let currentMonthText = currentMonth.toString();
    if (currentMonthText.length == 1) {
      currentMonthText = "0"+ currentMonthText;
    }

    const currentFullYear = currentDate.getFullYear() + getTableId.tableYear;
    const currentYearText = currentFullYear.toString();
    const currentYear = currentYearText.substring(2, 4);

    const currentSequence = getTableId.tableIdIssuedSequence;
    let currentSequenceText = currentSequence.toString();

    while (currentSequenceText.length < getTableId.tableIdSequenceDigit) {
      currentSequenceText = '0' + currentSequenceText;
    }

    const idFinalIssued = getTableId.tableIdHeader + currentYear + currentMonthText + currentDayText + currentSequenceText;
    const idIssuedSequence = getTableId.tableIdIssuedSequence + 1;

    const internalAccountParty: IParty = await DB.Party.findOne({ where: { partyName: process.env.NC_LARI_SYSTEM_PARTY_NAME } });

    let systemPartyId = "SYSTEM";
    if (internalAccountParty) systemPartyId = internalAccountParty.partyId;

    const updateDataSet = { tableIdFinalIssued: idFinalIssued, tableIdIssuedSequence: idIssuedSequence, updatedAt: new Date(), updatedBy: systemPartyId };

    console.log('---------');
    console.log(tableIdTableName);
    console.log('---------');

    /* TODO: NOT WORKING FROM THIS POINT ON
       2022-05-15 09:31:49 info: Response Body is {"message":"(conn=396508, no: 1205, SQLState: HY000) Lock wait timeout exceeded; try restarting transaction\nsql: UPDATE `TableId` SET `table_id_final_issued`=?,`table_id_issued_sequence`=?,`updated_at`=?,`updated_by`=? WHERE `table_id_table_name` = ? - parameters:['PL24061600000812',813,'2022-05-15 16:30:58.606','PU24052300000001','PartyUserLogs']"}
       2022-05-15 09:31:49 info: ::1 - - [15/May/2022:16:31:49 +0000] "POST /login HTTP/1.1" 500 352 "http://localhost:3000/" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36"
    */
    await this.tableId.update({ ...updateDataSet }, { where: { tableIdTableName: getTableId.tableIdTableName } });

    const updateResult: IResponseIssueTableIdDto = await this.tableId.findOne({ where: { tableIdTableName: tableIdTableName } });
    return updateResult;
  }

  /**
   * Issue a new table id after the range provided. it's for issuing bulk table id range for alerts or metrics where it requires massive amount of id issurance.
   *
   * @param  tableIdData, tableIdRange
   * @returns IResponseIssueTableIdDtoBulk
   * @author Jerry Lee jerry.lee@nexclipper.io
   */
   public async issueTableIdBulk(tableIdTableName: string, tableIdRange: number): Promise<IResponseIssueTableIdBulkDto> {

    //console.log(`tableIdRange:::${tableIdRange}`);
    const maxMillis = config.deadLock.maxMillis || 100;
    const minMillis = config.deadLock.minMillis || 1;

    if (isEmpty(tableIdTableName)) throw new HttpException(400, 'TableName Data cannot be blank');

    const getTableId: tableId = await this.tableId.findOne({ where: { tableIdTableName: tableIdTableName } });
    if (!getTableId) throw new HttpException(409, "Can't find a matched tableId record");

    const internalAccountParty: IParty = await DB.Party.findOne({ where: { partyName: process.env.NC_LARI_SYSTEM_PARTY_NAME } });
    if (!internalAccountParty) throw new HttpException(409, "Can't find a matched SYSTEM user");

    const currentDate = new Date();
    const currentDay = currentDate.getDate() + getTableId.tableDay;

    let currentDayText = currentDay.toString();
    if (currentDayText.length == 1) {
      currentDayText = "0"+ currentDayText;
    }

    const currentMonth = currentDate.getMonth() + 1 + getTableId.tableMonth;

    let currentMonthText = currentMonth.toString();
    if (currentMonthText.length == 1) {
      currentMonthText = "0"+ currentMonthText;
    }

    const currentFullYear = currentDate.getFullYear() + getTableId.tableYear;
    const currentYearText = currentFullYear.toString();
    const currentYear = currentYearText.substring(2, 4);

    const currentSequence = getTableId.tableIdIssuedSequence + tableIdRange;
    let currentSequenceText = currentSequence.toString();

    while (currentSequenceText.length < getTableId.tableIdSequenceDigit) {
      currentSequenceText = '0' + currentSequenceText;
    }

    const idFinalIssued = getTableId.tableIdHeader + currentYear + currentMonthText + currentDayText + currentSequenceText;
    const idIssuedSequence = currentSequence;

    const updateDataSet = { tableIdFinalIssued: idFinalIssued, tableIdIssuedSequence: idIssuedSequence, updatedAt: new Date(), updatedBy: internalAccountParty.partyId};

    try {
      await this.tableId.update({ ...updateDataSet }, { where: { tableIdTableName: getTableId.tableIdTableName } });
    } catch (err) {
      if (err && (err.code == "ER_LOCK_WAIT_TIMEOUT" || err.code == "ER_LOCK_TIMEOUT" || err.code == "ER_LOCK_DEADLOCK")) {
        var sleepMillis = Math.floor((Math.random()*maxMillis)+minMillis);
        setTimeout(function() {
          this.tableId.update({ ...updateDataSet }, { where: { tableIdTableName: getTableId.tableIdTableName } });
        },sleepMillis);
      } // end of second if
    } // end of catch

    const updateDBResult: IResponseIssueTableIdDto = await this.tableId.findOne({ where: { tableIdTableName: tableIdTableName } });
    const updateResult: IResponseIssueTableIdBulkDto = {tableIdTableName:updateDBResult.tableIdTableName, tableIdFinalIssued:updateDBResult.tableIdFinalIssued, tableIdRange, tableIdSequenceDigit:updateDBResult.tableIdSequenceDigit};
    return updateResult;
  }



  /**
   * getTableId information using TableName
   *
   * @param  {IssueTableIdDto} tableIdData
   * @returns tableIdTableName
   * @author Jerry Lee, jerry.lee@nexclipper.io
   */

  public async getTableIdByTableName(tableIdTableName: string): Promise<tableId> {
    if (isEmpty(tableIdTableName)) throw new HttpException(400, 'Missing tableIdTableName');
    const getTableId: tableId = await this.tableId.findOne({ where: { tableIdTableName: tableIdTableName } });
    if (!getTableId) throw new HttpException(409, "can't find the table information in the table");

    return getTableId;
  }
}

export default TableIdService;
