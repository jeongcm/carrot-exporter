import DB from '@/database';

import tableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdBulkDto, IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import { ITableId } from '@/common/interfaces/tableId.interface';
import config from '@config/index';
import { IApi } from '@/common/interfaces/api.interface';
import { ICustomerAccount } from '@/common/interfaces/customerAccount.interface';
import { IParty } from '@/common/interfaces/party.interface';
import sequelize from 'sequelize';
import bcrypt from 'bcrypt';
import { IRole } from '@/common/interfaces/role.interface';

/**
 * @memberof InitialRecordService
 */
class InitialRecordService {
  public tableId = DB.TableId;
  public api = DB.Api;
  public customerAccount = DB.CustomerAccount;
  public party = DB.Party;
  public partyUser = DB.PartyUser;
  public role = DB.Role;

  public tableIdService = new tableIdService();

  public async insertInitialRecords(): Promise<void> {
    const { tableIds, customerAccount, party, partyUser, api: apiList, role: roleList } = config.initialRecord;
    const { customerAccountName, customerAccountDescription } = customerAccount;
    const { partyName, partyDescription } = party;
    const { firstName, lastName, userId, password, email } = partyUser;

    const hashedPassword = await bcrypt.hash(password, 10);

    //insert/update TableId
    try {
      await this.tableId.bulkCreate(tableIds, 
        {
          fields: ["tableIdTableName", "tableIdHeader", "tableMonth", "tableYear", "tableDay","tableIdSequenceDigit","tableIdIssuedSequence","createdBy"],
          updateOnDuplicate: ["tableIdTableName"]
        }
      );
      } catch (error) {
        console.log(error);
      } 

    //create a system user
    const customerAccountData: ICustomerAccount = await this.customerAccount.findOne({ where: { customerAccountType: 'IA' } });

    if (!customerAccountData) {
      const responseCustomerccountIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId('CustomerAccount');
      const responsePartyUserIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId('PartyUser');
      try {
        await DB.sequelize.transaction(async t => {
          const internalCustomer: ICustomerAccount = await this.customerAccount.create(
            {
              customerAccountId: responseCustomerccountIdData.tableIdFinalIssued,
              createdBy: responsePartyUserIdData.tableIdFinalIssued,
              customerAccountName,
              customerAccountDescription,
              customerAccountType: 'IA',
            },
            { transaction: t },
          );

          const systemParty: IParty = await this.party.create(
            {
              partyId: responsePartyUserIdData.tableIdFinalIssued,
              createdBy: responsePartyUserIdData.tableIdFinalIssued,
              partyName,
              partyDescription,
              partyType: 'US',
              customerAccountKey: internalCustomer.customerAccountKey,
            },
            { transaction: t },
          );

          await this.partyUser.create(
            {
              partyUserId: responsePartyUserIdData.tableIdFinalIssued,
              partyKey: systemParty.partyKey,
              createdBy: responsePartyUserIdData.tableIdFinalIssued,
              firstName,
              lastName,
              userId,
              password: hashedPassword,
              email,
            },
            { transaction: t },
          );
        }); // end of transaction
      } catch (error) {
        console.log(error);
      }
    } // end of !findIaCustomer


    //insert/update API


    let apiDataList = [];
      // pre-step to be ready to use bulk table id
    let apiListLength = apiList.length;
    const responseApiTableIdData: IResponseIssueTableIdBulkDto = await this.tableIdService.issueTableIdBulk('Api', apiListLength);
    const api_id_prefix = responseApiTableIdData.tableIdFinalIssued.substring(0, 8);
    let api_id_postfix_number = Number(responseApiTableIdData.tableIdFinalIssued.substring(8, 16)) - responseApiTableIdData.tableIdRange;
    let api_id_postfix = '';
    const tableIdApiSequenceDigit = responseApiTableIdData.tableIdSequenceDigit;
      //
    for (const apiObj of apiList) {
      // creating tableid from bulk
      api_id_postfix_number = api_id_postfix_number + 1;
      api_id_postfix = api_id_postfix_number.toString();
      while (api_id_postfix.length < tableIdApiSequenceDigit) {
        api_id_postfix = '0' + api_id_postfix;
      }
      let api_id = api_id_prefix + api_id_postfix;

      apiDataList.push({
        ...apiObj,
        createdBy: 'SYSTEM',
        createdAt: new Date(),
        apiId: api_id,
      });
    }
    try {
      await this.api.bulkCreate(apiDataList, 
        {
          fields: ["apiId","apiName", "apiDescription", "apiEndPoint1", "apiEndPoint2", "apiVisibleTF", "createdBy", "createdAt"],
          updateOnDuplicate: ["apiName"]
        }
      );
      } catch (error) {
        console.log(error);
      } 



  //insert/update Role   
  let roleDataList = [];
  let roleListLength = roleList.length;
  const responseTableIdData: IResponseIssueTableIdBulkDto = await this.tableIdService.issueTableIdBulk('Role', roleListLength);
  const role_id_prefix = responseTableIdData.tableIdFinalIssued.substring(0, 8);
  let role_id_postfix_number = Number(responseTableIdData.tableIdFinalIssued.substring(8, 16)) - responseTableIdData.tableIdRange;
  let role_id_postfix = '';
  const tableIdSequenceDigit = responseTableIdData.tableIdSequenceDigit;

  for (const roleObj of roleList) {
    // creating tableid from bulk
    role_id_postfix_number = role_id_postfix_number + 1;
    role_id_postfix = role_id_postfix_number.toString();
    while (role_id_postfix.length < tableIdSequenceDigit) {
      role_id_postfix = '0' + role_id_postfix;
    }
    let role_id = role_id_prefix + role_id_postfix;

    roleDataList.push({
      ...roleObj,
      createdBy: 'SYSTEM',
      createdAt: new Date(),
      roleId: role_id,
    });
  }

  try {
    await this.role.bulkCreate(roleDataList, 
      {
        fields: ["roleName", "roleCode", "roleId", "createdBy", "createdAt"],
        updateOnDuplicate: ["roleName"]
      }
    );
    } catch (error) {
      console.log(error);
    } 

  } // end of method
} // end of class

export default InitialRecordService;
