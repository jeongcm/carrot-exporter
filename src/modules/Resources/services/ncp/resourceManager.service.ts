import { INcpResource } from '@/common/interfaces/ncpResource.interface';
import { INcpResourceGroup } from '@/common/interfaces/ncpResourceGroup.interface';
import { IResourceGroup } from '@/common/interfaces/resourceGroup.interface';
import { INcpResourceGroupRelation } from '@/common/interfaces/ncpResourceGroupRelation.interface';
import DB from '@/database';
import config from '@config/index';
import QueryService from '@modules/Resources/query/query';
import mysql from 'mysql2/promise';
import { ICustomerAccount } from '@/common/interfaces/customerAccount.interface';

class ncpResourceService {
  public queryService = new QueryService();
  public ncpResource = DB.NcpResource;
  public resourceGroup = DB.ResourceGroup;
  public customerAccounnt = DB.CustomerAccount;

  currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

  public async uploadNcpResource(totalMsg) {
    let queryResult;
    let resultMsg;
    queryResult = await this.queryService.getResourceQuery(totalMsg, totalMsg.cluster_uuid);

    const result = JSON.parse(queryResult.message);

    if (Object.keys(queryResult.message).length === 0) {
      console.log(`skip to upload resource(${queryResult.resourceType}). cause: empty list`);
      return 'empty list';
    }

    try {
      resultMsg = await this.uploadResource(result.resourceList);

      console.log(`success to upload resource(${queryResult.resourceType}).`);
      return resultMsg;
    } catch (err) {
      console.log(`failed to upload resource(${queryResult.resourceType}. cause: ${err})`);
      return err;
    }
  }

  public async uploadNcpResourceGroupRelation(totalMsg) {
    let queryResult;
    let resultMsg;
    queryResult = await this.queryService.getResourceQuery(totalMsg, totalMsg.cluster_uuid);

    const result = JSON.parse(queryResult.message);
    if (Object.keys(queryResult.message).length === 0) {
      console.log(`skip to upload ncpResourceGroup(${queryResult.resourceType}). cause: empty list`);
      return 'empty list';
    }

    try {
      resultMsg = await this.uploadResourceGroup(result.resourceGroupList, queryResult.clusterUuid);
      console.log(`success to upload resourceGroup(${queryResult.resourceType}).`);

      resultMsg = await this.uploadResourceGroupRelation(result.resourceGroupRelationList);
      console.log(`success to upload resourceGroupRelation(${queryResult.resourceType}).`);

      return resultMsg;
    } catch (err) {
      console.log(`failed to upload resourceGroup(${queryResult.resourceType}. cause: ${err})`);
      return err;
    }
  }

