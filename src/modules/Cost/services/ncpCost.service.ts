import {
  IContract,
  IContractDemandCost,
  IContractDemandProduct,
  IContractProduct,
  ICostRelationCode,
  IDemandCost,
  IPrice,
  IProduct,
  IUsage,
} from '@/common/interfaces/ncpCost.interface';
import { DB, OpsApiDB, OpsCommDB } from '@/database';
import config from '@config/index';
import mysql from 'mysql2/promise';
import QueryService from '@modules/Resources/query/query';
import { IPartyUser } from '@/common/interfaces/party.interface';
import { IResourceGroup } from '@/common/interfaces/resourceGroup.interface';
import { ITbCustomer } from '@/common/interfaces/tbCustomer.interface';
import { ITbCustomerAccountCloudPlatform } from '@/common/interfaces/tbCustomerAccountCloudPlatform.interface';

class NcpCostService {
  public queryService = new QueryService();
  public partyUser = DB.PartyUser;
  public resourceGroup = DB.ResourceGroup;
  public customerAccounnt = DB.CustomerAccount;
  public tbCustomer = OpsCommDB.TbCustomer;
  public tbCustomerAccountCloudPlatform = OpsApiDB.TbCustomerAccountCloudPlatform;

  currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

  public async findUser() {
    const findSystemUser: IPartyUser = await this.partyUser.findOne({ where: { userId: config.partyUser.userId } });
    return findSystemUser;
  }

  //UUID 발급
  public async getUuid(resourceGroupUuid: string) {
    const responseResourceGroup: IResourceGroup = await this.resourceGroup.findOne({ where: { resourceGroupUuid } });
    const customerAccountKey = responseResourceGroup.customerAccountKey;

    const ncCustomerAccountKey = customerAccountKey;
    // const ncCustomerAccountKey = 48;
    const customerUuidResult: ITbCustomer = await this.tbCustomer.findOne({ where: { ncCustomerAccountKey } });
    const customerUuid = customerUuidResult.customerUuid;
    
    const accountUuidResult: ITbCustomerAccountCloudPlatform = await this.tbCustomerAccountCloudPlatform.findOne({ where: { customerUuid } });
    const accountUuid = accountUuidResult.accountUuid;

    return { customerUuid: customerUuid, accountUuid: accountUuid };
  }

  public async uploadNcpContractDemandCost(totalMsg) {
    let queryResult: any;
    let resultMsg: any;

    queryResult = await this.queryService.getResourceQuery(totalMsg, totalMsg.cluster_uuid);
    const uuidResult = await this.getUuid(totalMsg.cluster_uuid);
    const result = JSON.parse(queryResult.message);

    if (Object.keys(queryResult.message).length === 0) {
      console.log(`skip to upload ncpResourceGroup(${queryResult.resourceType}). cause: empty list`);
      return 'empty list';
    }

    try {
      //Insert TB_CONTRACT_DEMAND_COST
      resultMsg = await this.uploadContractDemandCost(result.contractDemandCostList, uuidResult);
      console.log(`success to upload contractDemandCost(${queryResult.resourceType}).`);

      //※ 2023.05.15 Contract 정보는 Usage API 에서 쌓도록 변경.
      // resultMsg = await this.uploadContract(result.contractList);

      //Insert TB_CONTRACT_DEMAND_PRODUCT
      resultMsg = await this.uploadContractDemandProduct(result.contractProductList, uuidResult);
      console.log(`success to upload contractProduct(${queryResult.resourceType}).`);

      return resultMsg;
    } catch (err) {
      console.log(`failed to upload contractDemandCost(${queryResult.resourceType}. cause: ${err})`);
      return err;
    }
  }

  public async uploadNcpContractUsage(totalMsg) {
    let queryResult: any;
    let resultMsg: any;
    queryResult = await this.queryService.getResourceQuery(totalMsg, totalMsg.cluster_uuid);
    const uuidResult = await this.getUuid(queryResult.clusterUuid);

    const result = JSON.parse(queryResult.message);
    if (Object.keys(queryResult.message).length === 0) {
      console.log(`skip to upload contractDemandCost(${queryResult.resourceType}). cause: empty list`);
      return 'empty list';
    }

    try {
      //Insert TB_CONTRACT
      resultMsg = await this.uploadContract(result.contractList, uuidResult);
      console.log(`success to upload contract(${queryResult.resourceType}).`);
      //Insert TB_CONTRACT_PRODUCT
      resultMsg = await this.uploadContractProduct(result.contractProductList, uuidResult);
      console.log(`success to upload contractProduct(${queryResult.resourceType}).`);
      //Insert TB_USAGE
      resultMsg = await this.uploadUsage(result.usageList, uuidResult);
      console.log(`success to upload usage(${queryResult.resourceType}).`);
      return resultMsg;
    } catch (err) {
      console.log(`failed to upload contractDemandCost(${queryResult.resourceType}. cause: ${err})`);
      return err;
    }
  }

  public async uploadNcpProductPrice(totalMsg) {
    let queryResult: any;
    let resultMsg: any;
    queryResult = await this.queryService.getResourceQuery(totalMsg, totalMsg.cluster_uuid);
    const uuidResult = await this.getUuid(queryResult.clusterUuid);

    const result = JSON.parse(queryResult.message);
    if (Object.keys(queryResult.message).length === 0) {
      console.log(`skip to upload productPrice(${queryResult.resourceType}). cause: empty list`);
      return 'empty list';
    }

    try {
      //Insert TB_CONTRACT
      resultMsg = await this.uploadProductPrice(result.productPriceList, uuidResult);
      console.log(`success to upload productPrice(${queryResult.resourceType}).`);
      //Insert TB_USAGE
      resultMsg = await this.uploadPrice(result.priceList, uuidResult);
      console.log(`success to upload price(${queryResult.resourceType}).`);
      return resultMsg;
    } catch (err) {
      console.log(`failed to upload productPrice(${queryResult.resourceType}. cause: ${err})`);
      return err;
    }
  }

  public async uploadNcpDemandCost(totalMsg) {
    let queryResult: any;
    let resultMsg: any;
    queryResult = await this.queryService.getResourceQuery(totalMsg, totalMsg.cluster_uuid);
    const uuidResult = await this.getUuid(queryResult.clusterUuid);

    const result = JSON.parse(queryResult.message);
    if (Object.keys(queryResult.message).length === 0) {
      console.log(`skip to upload demandCost(${queryResult.resourceType}). cause: empty list`);
      return 'empty list';
    }

    try {
      resultMsg = await this.uploadDemandCost(result.demandCostList, uuidResult);
      console.log(`success to upload Demandcost(${queryResult.resourceType}).`);
    } catch (err) {
      console.log(`failed to upload Demandcost(${queryResult.resourceType}. cause: ${err})`);
      return err;
    }
  }

