import { IContract, IContractDemandCost, IContractProduct } from '@/common/interfaces/ncpCost.interface';
import DB from '@/database';
import config from '@config/index';
import mysql from 'mysql2/promise';
import QueryService from '@modules/Resources/query/query';
class NcpCostService {
  public queryService = new QueryService();

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
      resultMsg = await this.uploadContractProduct(result.contractProductList);
      console.log(`success to upload contractProduct(${queryResult.resourceType}).`);

      return resultMsg;
    } catch (err) {
      console.log(`failed to upload contractDemandCost(${queryResult.resourceType}. cause: ${err})`);
      return err;
    }
  }

  public async uploadContractDemandCost(contractDemandCostData: IContractDemandCost[]): Promise<string> {
    const contractDemandCostQuery = `INSERT INTO claiops_test.TB_CONTRACT_DEMAND_COST (
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
                    pay_currency_code,
                    pay_currency_code_name,
                    this_month_applied_exchange_rate
                  ) VALUES ?
                  ON DUPLICATE KEY UPDATE
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
                  pay_currency_code=VALUES(pay_currency_code),
                  pay_currency_code_name=VALUES(pay_currency_code_name),
                  this_month_applied_exchange_rate=VALUES(this_month_applied_exchange_rate)
                  `;

    const contractDemandCostValue = [];

    for (let i = 0; i < contractDemandCostData?.length; i++) {
      contractDemandCostValue[i] = [
        i,
        // data[i].contract_demand_cost_sequence,
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
        contractDemandCostData[i].pay_currency_code,
        contractDemandCostData[i].pay_currency_code_name,
        contractDemandCostData[i].this_month_applied_exchange_rate,
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
    const contractQuery = `INSERT INTO claiops_test.TB_CONTRACT (
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
                              platform_type_code_name
                            ) VALUES ?
                            ON DUPLICATE KEY UPDATE
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
                              platform_type_code_name=VALUES(platform_type_code_name)
                            `;

    const contractValue = [];

    for (let i = 0; i < contractData?.length; i++) {
      contractValue[i] = [
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
    const contractProductQuery = `INSERT INTO claiops_test.TB_CONTRACT_DEMAND_PRODUCT (
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
                            contract_no=VALUES(contract_no)
                            `;

    const contractProductValue = [];

    for (let i = 0; i < contractDemandProduct?.length; i++) {
      contractProductValue[i] = [
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
}
export default NcpCostService;
