import DB from '@/database';

import tableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import { ITableId as tableId } from '@/common/interfaces/tableId.interface';
import config from 'config';

/**
 * @memberof InitialRecordService
 */
class InitialRecordService {
  public tableId = DB.tableId;
  public customerAccount = DB.CustomerAccount;
  public party = DB.Party;
  public partyUser = DB.PartyUser;

  public tableIdService = new tableIdService();

  public async insertInitialRecords(): Promise<void> {
    const { tableIds, customerAccount, party, partyUser } = config.initialRecord;
    const { customerAccountName, customerAccountDescription } = customerAccount;
    const { partyName, partyDescription } = party;
    const { firstName, lastName, userId, password, email } = partyUser;

    try {
      await DB.sequelize.transaction(async t => {
        const getTableId: tableId = await this.tableId.findOne({ where: { tableIdTableName: 'customerAccount' }, transaction: t });

        if (getTableId) {
          return;
        }

        if (!getTableId) {
          await this.tableId.bulkCreate(tableIds);
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