  public async uploadNcpCostRelationCode(totalMsg) {
    let queryResult: any;
    let resultMsg: any;
    queryResult = await this.queryService.getResourceQuery(totalMsg, totalMsg.cluster_uuid);
    const uuidResult = await this.getUuid(queryResult.clusterUuid);

    const result = JSON.parse(queryResult.message);
    if (Object.keys(queryResult.message).length === 0) {
      console.log(`skip to upload costRelationCode(${queryResult.resourceType}). cause: empty list`);
      return 'empty list';
    }

    try {
      resultMsg = await this.uploadCostRelationCode(result.costRelationCodeList, uuidResult);
      console.log(`success to upload costRelationCode(${queryResult.resourceType}).`);
    } catch (err) {
      console.log(`failed to upload costRelationCode(${queryResult.resourceType}. cause: ${err})`);
      return err;
    }
  }

  public async uploadContractDemandCost(contractDemandCostData: IContractDemandCost[], uuidResult: any): Promise<string> {
    const contractDemandCostDelQuery = `DELETE FROM ncp_api.TB_CONTRACT_DEMAND_COST WHERE 1=1`;
    const contractDemandCostQuery = `INSERT INTO ncp_api.TB_CONTRACT_DEMAND_COST (
                    customer_uuid,
                    account_uuid,
                    contract_demand_cost_sequence,
                    demand_month,
                    member_no,
                    region_code,
                    demand_type_code,
                    demand_type_code_name,
                    demand_type_detail_code,
                    demand_type_detail_code_name,
                    contract_no,
                    unit_usage_quantity,
                    package_unit_usage_quantity,
                    total_unit_usage_quantity,
                    usage_unit_code,
                    usage_unit_code_name,
                    product_price,
                    use_amount,
                    promotion_discount_amount,
                    etc_discount_amount,
                    promise_discount_amount,
                    demand_amount,
                    write_date,
                    member_price_discount_amount,
                    member_promise_discount_amount,
                    contract_info,
                    pay_currency_code,
                    pay_currency_code_name,
                    this_month_applied_exchange_rate,
                    created_by,
                    created_at
                  ) VALUES ?
                  ON DUPLICATE KEY UPDATE
                  member_no=VALUES(member_no),
                  region_code=VALUES(region_code),
                  demand_type_code=VALUES(demand_type_code),
                  demand_type_code_name=VALUES(demand_type_code_name),
                  demand_type_detail_code=VALUES(demand_type_detail_code),
                  demand_type_detail_code_name=VALUES(demand_type_detail_code_name),
                  contract_no=VALUES(contract_no),
                  unit_usage_quantity=VALUES(unit_usage_quantity),
                  package_unit_usage_quantity=VALUES(package_unit_usage_quantity),
                  total_unit_usage_quantity=VALUES(total_unit_usage_quantity),
                  usage_unit_code=VALUES(usage_unit_code),
                  usage_unit_code_name=VALUES(usage_unit_code_name),
                  product_price=VALUES(product_price),
                  use_amount=VALUES(use_amount),
                  promotion_discount_amount=VALUES(promotion_discount_amount),
                  etc_discount_amount=VALUES(etc_discount_amount),
                  promise_discount_amount=VALUES(promise_discount_amount),
                  demand_amount=VALUES(demand_amount),
                  write_date=VALUES(write_date),
                  member_price_discount_amount=VALUES(member_price_discount_amount),
                  member_promise_discount_amount=VALUES(member_promise_discount_amount),
                  contract_info=VALUES(contract_info),
                  pay_currency_code=VALUES(pay_currency_code),
                  pay_currency_code_name=VALUES(pay_currency_code_name),
                  this_month_applied_exchange_rate=VALUES(this_month_applied_exchange_rate),
                  updated_by=VALUES(created_by),
                  updated_at=VALUES(created_at)
                  `;

    const contractDemandCostHistQuery =
      `INSERT INTO ncp_api.TB_CONTRACT_DEMAND_COST_HIST (
          create_date,
          customer_uuid,
          account_uuid,
          contract_demand_cost_sequence,
          member_no,
          region_code,
          demand_type_code,
          demand_type_code_name,
          demand_type_detail_code,
          demand_type_detail_code_name,
          contract_no,
          demand_month,
          unit_usage_quantity,
          package_unit_usage_quantity,
          total_unit_usage_quantity,
          usage_unit_code,
          usage_unit_code_name,
          product_price,
          use_amount,
          promotion_discount_amount,
          etc_discount_amount,
          promise_discount_amount,
          demand_amount,
          write_date,
          member_price_discount_amount,
          member_promise_discount_amount,
          contract_info,
          pay_currency_code,
          pay_currency_code_name,
          this_month_applied_exchange_rate,
          origin_created_by,
          origin_created_at,
          origin_updated_by,
          origin_updated_at,
          origin_deleted_at,
          created_by,
          created_at
        ) 
        SELECT 
            DATE_FORMAT(created_at, '%Y%m%d'),
            customer_uuid,
            account_uuid,
            contract_demand_cost_sequence,
            member_no,
            region_code,
            demand_type_code,
            demand_type_code_name,
            demand_type_detail_code,
            demand_type_detail_code_name,
            contract_no,
            demand_month,
            unit_usage_quantity,
            package_unit_usage_quantity,
            total_unit_usage_quantity,
            usage_unit_code,
            usage_unit_code_name,
            product_price,
            use_amount,
            promotion_discount_amount,
            etc_discount_amount,
            promise_discount_amount,
            demand_amount,
            write_date,
            member_price_discount_amount,
            member_promise_discount_amount,
            contract_info,
            pay_currency_code,
            pay_currency_code_name,
            this_month_applied_exchange_rate,
            created_by,
            created_at,
            updated_by,
            updated_at,
            deleted_at,
            'Aggregator',
          '` + this.currentTime + `'` +
      `FROM ncp_api.TB_CONTRACT_DEMAND_COST`;
    const contractDemandCostValue = [];

    for (let i = 0; i < contractDemandCostData?.length; i++) {
      contractDemandCostValue[i] = [
        uuidResult.customerUuid,
        uuidResult.accountUuid,
        contractDemandCostData[i].contract_demand_cost_sequence,
        contractDemandCostData[i].demand_month,
        contractDemandCostData[i].member_no,
        contractDemandCostData[i].region_code,
        contractDemandCostData[i].demand_type_code,
        contractDemandCostData[i].demand_type_code_name,
        contractDemandCostData[i].demand_type_detail_code,
        contractDemandCostData[i].demand_type_detail_code_name,
        contractDemandCostData[i].contract_no,
        contractDemandCostData[i].unit_usage_quantity,
        contractDemandCostData[i].package_unit_usage_quantity,
        contractDemandCostData[i].total_unit_usage_quantity,
        contractDemandCostData[i].usage_unit_code,
        contractDemandCostData[i].usage_unit_code_name,
        contractDemandCostData[i].product_price,
        contractDemandCostData[i].use_amount,
        contractDemandCostData[i].promotion_discount_amount,
        contractDemandCostData[i].etc_discount_amount,
        contractDemandCostData[i].promise_discount_amount,
        contractDemandCostData[i].demand_amount,
        contractDemandCostData[i].write_date,
        contractDemandCostData[i].member_price_discount_amount,
        contractDemandCostData[i].member_promise_discount_amount,
        contractDemandCostData[i].contract_info,
        contractDemandCostData[i].pay_currency_code,
        contractDemandCostData[i].pay_currency_code_name,
        contractDemandCostData[i].this_month_applied_exchange_rate,
        'Aggregator',
        this.currentTime,
      ];
    }

    const mysqlConnection = await mysql.createConnection({
      host: config.db.mariadb.host,
      user: config.db.mariadb.user,
      port: config.db.mariadb.port || 3306,
      password: config.db.mariadb.password,
      database: 'ncp_api',
      multipleStatements: true,
    });

    await mysqlConnection.query('START TRANSACTION');
    try {
      await mysqlConnection.query(contractDemandCostHistQuery);
      await mysqlConnection.query(contractDemandCostDelQuery);
      await mysqlConnection.query(contractDemandCostQuery, [contractDemandCostValue]);
      await mysqlConnection.query('COMMIT');
    } catch (err) {
      await mysqlConnection.query('ROLLBACK');
      await mysqlConnection.end();
      console.info('Rollback successful');
      throw `${err}`;
    }
    await mysqlConnection.end();

    return 'successful DB update ';
  }