  public async uploadResource(data: INcpResource[]): Promise<string> {
    const query1 = `INSERT INTO ops_api.TB_RESOURCE (
                        customer_uuid,
                        nrn,
                        platform_type,
                        product_name,
                        product_display_name,
                        region_code,
                        region_display_name,
                        resource_type,
                        resource_name,
                        create_time,
                        event_time,
                        resource_id,
                        created_by,
                        created_at,
                        updated_by,
                        updated_at
                      ) VALUES ?
                      ON DUPLICATE KEY UPDATE
                      customer_uuid=VALUES(customer_uuid),
                      nrn=VALUES(nrn),
                      platform_type=VALUES(platform_type),
                      product_name=VALUES(product_name),
                      product_display_name=VALUES(product_display_name),
                      region_code=VALUES(region_code),
                      region_display_name=VALUES(region_display_name),
                      resource_type=VALUES(resource_type),
                      resource_name=VALUES(resource_name),
                      create_time=VALUES(create_time),
                      event_time=VALUES(event_time),
                      created_by=VALUES(created_by),
                      created_at=VALUES(created_at),
                      updated_by=VALUES(updated_by),
                      updated_at=VALUES(updated_at)
                      `;

    const query2 = [];

    for (let i = 0; i < data?.length; i++) {
      query2[i] = [
        '31692fe1-05a4-45d4-bea3-0341263992d6',
        data[i].nrn,
        data[i].platform_type,
        data[i].product_name,
        data[i].product_display_name,
        data[i].region_code,
        data[i].region_display_name,
        data[i].resource_type,
        data[i].resource_name,
        data[i].create_time,
        data[i].event_time,
        data[i].resource_id,
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
      await mysqlConnection.query(query1, [query2]);
      await mysqlConnection.query('COMMIT');
    } catch (err) {
      await mysqlConnection.query('ROLLBACK');
      await mysqlConnection.end();
      console.info('Rollback successful');
      throw `${err}`;
    }
    await mysqlConnection.end();

    return 'successful DB update ';
  } // end of massUploadResource

  public async uploadResourceGroup(data: INcpResourceGroup[], resourceGroupUuid: string): Promise<string> {
    const responseResourceGroup: IResourceGroup = await this.resourceGroup.findOne({ where: { resourceGroupUuid } });
    const customerAccountKey = responseResourceGroup.customerAccountKey;
    const customerAccount: ICustomerAccount = await this.customerAccounnt.findOne({ where: { customerAccountKey } });

    console.log(customerAccount);
    const query1 = `INSERT INTO ops_api.TB_RESOURCE_GROUP (
                        customer_uuid,
                        group_id,
                        group_name,
                        group_desc,
                        create_time,
                        update_time,
                        del_yn,
                        created_by,
                        created_at,
                        updated_by,
                        updated_at
                      ) VALUES ?
                      ON DUPLICATE KEY UPDATE
                        customer_uuid=VALUES(customer_uuid),
                        group_name=VALUES(group_name),
                        group_desc=VALUES(group_desc),
                        create_time=VALUES(create_time),
                        update_time=VALUES(update_time),
                        del_yn=VALUES(del_yn),
                        created_by=VALUES(created_by),
                        created_at=VALUES(created_at),
                        updated_by=VALUES(updated_by),
                        updated_at=VALUES(updated_at)
                      `;

    const query2 = [];

    for (let i = 0; i < data.length; i++) {
      query2[i] = [
        // customerAccount.customer_uuid,
        data[i].group_id,
        data[i].group_name,
        data[i].group_desc,
        data[i].create_time,
        data[i].update_time,
        0,
        'Aggregator',
        this.currentTime,
        'Aggregator',
        this.currentTime,
      ];
    }

    console.log(query2[0]);
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
      await mysqlConnection.query(query1, [query2]);
      await mysqlConnection.query('COMMIT');
    } catch (err) {
      await mysqlConnection.query('ROLLBACK');
      await mysqlConnection.end();
      console.info('Rollback successful');
      throw `${err}`;
    }
    await mysqlConnection.end();

    return 'successful DB update ';
  } // end of massUploadResource
  public async uploadResourceGroupRelation(data: INcpResourceGroupRelation[]): Promise<string> {
    const query1 = `INSERT INTO ops_api.TB_RESOURCE_GROUP_RELATION (
                        group_id,
                        resource_id,
                        created_by,
                        created_at,
                        updated_by,
                        updated_at
                      ) VALUES ?
                      ON DUPLICATE KEY UPDATE
                        group_id=VALUES(group_id),
                        resource_id=VALUES(resource_id),
                        created_by=VALUES(created_by),
                        created_at=VALUES(created_at),
                        updated_by=VALUES(updated_by),
                        updated_at=VALUES(updated_at)
                      `;

    const query2 = [];

    for (let i = 0; i < data?.length; i++) {
      query2[i] = [data[i].group_id, data[i].resource_id, 'Aggregator', this.currentTime, 'Aggregator', this.currentTime];
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
      await mysqlConnection.query(query1, [query2]);
      await mysqlConnection.query('COMMIT');
    } catch (err) {
      await mysqlConnection.query('ROLLBACK');
      await mysqlConnection.end();
      console.info('Rollback successful');
      throw `${err}`;
    }
    await mysqlConnection.end();

    return 'successful DB update ';
  } // end of massUploadResource
}

export default ncpResourceService;
