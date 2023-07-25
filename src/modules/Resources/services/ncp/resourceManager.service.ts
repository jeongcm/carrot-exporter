import { INcpResource } from '@/common/interfaces/ncpResource.interface';
import { INcpResourceGroup } from '@/common/interfaces/ncpResourceGroup.interface';
import { IResourceGroup } from '@/common/interfaces/resourceGroup.interface';
import { INcpResourceGroupRelation } from '@/common/interfaces/ncpResourceGroupRelation.interface';
import { DB, OpsCommDB, OpsApiDB } from '@/database/index';
import config from '@config/index';
import QueryService from '@modules/Resources/query/query';
import mysql from 'mysql2/promise';
import { ITbCustomer } from '@/common/interfaces/tbCustomer.interface';
import { ITbCustomerAccountCloudPlatform } from '@/common/interfaces/tbCustomerAccountCloudPlatform.interface';

class NcpResourceService {
  public queryService = new QueryService();
  // public ncpResource = DB.NcpResource;
  public resourceGroup = DB.ResourceGroup;
  public customerAccounnt = DB.CustomerAccount;

  public tbCustomer = OpsCommDB.TbCustomer;
  public tbCustomerAccountCloudPlatform = OpsApiDB.TbCustomerAccountCloudPlatform;

  public getCurrentTime () {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
  }

  //UUID 발급
  public async getUuid(resourceGroupUuid: string) {
    const responseResourceGroup: IResourceGroup = await this.resourceGroup.findOne({ where: { resourceGroupUuid } });
    const resourceGroupKey = responseResourceGroup.resourceGroupKey;

    // const ncCustomerAccountKey = resourceGroupKey;
    // // const ncCustomerAccountKey = 48;
    // const customerUuidResult: ITbCustomer = await this.tbCustomer.findOne({ where: { ncCustomerAccountKey } });
    // const customerUuid = customerUuidResult.customerUuid;
    
    const ncResourceGroupKey = resourceGroupKey

    const accountUuidResult: ITbCustomerAccountCloudPlatform = await this.tbCustomerAccountCloudPlatform.findOne({ where: { ncResourceGroupKey } });
    const accountUuid = accountUuidResult.accountUuid
    const customerUuid = accountUuidResult.customerUuid

    return { customerUuid: customerUuid, accountUuid: accountUuid };
  }

