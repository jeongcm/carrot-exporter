import DB from '@/database';

import tableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdBulkDto, IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import { ITableId } from '@/common/interfaces/tableId.interface';
import config from 'config';
import { IApi } from '@/common/interfaces/api.interface';
import { ICustomerAccount } from '@/common/interfaces/customerAccount.interface';
import { IParty } from '@/common/interfaces/party.interface';

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

   //create TableId

   const getTableId: ITableId = await this.tableId.findOne({ where: { tableIdTableName: 'customerAccount' }}); 
   if (!getTableId) {
      try {
        await DB.sequelize.transaction(async t => {
          await this.tableId.bulkCreate(tableIds, {transaction: t}); 
        }); // end of transaction  
      } catch (error) {
        console.log(error);
      }
  } // end of !getTableId  

    //create a system user 
    
    const customerAccountData: ICustomerAccount = await this.customerAccount.findOne({where: {customerAccountType: 'IA'}});
   // console.log("############", customerAccountData);
    if (!customerAccountData) {
        const responseCustomerccountIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId('CustomerAccount');
        const responsePartyUserIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId('PartyUser');
        try {
          await DB.sequelize.transaction(async t => {
            const internalCustomer: ICustomerAccount = await this.customerAccount.create({
                customerAccountId: responseCustomerccountIdData.tableIdFinalIssued,
                createdBy: responsePartyUserIdData.tableIdFinalIssued,
                customerAccountName,
                customerAccountDescription,
                customerAccountType: 'IA',
              },
              {transaction: t},
            );

            const systemParty: IParty = await this.party.create({
                partyId: responsePartyUserIdData.tableIdFinalIssued,
                createdBy: responsePartyUserIdData.tableIdFinalIssued,
                partyName,
                partyDescription,
                partyType: 'US',
                customerAccountKey: internalCustomer.customerAccountKey,
              },
              {transaction: t},
            );

            await this.partyUser.create({
                partyUserId: responsePartyUserIdData.tableIdFinalIssued,
                partyKey: systemParty.partyKey,
                createdBy: responsePartyUserIdData.tableIdFinalIssued,
                firstName,
                lastName,
                userId,
                password,
                email,
              },
              {transaction: t},
            );
          }); // end of transaction  
        } catch (error) {
          console.log(error);
        }
    } // end of !findIaCustomer    

    const getApi: IApi = await this.api.findOne({ where: { apiEndPoint2: '/customerAccount' }});

    if (!getApi) {
      let insertDataList = [];

      console.log ("###########################start.....")
      
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
      }
      console.log ("###########################SQL API.....")
      console.log(insertDataList);
      console.log ("###########################SQL API.....")
      try {
        await DB.sequelize.transaction(async t => {
          await this.api.bulkCreate(insertDataList, { transaction: t });
        }); // end of transaction  

      } catch (error) {
        console.log(error);
      }// end of try

    } // end of !getApi
  } // end of method
} // end of class

export default InitialRecordService;