  public async uploadContract(contractData: IContract[], uuidResult: any): Promise<string> {

    const delYnQuery=  `UPDATE TB_CONTRACT SET deleted_at = '`+ this.currentTime + `' WHERE deleted_at is null`
    const contractQuery = `INSERT INTO ncp_api.TB_CONTRACT (
                              customer_uuid,
                              account_uuid,
                              member_no,
                              contract_no,
                              contract_type_code,
                              contract_type_code_name,
                              conjunction_contract_no,
                              contract_status_code,
                              contract_status_code_name,
                              contract_start_date,
                              contract_end_date,
                              instance_name,
                              region_code,
                              platform_type_code,
                              platform_type_code_name,
                              created_by,
                              created_at,
                              deleted_at
                            ) VALUES ?
                            ON DUPLICATE KEY UPDATE
                              member_no=VALUES(member_no),
                              contract_type_code=VALUES(contract_type_code),
                              contract_type_code_name=VALUES(contract_type_code_name),
                              conjunction_contract_no=VALUES(conjunction_contract_no),
                              contract_status_code=VALUES(contract_status_code),
                              contract_status_code_name=VALUES(contract_status_code_name),
                              contract_start_date=VALUES(contract_start_date),
                              contract_end_date=VALUES(contract_end_date),
                              instance_name=VALUES(instance_name),
                              region_code=VALUES(region_code),
                              platform_type_code=VALUES(platform_type_code),
                              platform_type_code_name=VALUES(platform_type_code_name),
                              updated_by=VALUES(created_by),
                              updated_at=VALUES(created_at),
                              deleted_at=NULL
                            `;

    const contractValue = [];

    for (let i = 0; i < contractData?.length; i++) {
      contractValue[i] = [
        uuidResult.customerUuid,
        uuidResult.accountUuid,
        contractData[i].member_no,
        contractData[i].contract_no,
        contractData[i].contract_type_code,
        contractData[i].contract_type_code_name,
        contractData[i].conjunction_contract_no,
        contractData[i].contract_status_code,
        contractData[i].contract_status_code_name,
        contractData[i].contract_start_date,
        contractData[i].contract_end_date,
        contractData[i].instance_name,
        contractData[i].region_code,
        contractData[i].platform_type_code,
        contractData[i].platform_type_code_name,
        'Aggregator',
        this.currentTime,
        null
      ];
    }

    const mysqlConnection = await mysql.createConnection({
      host: config.db.mariadb.host,
      user: config.db.mariadb.user,
      port: config.db.mariadb.port || 3306,
      password: config.db.mariadb.password,
      // database: config.db.mariadb.dbName,
      database: 'ncp_api',
      multipleStatements: true,
    });

    await mysqlConnection.query('START TRANSACTION');
    try {
      await mysqlConnection.query(delYnQuery);
      await mysqlConnection.query(contractQuery, [contractValue]);
      await mysqlConnection.query('COMMIT');
    } catch (err) {
      await mysqlConnection.query('ROLLBACK');
      await mysqlConnection.end();
      console.info('Rollback successful');
      throw `${err}`;
    }
    await mysqlConnection.end();

    return 'successful DB update ';
  }

