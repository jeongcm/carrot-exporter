import { INcpResource } from '@/common/interfaces/ncpResource.interface';
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

  public async uploadResource(data: INcpResource): Promise<string> {
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

    for (let i = 0; i < data.ncpResource?.length; i++) {
      query2[i] = [
        data.ncpResource[i].nrn,
        data.ncpResource[i].platform_type,
        data.ncpResource[i].product_name,
        data.ncpResource[i].product_display_name,
        data.ncpResource[i].region_code,
        data.ncpResource[i].region_display_name,
        data.ncpResource[i].resource_type,
        data.ncpResource[i].resource_name,
        data.ncpResource[i].create_time,
        data.ncpResource[i].event_time,
        data.ncpResource[i].resource_id,
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
}
export default ncpResourceService;
