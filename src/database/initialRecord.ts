import DB from '@/database';

import tableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdBulkDto, IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import { ITableId } from '@/common/interfaces/tableId.interface';
import config from 'config';
import { IApi } from '@/common/interfaces/api.interface';

/**
 * @memberof InitialRecordService
 */
class InitialRecordService {
  public tableId = DB.TableId;
  public api = DB.Api;
  public customerAccount = DB.CustomerAccount;
  public party = DB.Party;
  public partyUser = DB.PartyUser;

  public tableIdService = new tableIdService();

  public async insertInitialRecords(): Promise<void> {
    const { tableIds, customerAccount, party, partyUser, api: apiList } = config.initialRecord;
    const { customerAccountName, customerAccountDescription } = customerAccount;
    const { partyName, partyDescription } = party;
    const { firstName, lastName, userId, password, email } = partyUser;

    try {
      await DB.sequelize.transaction(async t => {
        const getTableId: ITableId = await this.tableId.findOne({ where: { tableIdTableName: 'customerAccount' }, transaction: t });
        const getApi: IApi = await this.api.findOne({ where: { apiEndPoint2: '/customerAccount' }, transaction: t });

// error fixed.. 04/29/22 @JerryL         
//        if (getTableId) {
//          return;
//        }

        if (!getTableId) {
          await this.tableId.bulkCreate(tableIds);
        } 

        const customerAccountTableId = await this.tableIdService.getTableIdByTableName('CustomerAccount');
        const partyUserTableId = await this.tableIdService.getTableIdByTableName('PartyUser');

        if (!customerAccountTableId || !partyUserTableId) {
          return;
        }
        else {
          const responseCustomerccountIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId('CustomerAccount');
          const responsePartyUserIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId('PartyUser');

          await this.customerAccount.findOrCreate({
            where: {
              customerAccountType: 'IA',
            },
            defaults: {
              customerAccountId: responseCustomerccountIdData.tableIdFinalIssued,
              createdBy: responsePartyUserIdData.tableIdFinalIssued,
              customerAccountName,
              customerAccountDescription,
              customerAccountType: 'IA',
            },
            transaction: t,
          });

          await this.party.findOrCreate({
            where: {
              partyName: 'SYSTEM',
            },
            defaults: {
              partyId: responsePartyUserIdData.tableIdFinalIssued,
              createdBy: responsePartyUserIdData.tableIdFinalIssued,
              partyName,
              partyDescription,
              partyType: 'US',
              customerAccountKey: 1,
            },
            transaction: t,
          });

          await this.partyUser.findOrCreate({
            where: {
              firstName: 'SYSTEM',
            },
            defaults: {
              partyUserId: responsePartyUserIdData.tableIdFinalIssued,
              partyKey: 1,
              createdBy: responsePartyUserIdData.tableIdFinalIssued,
              firstName,
              lastName,
              userId,
              password,
              email,
            },
            transaction: t,
          });
      
        } // end of elase

        if (!getApi) {
          let insertDataList = [];

          console.log ("start.....")
          
          // pre-step to be ready to use bulk table id
          let apiListLength = apiList.length;
          const responseTableIdData: IResponseIssueTableIdBulkDto = await this.tableIdService.issueTableIdBulk('Api',apiListLength);
          const api_id_prefix = responseTableIdData.tableIdFinalIssued.substring(0, 8);
          let api_id_postfix_number = Number(responseTableIdData.tableIdFinalIssued.substring(8, 16)) - responseTableIdData.tableIdRange;
          let api_id_postfix = '';
          const tableIdSequenceDigit = responseTableIdData.tableIdSequenceDigit;
          //
          for (const apiObj of apiList) {
            // creating tableid from bulk
            api_id_postfix_number = api_id_postfix_number + 1;
            api_id_postfix = api_id_postfix_number.toString();
            while (api_id_postfix.length < tableIdSequenceDigit) {
                api_id_postfix = '0' + api_id_postfix;
            }
            let api_id = api_id_prefix + api_id_postfix;
            
            insertDataList.push({
              ...apiObj,
              createdBy: 'SYSTEM',
              apiId: api_id,
            });
            //console.log(insertDataList);
          }
          console.log (insertDataList);
          await this.api.bulkCreate(insertDataList, { transaction: t });
        } // end of !getApi

      }); // end of DB.sequelize
    } catch (error) {
      console.log(error);
    }
  }
}

export default InitialRecordService;