  public async uploadContractProduct(contractDemandProduct: IContractProduct[], uuidResult: any): Promise<string> {
    const contractProductQuery = `INSERT INTO ncp_api.TB_CONTRACT_PRODUCT (
                              customer_uuid,
                              account_uuid,
                              contract_product_sequence,
                              before_contract_product_sequence,
                              product_code,
                              price_no,
                              promise_no,
                              instance_no,
                              product_item_kind_code,
                              product_item_kind_code_name,
                              product_rating_type_code,
                              product_rating_type_code_name,
                              service_status_code,
                              service_status_code_name,
                              service_start_date,
                              service_end_date,
                              product_size,
                              product_count,
                              contract_no,
                              created_by,
                              created_at,
                              updated_by,
                              updated_at
                            ) VALUES ?
                            ON DUPLICATE KEY UPDATE
                            before_contract_product_sequence=VALUES(before_contract_product_sequence),
                            product_code=VALUES(product_code),
                            price_no=VALUES(price_no),
                            promise_no=VALUES(promise_no),
                            instance_no=VALUES(instance_no),
                            product_item_kind_code=VALUES(product_item_kind_code),
                            product_item_kind_code_name=VALUES(product_item_kind_code_name),
                            product_rating_type_code=VALUES(product_rating_type_code),
                            product_rating_type_code_name=VALUES(product_rating_type_code_name),
                            service_status_code=VALUES(service_status_code),
                            service_status_code_name=VALUES(service_status_code_name),
                            service_start_date=VALUES(service_start_date),
                            service_end_date=VALUES(service_end_date),
                            product_size=VALUES(product_size),
                            product_count=VALUES(product_count),
                            updated_by=VALUES(created_by),
                            updated_at=VALUES(created_at)
                            `;

    const contractProductValue = [];

    for (let i = 0; i < contractDemandProduct?.length; i++) {
      contractProductValue[i] = [
        uuidResult.customerUuid,
        uuidResult.accountUuid,
        contractDemandProduct[i].contract_product_sequence,
        contractDemandProduct[i].before_contract_product_sequence,
        contractDemandProduct[i].product_code,
        contractDemandProduct[i].price_no,
        contractDemandProduct[i].promise_no,
        contractDemandProduct[i].instance_no,
        contractDemandProduct[i].product_item_kind_code,
        contractDemandProduct[i].product_item_kind_code_name,
        contractDemandProduct[i].product_rating_type_code,
        contractDemandProduct[i].product_rating_type_code_name,
        contractDemandProduct[i].service_status_code,
        contractDemandProduct[i].service_status_code_name,
        contractDemandProduct[i].service_start_date,
        contractDemandProduct[i].service_end_date,
        contractDemandProduct[i].product_size,
        contractDemandProduct[i].product_count,
        contractDemandProduct[i].contract_no,
        'Aggregator',
        this.currentTime,
        'Aggregator',
        this.currentTime,
      ];
    }

    const mysqlConnection = await mysql.createConnection({
      host: config.db.mariadb.host,
      user: config.db.mariadb.user,
      port: config.db.mariadb.port || 3306,
      password: config.db.mariadb.password,
      // database: config.db.mariadb.dbName,
      database: 'ncp_api',
      multipleStatements: true,
    });

    await mysqlConnection.query('START TRANSACTION');
    try {
      await mysqlConnection.query(contractProductQuery, [contractProductValue]);
      await mysqlConnection.query('COMMIT');
    } catch (err) {
      await mysqlConnection.query('ROLLBACK');
      await mysqlConnection.end();
      console.info('Rollback successful');
      throw `${err}`;
    }
    await mysqlConnection.end();

    return 'successful DB update ';
  }

  public async uploadContractDemandProduct(contractDemandProduct: IContractDemandProduct[], uuidResult: any): Promise<string> {
    const contractDemandProductDelQuery = `DELETE FROM ncp_api.TB_CONTRACT_DEMAND_PRODUCT WHERE 1=1`;
    const contractProductQuery = `INSERT INTO ncp_api.TB_CONTRACT_DEMAND_PRODUCT (
                              customer_uuid,
                              account_uuid,
                              demand_month,
                              contract_demand_cost_sequence,
                              contract_product_sequence,
                              before_contract_product_sequence,
                              product_code,
                              price_no,
                              promise_no,
                              instance_no,
                              product_item_kind_code,
                              product_item_kind_code_name,
                              product_rating_type_code,
                              product_rating_type_code_name,
                              service_status_code,
                              service_status_code_name,
                              service_start_date,
                              service_end_date,
                              product_size,
                              product_count,
                              contract_no,
                              created_by,
                              created_at,
                              updated_by,
                              updated_at
                            ) VALUES ?
                            ON DUPLICATE KEY UPDATE
                            before_contract_product_sequence=VALUES(before_contract_product_sequence),
                            product_code=VALUES(product_code),
                            price_no=VALUES(price_no),
                            promise_no=VALUES(promise_no),
                            instance_no=VALUES(instance_no),
                            product_item_kind_code=VALUES(product_item_kind_code),
                            product_item_kind_code_name=VALUES(product_item_kind_code_name),
                            product_rating_type_code=VALUES(product_rating_type_code),
                            product_rating_type_code_name=VALUES(product_rating_type_code_name),
                            service_status_code=VALUES(service_status_code),
                            service_status_code_name=VALUES(service_status_code_name),
                            service_start_date=VALUES(service_start_date),
                            service_end_date=VALUES(service_end_date),
                            product_size=VALUES(product_size),
                            product_count=VALUES(product_count),
                            contract_no=VALUES(contract_no),
                            updated_by=VALUES(created_by),
                            updated_at=VALUES(created_at)
                            `;

    const contractProductHistQuery =
      `INSERT INTO ncp_api.TB_CONTRACT_DEMAND_PRODUCT_HIST (
                              create_date,
                              customer_uuid,
                              account_uuid,
                              demand_month,
                              contract_demand_cost_sequence,
                              contract_product_sequence,
                              before_contract_product_sequence,
                              product_code,
                              price_no,
                              promise_no,
                              instance_no,
                              product_item_kind_code,
                              product_item_kind_code_name,
                              product_rating_type_code,
                              product_rating_type_code_name,
                              service_status_code,
                              service_status_code_name,
                              service_start_date,
                              service_end_date,
                              product_size,
                              product_count,
                              contract_no,
                              origin_created_by,
                              origin_created_at,
                              origin_updated_by,
                              origin_updated_at,
                              origin_deleted_at,
                              created_by,
                              created_at
                            ) 
                            SELECT 
                            DATE_FORMAT(created_at, '%Y%m%d'),
                            customer_uuid,
                            account_uuid,
                            demand_month,
                            contract_demand_cost_sequence,
                            contract_product_sequence,
                            before_contract_product_sequence,
                            product_code,
                            price_no,
                            promise_no,
                            instance_no,
                            product_item_kind_code,
                            product_item_kind_code_name,
                            product_rating_type_code,
                            product_rating_type_code_name,
                            service_status_code,
                            service_status_code_name,
                            service_start_date,
                            service_end_date,
                            product_size,
                            product_count,
                            contract_no,
                            created_by,
                            created_at,
                            updated_by,
                            updated_at,
                            deleted_at,
                            'Aggregator',
                            '` + this.currentTime + `'` +
                            `FROM ncp_api.TB_CONTRACT_DEMAND_PRODUCT`;

    const contractProductValue = [];

    for (let i = 0; i < contractDemandProduct?.length; i++) {
      contractProductValue[i] = [
        uuidResult.customerUuid,
        uuidResult.accountUuid,
        contractDemandProduct[i].demand_month,
        contractDemandProduct[i].contract_demand_cost_sequence,
        contractDemandProduct[i].contract_product_sequence,
        contractDemandProduct[i].before_contract_product_sequence,
        contractDemandProduct[i].product_code,
        contractDemandProduct[i].price_no,
        contractDemandProduct[i].promise_no,
        contractDemandProduct[i].instance_no,
        contractDemandProduct[i].product_item_kind_code,
        contractDemandProduct[i].product_item_kind_code_name,
        contractDemandProduct[i].product_rating_type_code,
        contractDemandProduct[i].product_rating_type_code_name,
        contractDemandProduct[i].service_status_code,
        contractDemandProduct[i].service_status_code_name,
        contractDemandProduct[i].service_start_date,
        contractDemandProduct[i].service_end_date,
        contractDemandProduct[i].product_size,
        contractDemandProduct[i].product_count,
        contractDemandProduct[i].contract_no,
        'Aggregator',
        this.currentTime,
        'Aggregator',
        this.currentTime,
      ];
    }

    const mysqlConnection = await mysql.createConnection({
      host: config.db.mariadb.host,
      user: config.db.mariadb.user,
      port: config.db.mariadb.port || 3306,
      password: config.db.mariadb.password,
      // database: config.db.mariadb.dbName,
      database: 'ncp_api',
      multipleStatements: true,
    });

    await mysqlConnection.query('START TRANSACTION');
    try {
      await mysqlConnection.query(contractProductHistQuery);
      await mysqlConnection.query(contractDemandProductDelQuery);
      await mysqlConnection.query(contractProductQuery, [contractProductValue]);
      await mysqlConnection.query('COMMIT');
    } catch (err) {
      await mysqlConnection.query('ROLLBACK');
      await mysqlConnection.end();
      console.info('Rollback successful');
      throw `${err}`;
    }
    await mysqlConnection.end();

    return 'successful DB update ';
  }

