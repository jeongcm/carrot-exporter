import { INcpResource } from '@/common/interfaces/ncpResource.interface';
import { INcpResourceGroup } from '@/common/interfaces/ncpResourceGroup.interface';
import DB from '@/database';
import config from '@config/index';
import QueryService from '@modules/Resources/query/query';
import mysql from 'mysql2/promise';

class ncpResourceService {
  public queryService = new QueryService();
  public ncpResource = DB.NcpResource;

  public async uploadNcpResource(totalMsg) {
    let queryResult;
    let resultMsg;
    queryResult = await this.queryService.getResourceQuery(totalMsg, totalMsg.cluster_uuid);

    if (Object.keys(queryResult.message).length === 0) {
      console.log(`skip to upload resource(${queryResult.resourceType}). cause: empty list`);
      return 'empty list';
    }

    try {
      resultMsg = await this.uploadResource(JSON.parse(queryResult.message));

      console.log(`success to upload resource(${queryResult.resourceType}).`);
      return resultMsg;
    } catch (err) {
      console.log(`failed to upload resource(${queryResult.resourceType}. cause: ${err})`);
      return err;
    }
  }

  public async uploadNcpResourceGroup(totalMsg) {
    let queryResult;
    let resultMsg;
    queryResult = await this.queryService.getResourceQuery(totalMsg, totalMsg.cluster_uuid);

    if (Object.keys(queryResult.message).length === 0) {
      console.log(`skip to upload ncpResourceGroup(${queryResult.resourceType}). cause: empty list`);
      return 'empty list';
    }

    try {
      resultMsg = await this.uploadResourceGroup(JSON.parse(queryResult.message));

      console.log(`success to upload resourceGroup(${queryResult.resourceType}).`);
      return resultMsg;
    } catch (err) {
      console.log(`failed to upload resourceGroup(${queryResult.resourceType}. cause: ${err})`);
      return err;
    }
  }

  public async uploadResource(data: INcpResource[]): Promise<string> {
    const query1 = `INSERT INTO ops_api.TB_RESOURCE (
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
                        resource_id
                      ) VALUES ?
                      ON DUPLICATE KEY UPDATE
                      nrn=VALUES(nrn),
                      platform_type=VALUES(platform_type),
                      product_name=VALUES(product_name),
                      product_display_name=VALUES(product_display_name),
                      region_code=VALUES(region_code),
                      region_display_name=VALUES(region_display_name),
                      resource_type=VALUES(resource_type),
                      resource_name=VALUES(resource_name),
                      create_time=VALUES(create_time),
                      event_time=VALUES(event_time)
                      `;

    const query2 = [];

    for (let i = 0; i < data?.length; i++) {
      query2[i] = [
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

  public async uploadResourceGroup(data: INcpResourceGroup[]): Promise<string> {
    const query1 = `INSERT INTO ops_api.TB_RESOURCE_GROUP (
                        group_id,
                        group_name,
                        group_desc,
                        create_time,
                        update_time
                      ) VALUES ?
                      ON DUPLICATE KEY UPDATE
                        group_name=VALUES(group_name),
                        group_desc=VALUES(group_desc),
                        create_time=VALUES(create_time),
                        update_time=VALUES(update_time)
                      `;

    const query2 = [];

    for (let i = 0; i < data?.length; i++) {
      query2[i] = [data[i].group_id, data[i].group_name, data[i].group_desc, data[i].create_time, data[i].update_time];
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
