import { IContract, IContractDemandCost, IContractDemandProduct, IContractProduct, IUsage } from '@/common/interfaces/ncpCost.interface';
import DB from '@/database';
import config from '@config/index';
import mysql from 'mysql2/promise';
import QueryService from '@modules/Resources/query/query';
class NcpCostService {
  public queryService = new QueryService();

  currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
  /* 
  
  */
  public async uploadNcpContractDemandCost(totalMsg) {
    let queryResult: any;
    let resultMsg: any;
    queryResult = await this.queryService.getResourceQuery(totalMsg, totalMsg.cluster_uuid);

    const result = JSON.parse(queryResult.message);
    if (Object.keys(queryResult.message).length === 0) {
      console.log(`skip to upload ncpResourceGroup(${queryResult.resourceType}). cause: empty list`);
      return 'empty list';
    }

    try {
      //Insert TB_CONTRACT_DEMAND_COST
      resultMsg = await this.uploadContractDemandCost(result.contractDemandCostList);
      console.log(`success to upload contractDemandCost(${queryResult.resourceType}).`);

      //※ 2023.05.15 Contract 정보는 Usage API 에서 쌓도록 변경.
      // resultMsg = await this.uploadContract(result.contractList);

      //Insert TB_CONTRACT_DEMAND_PRODUCT
      resultMsg = await this.uploadContractDemandProduct(result.contractProductList);
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

    const result = JSON.parse(queryResult.message);
    if (Object.keys(queryResult.message).length === 0) {
      console.log(`skip to upload ncpResourceGroup(${queryResult.resourceType}). cause: empty list`);
      return 'empty list';
    }

    try {
      //Insert TB_CONTRACT

      resultMsg = await this.uploadContract(result.contractList);
      console.log(`success to upload contract(${queryResult.resourceType}).`);
      //Insert TB_CONTRACT_PRODUCT
      resultMsg = await this.uploadContractProduct(result.contractProductList);
      console.log(`success to upload contractProduct(${queryResult.resourceType}).`);
      //Insert TB_USAGE
      resultMsg = await this.uploadUsage(result.usageList);
      console.log(`success to upload usage(${queryResult.resourceType}).`);
      return resultMsg;
    } catch (err) {
      console.log(`failed to upload contractDemandCost(${queryResult.resourceType}. cause: ${err})`);
      return err;
    }
  }

  public async uploadContractDemandCost(contractDemandCostData: IContractDemandCost[]): Promise<string> {
    const contractDemandCostDelQuery = `DELETE FROM ncp_api.TB_CONTRACT_DEMAND_COST WHERE 1=1`;
    const contractDemandCostQuery = `INSERT INTO ncp_api.TB_CONTRACT_DEMAND_COST (
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
                    updated_at
                  ) VALUES ?
                  ON DUPLICATE KEY UPDATE
                  customer_uuid=VALUES(customer_uuid),
                  account_uuid=VALUES(account_uuid),
                  contract_demand_cost_sequence=VALUES(contract_demand_cost_sequence),
                  member_no=VALUES(member_no),
                  region_code=VALUES(region_code),
                  demand_type_code=VALUES(demand_type_code),
                  demand_type_code_name=VALUES(demand_type_code_name),
                  demand_type_detail_code=VALUES(demand_type_detail_code),
                  demand_type_detail_code_name=VALUES(demand_type_detail_code_name),
                  contract_no=VALUES(contract_no),
                  demand_month=VALUES(demand_month),
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
                  created_by=VALUES(created_by),
                  created_at=VALUES(created_at),
                  updated_by=VALUES(updated_by),
                  updated_at=VALUES(updated_at)
                  `;

    const contractDemandCostValue = [];

    for (let i = 0; i < contractDemandCostData?.length; i++) {
      contractDemandCostValue[i] = [
        '31692fe1-05a4-45d4-bea3-0341263992d6',
        '6d322805-e972-11ed-a07e-9e43039dcae0',
        contractDemandCostData[i].contract_demand_cost_sequence,
        contractDemandCostData[i].member_no,
        contractDemandCostData[i].region_code,
        contractDemandCostData[i].demand_type_code,
        contractDemandCostData[i].demand_type_code_name,
        contractDemandCostData[i].demand_type_detail_code,
        contractDemandCostData[i].demand_type_detail_code_name,
        contractDemandCostData[i].contract_no,
        contractDemandCostData[i].demand_month,
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
      database: 'ops_api',
      multipleStatements: true,
    });

    await mysqlConnection.query('START TRANSACTION');
    try {
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

  public async uploadContract(contractData: IContract[]): Promise<string> {
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
                              updated_by,
                              updated_at
                            ) VALUES ?
                            ON DUPLICATE KEY UPDATE
                              customer_uuid=VALUES(customer_uuid),
                              account_uuid=VALUES(account_uuid),
                              member_no=VALUES(member_no),
                              contract_no=VALUES(contract_no),
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
                              created_by=VALUES(created_by),
                              created_at=VALUES(created_at),
                              updated_by=VALUES(updated_by),
                              updated_at=VALUES(updated_at)
                            `;

    const contractValue = [];

    for (let i = 0; i < contractData?.length; i++) {
      contractValue[i] = [
        '31692fe1-05a4-45d4-bea3-0341263992d6',
        '6d322805-e972-11ed-a07e-9e43039dcae0',
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
      database: 'ops_api',
      multipleStatements: true,
    });

    await mysqlConnection.query('START TRANSACTION');
    try {
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

  public async uploadContractProduct(contractDemandProduct: IContractProduct[]): Promise<string> {
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
                              contract_no
                            ) VALUES ?
                            ON DUPLICATE KEY UPDATE
                            customer_uuid=VALUES(customer_uuid),
                            account_uuid=VALUES(account_uuid),
                            contract_product_sequence=VALUES(contract_product_sequence),
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
                            created_by=VALUES(created_by),
                            created_at=VALUES(created_at),
                            updated_by=VALUES(updated_by),
                            updated_at=VALUES(updated_at)
                            `;

    const contractProductValue = [];

    for (let i = 0; i < contractDemandProduct?.length; i++) {
      contractProductValue[i] = [
        '31692fe1-05a4-45d4-bea3-0341263992d6',
        '6d322805-e972-11ed-a07e-9e43039dcae0',
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
      database: 'ops_api',
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

  public async uploadContractDemandProduct(contractDemandProduct: IContractDemandProduct[]): Promise<string> {
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
                            customer_uuid=VALUES(customer_uuid),
                            account_uuid=VALUES(account_uuid),
                            demand_month=VALUES(demand_month),
                            contract_demand_cost_sequence=VALUES(contract_demand_cost_sequence),
                            contract_product_sequence=VALUES(contract_product_sequence),
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
                            created_by=VALUES(created_by),
                            created_at=VALUES(created_at),
                            updated_by=VALUES(updated_by),
                            updated_at=VALUES(updated_at)
                            `;

    const contractProductValue = [];

    for (let i = 0; i < contractDemandProduct?.length; i++) {
      contractProductValue[i] = [
        '31692fe1-05a4-45d4-bea3-0341263992d6',
        '6d322805-e972-11ed-a07e-9e43039dcae0',
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
      database: 'ops_api',
      multipleStatements: true,
    });

    await mysqlConnection.query('START TRANSACTION');
    try {
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

  public async uploadUsage(usageData: IUsage[]): Promise<string> {
    const usageQuery = `INSERT INTO ncp_api.TB_USAGE (
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
                              contract_no
                            ) VALUES ?
                            ON DUPLICATE KEY UPDATE
                            metering_type_code=VALUES(metering_type_code),
                            metering_type_code_name=VALUES(metering_type_code_name),
                            contract_product_sequence=VALUES(contract_product_sequence),
                            use_month=VALUES(use_month),
                            usage_quantity=VALUES(usage_quantity),
                            unit_code=VALUES(unit_code),
                            unit_code_name=VALUES(unit_code_name),
                            user_usage_quantity=VALUES(user_usage_quantity),
                            user_unit_code=VALUES(user_unit_code),
                            user_unit_code_name=VALUES(user_unit_code_name),
                            contract_no=VALUES(contract_no)
                            `;

    const usageValue = [];

    for (let i = 0; i < usageData?.length; i++) {
      usageValue[i] = [
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
      ];
    }

    const mysqlConnection = await mysql.createConnection({
      host: config.db.mariadb.host,
      user: config.db.mariadb.user,
      port: config.db.mariadb.port || 3306,
      password: config.db.mariadb.password,
      // database: config.db.mariadb.dbName,
      database: 'ops_api',
      multipleStatements: true,
    });

    await mysqlConnection.query('START TRANSACTION');
    try {
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
}
export default NcpCostService;