  public async uploadUsage(usageData: IUsage[], uuidResult: any): Promise<string> {

    const usageHistQuery = `INSERT INTO ncp_api.TB_CONTRACT_PRODUCT_USAGE_HIST (
                                create_date,
                                customer_uuid,
                                account_uuid,
                                metering_type_code,
                                metering_type_code_name,
                                contract_product_sequence,
                                use_month,
                                usage_quantity,
                                unit_code,
                                unit_code_name,
                                user_usage_quantity,
                                user_unit_code,
                                user_unit_code_name,
                                contract_no,
                                origin_created_by,
                                origin_created_at,
                                origin_updated_by,
                                origin_updated_at,
                                origin_deleted_at,
                                created_by,
                                created_at
                              ) SELECT 
                                DATE_FORMAT(created_at, '%Y%m%d'),
                                customer_uuid,
                                account_uuid,
                                metering_type_code,
                                metering_type_code_name,
                                contract_product_sequence,
                                use_month,
                                usage_quantity,
                                unit_code,
                                unit_code_name,
                                user_usage_quantity,
                                user_unit_code,
                                user_unit_code_name,
                                contract_no,
                                created_by,
                                created_at,
                                updated_by,
                                updated_at,
                                deleted_at,
                                'Aggregator',
                                '` + this.currentTime + `'
                              FROM ncp_api.TB_CONTRACT_PRODUCT_USAGE
    `;

    const deleteQuery = `DELETE FROM ncp_api.TB_CONTRACT_PRODUCT_USAGE WHERE 1=1`

    const usageQuery = `INSERT INTO ncp_api.TB_CONTRACT_PRODUCT_USAGE (
                              customer_uuid,
                              account_uuid,
                              metering_type_code,
                              metering_type_code_name,
                              contract_product_sequence,
                              use_month,
                              usage_quantity,
                              unit_code,
                              unit_code_name,
                              user_usage_quantity,
                              user_unit_code,
                              user_unit_code_name,
                              contract_no,
                              created_by,
                              created_at,
                              updated_by,
                              updated_at
                            ) VALUES ?
                            ON DUPLICATE KEY UPDATE
                            metering_type_code_name=VALUES(metering_type_code_name),
                            usage_quantity=VALUES(usage_quantity),
                            unit_code=VALUES(unit_code),
                            unit_code_name=VALUES(unit_code_name),
                            user_usage_quantity=VALUES(user_usage_quantity),
                            user_unit_code=VALUES(user_unit_code),
                            user_unit_code_name=VALUES(user_unit_code_name),
                            updated_by=VALUES(created_by),
                            updated_at=VALUES(created_at)
                            `;

    const usageValue = [];

    for (let i = 0; i < usageData?.length; i++) {
      usageValue[i] = [
        uuidResult.customerUuid,
        uuidResult.accountUuid,
        usageData[i].metering_type_code,
        usageData[i].metering_type_code_name,
        usageData[i].contract_product_sequence,
        usageData[i].use_month,
        usageData[i].usage_quantity,
        usageData[i].unit_code,
        usageData[i].unit_code_name,
        usageData[i].user_usage_quantity,
        usageData[i].user_unit_code,
        usageData[i].user_unit_code_name,
        usageData[i].contract_no,
        'Aggregator',
        this.currentTime,
        'Aggregator',
        this.currentTime,
      ];
    }

    const mysqlConnection = await mysql.createConnection({
      host: config.db.mariadb.host,
      user: config.db.mariadb.user,
      port: config.db.mariadb.port || 3306,
      password: config.db.mariadb.password,
      // database: config.db.mariadb.dbName,
      database: 'ncp_api',
      multipleStatements: true,
    });

    await mysqlConnection.query('START TRANSACTION');
    try {
      await mysqlConnection.query(usageHistQuery);
      await mysqlConnection.query(deleteQuery);
      await mysqlConnection.query(usageQuery, [usageValue]);
      await mysqlConnection.query('COMMIT');
    } catch (err) {
      await mysqlConnection.query('ROLLBACK');
      await mysqlConnection.end();
      console.info('Rollback successful');
      throw `${err}`;
    }
    await mysqlConnection.end();

    return 'successful DB update ';
  }