  public async uploadNcpResource(totalMsg) {
    let queryResult;
    let resultMsg;
    queryResult = await this.queryService.getResourceQuery(totalMsg, totalMsg.cluster_uuid);
    const result = JSON.parse(queryResult.message);
    const uuidResult = await this.getUuid(queryResult.clusterUuid);
    if (Object.keys(queryResult.message).length === 0) {
      console.log(`skip to upload resource(${queryResult.resourceType}). cause: empty list`);
      return 'empty list';
    }
    try {
      resultMsg = await this.uploadResource(result.resourceList, uuidResult);

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
    const uuidResult = await this.getUuid(queryResult.clusterUuid);

    //'월' 바뀐지 체크.
    let monthChk = false
    let currentDate = new Date()
    
    let toMonth = currentDate.getMonth() + 1 
    currentDate.setDate(currentDate.getDate()-1) //하루 차감
    let yesterMonth = currentDate.getMonth()+1
    // yesterMonth = 202306  //test

    if (yesterMonth !== toMonth) monthChk = true

    try {
      resultMsg = await this.uploadResourceGroup(result.resourceGroupList, uuidResult);
      console.log(`success to upload resourceGroup(${queryResult.resourceType}).`);

      resultMsg = await this.uploadResourceGroupRelation(result.resourceGroupRelationList, uuidResult, monthChk);
      console.log(`success to upload resourceGroupRelation(${queryResult.resourceType}).`);

      return resultMsg;
    } catch (err) {
      console.log(`failed to upload resourceGroup(${queryResult.resourceType}. cause: ${err})`);
      return err;
    }
  }

  public async uploadResource(data: INcpResource[], uuidResult: any): Promise<string> {

    //* deleted_at이 null인 자원 = 현재 사용중인 자원.
    //현재 운영중인 자원을 종료된 자원으로 update 후, 자원목록 upsert시, null로 변경. -> 삭제된 자원은 deleted_at이 현재시간으로 변경 : 삭제된 시간.
    const delYnQuery=  `UPDATE TB_RESOURCE 
                           SET deleted_at = '`+ this.getCurrentTime() + `' 
                          WHERE deleted_at is null
                            AND customer_uuid='` + uuidResult.customerUuid + `'
                            AND account_uuid='` + uuidResult.accountUuid + `'`
    const query1 = `INSERT INTO TB_RESOURCE (
                        customer_uuid,
                        account_uuid,
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
                        deleted_at
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
                      event_time=VALUES(event_time),
                      updated_by=VALUES(created_by),
                      updated_at=VALUES(created_at),
                      deleted_at=NULL 
                      `;

    const query2 = [];

    for (let i = 0; i < data?.length; i++) {
      query2[i] = [
        uuidResult.customerUuid,
        uuidResult.accountUuid,
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
        this.getCurrentTime(),
        null, //deleted_at
      ];
    }
    const mysqlConnection = await mysql.createConnection({
      host: config.db.mariadb.host,
      user: config.db.mariadb.user,
      port: config.db.mariadb.port || 3306,
      password: config.db.mariadb.password,
      database: config.db.mariadb.ncpDbName,
      multipleStatements: true,
    });

    await mysqlConnection.query('START TRANSACTION');
    try {
      await mysqlConnection.query(delYnQuery);
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

  public async uploadResourceGroup(data: INcpResourceGroup[], uuidResult: any): Promise<string> {
    const delYnQuery=  `UPDATE TB_RESOURCE_GROUP 
                            SET deleted_at = '`+ this.getCurrentTime() + `' 
                            WHERE deleted_at is null
                              AND customer_uuid='` + uuidResult.customerUuid + `'
                              AND account_uuid='` + uuidResult.accountUuid + `'`
    const query1 = `INSERT INTO TB_RESOURCE_GROUP (
                        customer_uuid,
                        account_uuid,
                        group_id,
                        group_name,
                        group_desc,
                        create_time,
                        update_time,
                        created_by,
                        created_at,
                        deleted_at
                      ) VALUES ?
                      ON DUPLICATE KEY UPDATE
                        group_name=VALUES(group_name),
                        group_desc=VALUES(group_desc),
                        create_time=VALUES(create_time),
                        update_time=VALUES(update_time),
                        updated_by=VALUES(created_by),
                        updated_at=VALUES(created_at),
                        deleted_at=null
                      `;

    const query2 = [];

    for (let i = 0; i < data.length; i++) {
      query2[i] = [
        uuidResult.customerUuid,
        uuidResult.accountUuid,
        data[i].group_id,
        data[i].group_name,
        data[i].group_desc,
        data[i].create_time,
        data[i].update_time,
        'Aggregator',
        this.getCurrentTime(),
        null,
      ];
    }

    const mysqlConnection = await mysql.createConnection({
      host: config.db.mariadb.host,
      user: config.db.mariadb.user,
      port: config.db.mariadb.port || 3306,
      password: config.db.mariadb.password,
      database: config.db.mariadb.ncpDbName,
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
  public async uploadResourceGroupRelation(data: INcpResourceGroupRelation[], uuidResult: any, monthChk: boolean): Promise<string> {
    
    const delYnQuery=  `UPDATE TB_RESOURCE_GROUP_RELATION 
                            SET deleted_at = '`+ this.getCurrentTime() + `' 
                            WHERE deleted_at is null
                              AND customer_uuid='` + uuidResult.customerUuid + `'
                              AND account_uuid='` + uuidResult.accountUuid + `'`
    const histQuery = `INSERT INTO TB_RESOURCE_GROUP_RELATION_HIST (
                          use_month,
                          customer_uuid,
                          account_uuid,
                          group_id,
                          resource_id,
                          origin_created_by,
                          origin_created_at,
                          origin_updated_by,
                          origin_updated_at,
                          origin_deleted_at,
                          created_by,
                          created_at
                        ) 
                        SELECT 
                          DATE_FORMAT(created_at, '%Y%m'),
                          customer_uuid,
                          account_uuid,
                          group_id,
                          resource_id,
                          created_by,
                          created_at,
                          updated_by,
                          updated_at,
                          deleted_at,
                          'Aggregator',
                          '` + this.getCurrentTime() + `'`+
                          `FROM TB_RESOURCE_GROUP_RELATION
                          WHERE customer_uuid='` + uuidResult.customerUuid + `'
                            AND account_uuid='` + uuidResult.accountUuid + `'`
                        ;
                    
    const query1 = `INSERT INTO TB_RESOURCE_GROUP_RELATION (
                        customer_uuid,
                        account_uuid,
                        group_id,
                        resource_id,
                        created_by,
                        created_at,
                        deleted_at
                      ) VALUES ?
                      ON DUPLICATE KEY UPDATE
                        resource_id=VALUES(resource_id),
                        updated_by=VALUES(created_by),
                        updated_at=VALUES(created_at),
                        deleted_at=null
                      `;

    const query2 = [];

    for (let i = 0; i < data?.length; i++) {
      query2[i] = [uuidResult.customerUuid, uuidResult.accountUuid, data[i].group_id, data[i].resource_id, 'Aggregator', this.getCurrentTime(), null];
    }

    const mysqlConnection = await mysql.createConnection({
      host: config.db.mariadb.host,
      user: config.db.mariadb.user,
      port: config.db.mariadb.port || 3306,
      password: config.db.mariadb.password,
      database: config.db.mariadb.ncpDbName,
      multipleStatements: true,
    });

    await mysqlConnection.query('START TRANSACTION');
    try {

      //'월'이 바뀌었다면, relation 이력 등록.
      if (monthChk) {
        console.log('ncp ResourceManager Relation change Month')
        await mysqlConnection.query(histQuery);
      } 
      await mysqlConnection.query(delYnQuery);
      
      await mysqlConnection.query('COMMIT');
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

export default NcpResourceService;
