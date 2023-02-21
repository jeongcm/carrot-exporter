import DB from '@/database';

import tableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdBulkDto, IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
//import { ITableId } from '@/common/interfaces/tableId.interface';
import config from '@config/index';
//import { IApi } from '@/common/interfaces/api.interface';
import { ICustomerAccount } from '@/common/interfaces/customerAccount.interface';
import { IParty } from '@/common/interfaces/party.interface';
//import sequelize from 'sequelize';
import bcrypt from 'bcrypt';
import { IAlertTargetGroup } from '@/common/interfaces/alertTargetGroup.interface';
import { ICatalogPlan, ICatalogPlanProduct, ICatalogPlanProductPrice } from '@/common/interfaces/productCatalog.interface';
//import { IRole } from '@/common/interfaces/role.interface';

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
  public exporters = DB.Exporters;
  public alertTargetGroup = DB.AlertTargetGroup;
  public alertTargetSubGroup = DB.AlertTargetSubGroup;
  public catalogPlan = DB.CatalogPlan;
  public catalogPlanProduct = DB.CatalogPlanProduct;
  public catalogPlanProductPrice = DB.CatalogPlanProductPrice;

  public tableIdService = new tableIdService();

  public async insertInitialRecords(): Promise<void> {
    const {
      tableIds,
      customerAccount,
      party,
      partyUser,
      api: apiList,
      role: roleList,
      exporters: exportersList,
      alertTargetGroup: alertTargetGroupList,
      alertTargetSubGroup: alertTargetSubGroupList,
      catalogPlan: catalogPlanList,
      catalogPlanProduct: catalogPlanProductList,
    } = config.initialRecord;
    const uuid = require('uuid');
    const { customerAccountName, customerAccountDescription } = customerAccount;
    const { partyName, partyDescription } = party;
    const { firstName, lastName, userId, password, email } = partyUser;

    const hashedPassword = await bcrypt.hash(password, 10);

    //insert/update TableId
    try {
      await this.tableId.bulkCreate(tableIds, {
        fields: [
          'tableIdTableName',
          'tableIdHeader',
          'tableMonth',
          'tableYear',
          'tableDay',
          'tableIdSequenceDigit',
          'tableIdIssuedSequence',
          'createdBy',
        ],
        updateOnDuplicate: ['tableIdTableName'],
      });
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
    const apiDataList = [];
    // pre-step to be ready to use bulk table id
    const apiListLength = apiList.length;
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
      const api_id = api_id_prefix + api_id_postfix;

      apiDataList.push({
        ...apiObj,
        createdBy: 'SYSTEM',
        createdAt: new Date(),
        apiId: api_id,
      });
    }
    try {
      await this.api.bulkCreate(apiDataList, {
        fields: ['apiId', 'apiName', 'apiDescription', 'apiEndPoint1', 'apiEndPoint2', 'apiVisibleTF', 'createdBy', 'createdAt'],
        updateOnDuplicate: ['apiName'],
      });
    } catch (error) {
      console.log(error);
    }

    //insert/update Role
    const roleDataList = [];
    const roleListLength = roleList.length;
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
      const role_id = role_id_prefix + role_id_postfix;

      roleDataList.push({
        ...roleObj,
        createdBy: 'SYSTEM',
        createdAt: new Date(),
        roleId: role_id,
      });
    }

    try {
      await this.role.bulkCreate(roleDataList, {
        fields: ['roleId', 'roleName', 'roleCode', 'roleId', 'createdBy', 'createdAt'],
        updateOnDuplicate: ['roleName'],
      });
    } catch (error) {
      console.log(error);
    }
    //insert/update Exporters
    const exportersDataList = [];
    const exportersListLength = exportersList.length;
    const responseExportersTableIdData: IResponseIssueTableIdBulkDto = await this.tableIdService.issueTableIdBulk('Exporters', exportersListLength);
    const exporters_id_prefix = responseExportersTableIdData.tableIdFinalIssued.substring(0, 8);
    let exporters_id_postfix_number =
      Number(responseExportersTableIdData.tableIdFinalIssued.substring(8, 16)) - responseExportersTableIdData.tableIdRange;
    let exporters_id_postfix = '';
    const exportersTableIdSequenceDigit = responseExportersTableIdData.tableIdSequenceDigit;

    for (const exportersObj of exportersList) {
      // creating tableid from bulk
      exporters_id_postfix_number = exporters_id_postfix_number + 1;
      exporters_id_postfix = exporters_id_postfix_number.toString();
      while (exporters_id_postfix.length < exportersTableIdSequenceDigit) {
        exporters_id_postfix = '0' + exporters_id_postfix;
      }
      const exporters_id = exporters_id_prefix + exporters_id_postfix;

      exportersDataList.push({
        ...exportersObj,
        createdBy: 'SYSTEM',
        createdAt: new Date(),
        exporterId: exporters_id,
      });
    }

    try {
      await this.exporters.bulkCreate(exportersDataList, {
        fields: [
          'exporterId',
          'exporterName',
          'exporterDescription',
          'exporterHelmChartName',
          'exporterHelmChartRepoUrl',
          'exporterHelmChartVersion',
          'exporterHelmChartValues',
          'grafanaDashboard',
          'exporterType',
          'exporterExporterhubUrl',
          'createdBy',
          'createdAt',
          'defaultChartYn'
        ],
        updateOnDuplicate: ['exporterName'],
      });
    } catch (error) {
      console.log('bulk create error: ', error);
    }

    //load alert target group data
    const alertTargetGroupData = [];
    for (const alertTargetGroup of alertTargetGroupList) {
      alertTargetGroupData.push({
        createdBy: 'SYSTEM',
        createdAt: new Date(),
        alertTargetGroupId: uuid.v1(),
        alertTargetGroupName: alertTargetGroup.alertTargetGroupName,
        alertTargetGroupDescription: alertTargetGroup.alertTargetGroupDescription,
      });
    }

    try {
      await this.alertTargetGroup.bulkCreate(alertTargetGroupData, {
        updateOnDuplicate: ['alertTargetGroupName'],
      });
    } catch (error) {
      console.log(error);
    }

    //load alert target subgroup data
    const alertTargetSubGroupData = [];
    for (const alertTargetSubGroup of alertTargetSubGroupList) {
      const getAlertTargetGroup: IAlertTargetGroup = await this.alertTargetGroup.findOne({
        where: { deletedAt: null, alertTargetGroupName: alertTargetSubGroup.alertTargetGroupName },
      });
      alertTargetSubGroupData.push({
        createdBy: 'SYSTEM',
        createdAt: new Date(),
        alertTargetGroupKey: getAlertTargetGroup.alertTargetGroupKey,
        alertTargetSubGroupId: uuid.v1(),
        alertTargetSubGroupName: alertTargetSubGroup.alertTargetSubGroupName,
        alertTargetSubGroupDescription: alertTargetSubGroup.alertTargetSubGroupDescription,
      });
    }

    try {
      await this.alertTargetSubGroup.bulkCreate(alertTargetSubGroupData, {
        updateOnDuplicate: ['alertTargetGroupKey', 'alertTargetSubGroupName'],
      });
    } catch (error) {
      console.log(error);
    }

    //load catalog plan
    const catalogPlanData = [];
    for (const catalogPlan of catalogPlanList) {
      catalogPlanData.push({
        createdBy: 'SYSTEM',
        createdAt: new Date(),
        catalogPlanId: uuid.v1(),
        catalogPlanName: catalogPlan.catalogPlanName,
        catalogPlanDescription: catalogPlan.catalogPlanDescription,
        catalogPlanType: catalogPlan.catalogPlanType,
      });
    }
    try {
      await this.catalogPlan.bulkCreate(catalogPlanData, {
        updateOnDuplicate: ['catalogPlanName'],
      });
    } catch (error) {
      console.log(error);
    }

    //load catalog plan product
    const catalogPlanProductData = [];
    for (const catalogPlanProduct of catalogPlanProductList) {
      const getcatalogPlan: ICatalogPlan = await this.catalogPlan.findOne({
        where: { deletedAt: null, catalogPlanName: catalogPlanProduct.catalogPlanName },
      });
      catalogPlanProductData.push({
        createdBy: 'SYSTEM',
        createdAt: new Date(),
        catalogPlanKey: getcatalogPlan.catalogPlanKey,
        catalogPlanProductId: uuid.v1(),
        catalogPlanProductName: catalogPlanProduct.catalogPlanProductName,
        catalogPlanProductDescription: catalogPlanProduct.catalogPlanProductDescription,
        catalogPlanProductMonthlyPrice: catalogPlanProduct.catalogPlanProductMonthlyPrice,
        catalogPlanProductUOM: catalogPlanProduct.catalogPlanProductUOM,
        catalogPlanProductCurrency: catalogPlanProduct.catalogPlanProductCurrency,
        catalogPlanProductType: catalogPlanProduct.catalogPlanProductType,
      });
    }
    try {
      await this.catalogPlanProduct.bulkCreate(catalogPlanProductData, {
        updateOnDuplicate: ['catalogPlanProductName'],
      });
    } catch (error) {
      console.log(error);
    }
    //load catalog plan price
    const findCatalogPlanProduct: ICatalogPlanProduct[] = await this.catalogPlanProduct.findAll({ where: { deletedAt: null } });
    if (findCatalogPlanProduct.length > 0) {
      for (let i = 0; i < findCatalogPlanProduct.length; i++) {
        const catalogPlanProductKey = findCatalogPlanProduct[i].catalogPlanProductKey;
        const catalogPlanProductMonthlyPrice = findCatalogPlanProduct[i].catalogPlanProductMonthlyPrice;
        const findCatalogPlanProductPrice: ICatalogPlanProductPrice = await this.catalogPlanProductPrice.findOne({
          where: { deletedAt: null, catalogPlanProductKey },
        });
        if (!findCatalogPlanProductPrice) {
          const insertData = {
            createdBy: 'SYSTEM',
            createdAt: new Date(),
            catalogPlanProductKey: catalogPlanProductKey,
            catalogPlanProductPriceId: uuid.v1(),
            catalogPlanProductMonthlyPrice,
            catalogPlanProductMonthlyPriceFrom: new Date(),
            catalogPlanProductMonthlyPriceTo: new Date('9999-12-31T23:59:59Z'),
          };
          await this.catalogPlanProductPrice.create(insertData);
        }
      }
    }
    //
  } // end of method
} // end of class

export default InitialRecordService;