  public async uploadProductPrice(productPriceData: IProduct[], uuidResult: any): Promise<string> {
    const productPriceQuery = `INSERT INTO ncp_api.TB_PRODUCT (
                    customer_uuid,
                    account_uuid,
                    product_item_kind_code,
                    product_item_kind_code_name,
                    product_item_kind_detail_code,
                    product_item_kind_detail_code_name,
                    product_code,
                    product_name,
                    product_description,
                    software_type_code,
                    software_type_code_name,
                    product_type_code,
                    product_type_code_name,
                    gpu_count,
                    cpu_count,
                    memory_size,
                    base_block_storage_size,
                    db_kind_code,
                    db_kind_code_name,
                    os_information,
                    platform_type_code,
                    platform_type_code_name,
                    os_type_code,
                    os_type_code_name,
                    platform_category_code,
                    disk_type_code,
                    disk_type_code_name,
                    disk_detail_type_code,
                    disk_detail_type_code_name,
                    generation_code,
                    price_no,
                    created_by,
                    created_at,
                    updated_by,
                    updated_at
                  ) VALUES ?
                  ON DUPLICATE KEY UPDATE
                    product_item_kind_code=VALUES(product_item_kind_code),
                    product_item_kind_code_name=VALUES(product_item_kind_code_name),
                    product_item_kind_detail_code=VALUES(product_item_kind_detail_code),
                    product_item_kind_detail_code_name=VALUES(product_item_kind_detail_code_name),
                    product_name=VALUES(product_name),
                    product_description=VALUES(product_description),
                    software_type_code=VALUES(software_type_code),
                    software_type_code_name=VALUES(software_type_code_name),
                    product_type_code=VALUES(product_type_code),
                    product_type_code_name=VALUES(product_type_code_name),
                    gpu_count=VALUES(gpu_count),
                    cpu_count=VALUES(cpu_count),
                    memory_size=VALUES(memory_size),
                    base_block_storage_size=VALUES(base_block_storage_size),
                    db_kind_code=VALUES(db_kind_code),
                    db_kind_code_name=VALUES(db_kind_code_name),
                    os_information=VALUES(os_information),
                    platform_type_code=VALUES(platform_type_code),
                    platform_type_code_name=VALUES(platform_type_code_name),
                    os_type_code=VALUES(os_type_code),
                    os_type_code_name=VALUES(os_type_code_name),
                    platform_category_code=VALUES(platform_category_code),
                    disk_type_code=VALUES(disk_type_code),
                    disk_type_code_name=VALUES(disk_type_code_name),
                    disk_detail_type_code=VALUES(disk_detail_type_code),
                    disk_detail_type_code_name=VALUES(disk_detail_type_code_name),
                    generation_code=VALUES(generation_code),
                    price_no=VALUES(price_no),
                    updated_by=VALUES(created_by),
                    updated_at=VALUES(created_at)
                  `;

    const productPriceValue = [];

    for (let i = 0; i < productPriceData?.length; i++) {
      productPriceValue[i] = [
        uuidResult.customerUuid,
        uuidResult.accountUuid,
        productPriceData[i].product_item_kind_code,
        productPriceData[i].product_item_kind_code_name,
        productPriceData[i].product_item_kind_detail_code,
        productPriceData[i].product_item_kind_detail_code_name,
        productPriceData[i].product_code,
        productPriceData[i].product_code_name,
        productPriceData[i].product_description,
        productPriceData[i].software_type_code,
        productPriceData[i].software_type_code_name,
        productPriceData[i].product_type_code,
        productPriceData[i].product_type_code_name,
        productPriceData[i].gpu_count,
        productPriceData[i].cpu_count,
        productPriceData[i].memory_size,
        productPriceData[i].base_block_storage_size,
        productPriceData[i].db_kind_code,
        productPriceData[i].db_kind_code_name,
        productPriceData[i].os_information,
        productPriceData[i].platform_type_code,
        productPriceData[i].platform_type_code_name,
        productPriceData[i].os_type_code,
        productPriceData[i].os_type_code_name,
        productPriceData[i].platform_category_code,
        productPriceData[i].disk_type_code,
        productPriceData[i].disk_type_code_name,
        productPriceData[i].disk_detail_type_code,
        productPriceData[i].disk_detail_type_code_name,
        productPriceData[i].generation_code,
        productPriceData[i].price_no,
        'Aggregator',
        this.currentTime,
        'Aggregator',
        this.currentTime,
      ];
    }

    const mysqlConnection = await mysql.createConnection({
      host: config.db.mariadb.host,
      user: config.db.mariadb.user,
      port: config.db.mariadb.port || 3306,
      password: config.db.mariadb.password,
      // database: config.db.mariadb.dbName,
      database: 'ncp_api',
      multipleStatements: true,
    });

    await mysqlConnection.query('START TRANSACTION');
    try {
      await mysqlConnection.query(productPriceQuery, [productPriceValue]);
      await mysqlConnection.query('COMMIT');
    } catch (err) {
      await mysqlConnection.query('ROLLBACK');
      await mysqlConnection.end();
      console.info('Rollback successful');
      throw `${err}`;
    }
    await mysqlConnection.end();

    return 'successful DB update ';
  }

