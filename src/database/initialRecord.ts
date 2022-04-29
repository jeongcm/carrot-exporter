import DB from '@/database';

import tableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import { ITableId } from '@/common/interfaces/tableId.interface';
import config from '@config/index';
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

        if (getTableId) {
          return;
        }

        if (!getTableId) {
          await this.tableId.bulkCreate(tableIds);
        }

        if (!getApi) {
          let insertDataList = [];

          for (const apiObj of apiList) {
            const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId('Api');

            insertDataList.push({
              ...apiObj,
              createdBy: 'SYSTEM',
              apiId: responseTableIdData.tableIdFinalIssued,
            });
          }

          await this.api.bulkCreate(insertDataList, { transaction: t });
        }

        const customerAccountTableId = await this.tableIdService.getTableIdByTableName('CustomerAccount');
        const partyUserTableId = await this.tableIdService.getTableIdByTableName('PartyUser');

        if (!customerAccountTableId || !partyUserTableId) {
          return;
        }

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
      });
    } catch (error) {
      console.log(error);
    }
  }
}

export default InitialRecordService;