  public async uploadPrice(priceData: IPrice[], uuidResult: any): Promise<string> {
    const priceQuery = `INSERT INTO ncp_api.TB_PRODUCT_PRICE (
                    customer_uuid,
                    account_uuid,
                    product_code,
                    price_no,
                    price_type_code,
                    price_type_code_name,
                    region,
                    charging_unit_type_code,
                    charging_unit_type_code_name,
                    rating_unit_type_code,
                    rating_unit_type_code_name,
                    charging_unit_basic_value,
                    product_rating_type_code,
                    product_rating_type_code_name,
                    unit_code,
                    unit_code_name,
                    price,
                    condition_type_code,
                    condition_type_code_name,
                    condition_price,
                    price_description,
                    free_unit_code,
                    free_unit_code_name,
                    free_value,
                    metering_unit_code,
                    metering_unit_code_name,
                    start_date,
                    price_attribute_code,
                    price_attribute_code_name,
                    price_version_name,
                    pay_currency_code,
                    pay_currency_code_name,
                    promise_list,
                    period_unit_list,
                    country_unit_list,
                    package_unit_list,
                    created_by,
                    created_at,
                    updated_by,
                    updated_at
                  ) VALUES ?
                  ON DUPLICATE KEY UPDATE
                    price_type_code=VALUES(price_type_code),
                    price_type_code_name=VALUES(price_type_code_name),
                    region=VALUES(region),
                    charging_unit_type_code=VALUES(charging_unit_type_code),
                    charging_unit_type_code_name=VALUES(charging_unit_type_code_name),
                    rating_unit_type_code=VALUES(rating_unit_type_code),
                    rating_unit_type_code_name=VALUES(rating_unit_type_code_name),
                    charging_unit_basic_value=VALUES(charging_unit_basic_value),
                    product_rating_type_code=VALUES(product_rating_type_code),
                    product_rating_type_code_name=VALUES(product_rating_type_code_name),
                    unit_code=VALUES(unit_code),
                    unit_code_name=VALUES(unit_code_name),
                    price=VALUES(price),
                    condition_type_code=VALUES(condition_type_code),
                    condition_type_code_name=VALUES(condition_type_code_name),
                    condition_price=VALUES(condition_price),
                    price_description=VALUES(price_description),
                    free_unit_code=VALUES(free_unit_code),
                    free_unit_code_name=VALUES(free_unit_code_name),
                    free_value=VALUES(free_value),
                    metering_unit_code=VALUES(metering_unit_code),
                    metering_unit_code_name=VALUES(metering_unit_code_name),
                    start_date=VALUES(start_date),
                    price_attribute_code=VALUES(price_attribute_code),
                    price_attribute_code_name=VALUES(price_attribute_code_name),
                    price_version_name=VALUES(price_version_name),
                    pay_currency_code=VALUES(pay_currency_code),
                    pay_currency_code_name=VALUES(pay_currency_code_name),
                    promise_list=VALUES(promise_list),
                    period_unit_list=VALUES(period_unit_list),
                    country_unit_list=VALUES(country_unit_list),
                    package_unit_list=VALUES(package_unit_list),
                    updated_by=VALUES(created_by),
                    updated_at=VALUES(created_at)
                  `;

    const priceValue = [];

    for (let i = 0; i < priceData?.length; i++) {
      priceValue[i] = [
        uuidResult.customerUuid,
        uuidResult.accountUuid,
        priceData[i].product_code,
        priceData[i].price_no,
        priceData[i].price_type_code,
        priceData[i].price_type_code_name,
        priceData[i].region,
        priceData[i].charging_unit_type_code,
        priceData[i].charging_unit_type_code_name,
        priceData[i].rating_unit_type_code,
        priceData[i].rating_unit_type_code_name,
        priceData[i].charging_unit_basic_value,
        priceData[i].product_rating_type_code,
        priceData[i].product_rating_type_code_name,
        priceData[i].unit_code,
        priceData[i].unit_code_name,
        priceData[i].price,
        priceData[i].condition_type_code,
        priceData[i].condition_type_code_name,
        priceData[i].condition_price,
        priceData[i].price_description,
        priceData[i].free_unit_code,
        priceData[i].free_unit_code_name,
        priceData[i].free_value,
        priceData[i].metering_unit_code,
        priceData[i].metering_unit_code_name,
        priceData[i].start_date,
        priceData[i].price_attribute_code,
        priceData[i].price_attribute_code_name,
        priceData[i].price_version_name,
        priceData[i].pay_currency_code,
        priceData[i].pay_currency_code_name,
        priceData[i].promise_list,
        priceData[i].period_unit_list,
        priceData[i].country_unit_list,
        priceData[i].package_unit_list,
        'Aggregator',
        this.currentTime,
        'Aggregator',
        this.currentTime,
      ];
    }

    const mysqlConnection = await mysql.createConnection({
      host: config.db.mariadb.host,
      user: config.db.mariadb.user,
      port: config.db.mariadb.port || 3306,
      password: config.db.mariadb.password,
      // database: config.db.mariadb.dbName,
      database: 'ncp_api',
      multipleStatements: true,
    });

    await mysqlConnection.query('START TRANSACTION');
    try {
      await mysqlConnection.query(priceQuery, [priceValue]);
      await mysqlConnection.query('COMMIT');
    } catch (err) {
      await mysqlConnection.query('ROLLBACK');
      await mysqlConnection.end();
      console.info('Rollback successful');
      throw `${err}`;
    }
    await mysqlConnection.end();

    return 'successful DB update ';
  }

  public async uploadDemandCost(demandCostData: IDemandCost[], uuidResult: any): Promise<string> {
    const demandCostQuery = `INSERT INTO ncp_api.TB_DEMAND_COST (
                            customer_uuid,
                            account_uuid,
                            member_no,
                            demand_month,
                            demand_no,
                            integration_demand_no,
                            demand_attribute_code,
                            demand_attribute_code_name,
                            use_amount,
                            promise_discount_amount,
                            etc_discount_amount,
                            customer_discount_amount,
                            product_discount_amount,
                            credit_discount_amount,
                            rounddown_discount_amount,
                            currency_discount_amount,
                            coin_use_amount,
                            default_amount,
                            this_month_demand_amount,
                            this_month_vat_ratio,
                            this_month_vat_amount,
                            this_month_amount_including_vat,
                            total_demand_amount,
                            is_paid_up,
                            paid_up_date,
                            overdue_occur_date,
                            overdue_plus_amount,
                            overdue_ratio,
                            this_month_overdue_amount,
                            before_month_demand_no,
                            total_overdue_amount,
                            write_date,
                            member_price_discount_amount,
                            member_promise_discount_add_amount,
                            pay_currency_code,
                            pay_currency_code_name,
                            this_month_applied_exchange_rate,
                            promotion_discount_amount
                          ) VALUES ?
                          ON DUPLICATE KEY UPDATE
                            member_no=VALUES(member_no), 
                            demand_no=VALUES(demand_no),
                            integration_demand_no=VALUES(integration_demand_no),
                            demand_attribute_code=VALUES(demand_attribute_code),
                            demand_attribute_code_name=VALUES(demand_attribute_code_name),
                            use_amount=VALUES(use_amount),
                            promise_discount_amount=VALUES(promise_discount_amount),
                            etc_discount_amount=VALUES(etc_discount_amount),
                            customer_discount_amount=VALUES(customer_discount_amount),
                            product_discount_amount=VALUES(product_discount_amount),
                            credit_discount_amount=VALUES(credit_discount_amount),
                            rounddown_discount_amount=VALUES(rounddown_discount_amount),
                            currency_discount_amount=VALUES(currency_discount_amount),
                            coin_use_amount=VALUES(coin_use_amount),
                            default_amount=VALUES(default_amount),
                            this_month_demand_amount=VALUES(this_month_demand_amount),
                            this_month_vat_ratio=VALUES(this_month_vat_ratio),
                            this_month_vat_amount=VALUES(this_month_vat_amount),
                            this_month_amount_including_vat=VALUES(this_month_amount_including_vat),
                            total_demand_amount=VALUES(total_demand_amount),
                            is_paid_up=VALUES(is_paid_up),
                            paid_up_date=VALUES(paid_up_date),
                            overdue_occur_date=VALUES(overdue_occur_date),
                            overdue_plus_amount=VALUES(overdue_plus_amount),
                            overdue_ratio=VALUES(overdue_ratio),
                            this_month_overdue_amount=VALUES(this_month_overdue_amount),
                            before_month_demand_no=VALUES(before_month_demand_no),
                            total_overdue_amount=VALUES(total_overdue_amount),
                            write_date=VALUES(write_date),
                            member_price_discount_amount=VALUES(member_price_discount_amount),
                            member_promise_discount_add_amount=VALUES(member_promise_discount_add_amount),
                            pay_currency_code=VALUES(pay_currency_code),
                            pay_currency_code_name=VALUES(pay_currency_code_name),
                            this_month_applied_exchange_rate=VALUES(this_month_applied_exchange_rate),
                            promotion_discount_amount=VALUES(promotion_discount_amount)
                          `;

    const demandCostValue = [];

    for (let i = 0; i < demandCostData?.length; i++) {
      demandCostValue[i] = [
        uuidResult.customerUuid,
        uuidResult.accountUuid,
        demandCostData[i].member_no,
        demandCostData[i].demand_month,
        demandCostData[i].demand_no,
        demandCostData[i].integration_demand_no,
        demandCostData[i].demand_attribute_code,
        demandCostData[i].demand_attribute_code_name,
        demandCostData[i].use_amount,
        demandCostData[i].promise_discount_amount,
        demandCostData[i].etc_discount_amount,
        demandCostData[i].customer_discount_amount,
        demandCostData[i].product_discount_amount,
        demandCostData[i].credit_discount_amount,
        demandCostData[i].rounddown_discount_amount,
        demandCostData[i].currency_discount_amount,
        demandCostData[i].coin_use_amount,
        demandCostData[i].default_amount,
        demandCostData[i].this_month_demand_amount,
        demandCostData[i].this_month_vat_ratio,
        demandCostData[i].this_month_vat_amount,
        demandCostData[i].this_month_amount_including_vat,
        demandCostData[i].total_demand_amount,
        demandCostData[i].is_paid_up,
        demandCostData[i].paid_up_date,
        demandCostData[i].overdue_occur_date,
        demandCostData[i].overdue_plus_amount,
        demandCostData[i].overdue_ratio,
        demandCostData[i].this_month_overdue_amount,
        demandCostData[i].before_month_demand_no,
        demandCostData[i].total_overdue_amount,
        demandCostData[i].write_date,
        demandCostData[i].member_price_discount_amount,
        demandCostData[i].member_promise_discount_add_amount,
        demandCostData[i].pay_currency_code,
        demandCostData[i].pay_currency_code_name,
        demandCostData[i].this_month_applied_exchange_rate,
        demandCostData[i].promotion_discount_amount,
      ];
    }

    const mysqlConnection = await mysql.createConnection({
      host: config.db.mariadb.host,
      user: config.db.mariadb.user,
      port: config.db.mariadb.port || 3306,
      password: config.db.mariadb.password,
      // database: config.db.mariadb.dbName,
      database: 'ncp_api',
      multipleStatements: true,
    });

    await mysqlConnection.query('START TRANSACTION');
    try {
      await mysqlConnection.query(demandCostQuery, [demandCostValue]);
      await mysqlConnection.query('COMMIT');
    } catch (err) {
      await mysqlConnection.query('ROLLBACK');
      await mysqlConnection.end();
      console.info('Rollback successful');
      throw `${err}`;
    }
    await mysqlConnection.end();

    return 'successful DB update ';
  }

  public async uploadCostRelationCode(costRelationCode: ICostRelationCode[], uuidResult: any): Promise<string> {
    const deleteQuery = `DELETE FROM TB_COST_RELATION_CODE WHERE 1=1`
    const costRelationQuery = `INSERT INTO ncp_api.TB_COST_RELATION_CODE (
                              customer_uuid,
                              account_uuid,
                              cost_relation_code_sequence,
                              contract_type_code,
                              contract_type_code_name,
                              product_item_kind_code,
                              product_item_kind_code_name,
                              product_rating_type_code,
                              product_rating_type_code_name,
                              metering_type_code,
                              metering_type_code_name,
                              demand_type_code,
                              demand_type_code_name,
                              demand_type_detail_code,
                              demand_type_detail_code_name,
                              product_demand_type_code,
                              product_demand_type_code_name
                            ) VALUES ?
                            ON DUPLICATE KEY UPDATE
                            contract_type_code_name=VALUES(contract_type_code_name),
                            product_item_kind_code_name=VALUES(product_item_kind_code_name),
                            product_rating_type_code=VALUES(product_rating_type_code),
                            product_rating_type_code_name=VALUES(product_rating_type_code_name),
                            metering_type_code=VALUES(metering_type_code),
                            metering_type_code_name=VALUES(metering_type_code_name),
                            demand_type_code_name=VALUES(demand_type_code_name),
                            demand_type_detail_code=VALUES(demand_type_detail_code),
                            demand_type_detail_code_name=VALUES(demand_type_detail_code_name),
                            product_demand_type_code_name=VALUES(product_demand_type_code_name)
                            `;

    let costRelationCodeValue = []
    for (let i = 0; i < costRelationCode?.length; i++) {
      costRelationCodeValue[i] = [
        uuidResult.customerUuid,
        uuidResult.accountUuid,
        i,
        costRelationCode[i].contract_type_code,
        costRelationCode[i].contract_type_code_name,
        costRelationCode[i].product_item_kind_code,
        costRelationCode[i].product_item_kind_code_name,
        costRelationCode[i].product_rating_type_code,
        costRelationCode[i].product_rating_type_code_name,
        costRelationCode[i].metering_type_code,
        costRelationCode[i].metering_type_code_name,
        costRelationCode[i].demand_type_code,
        costRelationCode[i].demand_type_code_name,
        costRelationCode[i].demand_type_detail_code,
        costRelationCode[i].demand_type_detail_code_name,
        costRelationCode[i].product_demand_type_code,
        costRelationCode[i].product_demand_type_code_name,
      ];
    }

    const mysqlConnection = await mysql.createConnection({
      host: config.db.mariadb.host,
      user: config.db.mariadb.user,
      port: config.db.mariadb.port || 3306,
      password: config.db.mariadb.password,
      // database: config.db.mariadb.dbName,
      database: 'ncp_api',
      multipleStatements: true,
    });

    await mysqlConnection.query('START TRANSACTION');
    try {
      await mysqlConnection.query(deleteQuery);
      await mysqlConnection.query(costRelationQuery, [costRelationCodeValue]);
      await mysqlConnection.query('COMMIT');
    } catch (err) {
      await mysqlConnection.query('ROLLBACK');
      await mysqlConnection.end();
      console.info('Rollback successful');
      throw `${err}`;
    }
    await mysqlConnection.end();

    return 'successful DB update ';
  }
}

export default NcpCostService;
