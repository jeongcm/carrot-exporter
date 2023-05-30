import getServerInstanceMetric from "@modules/Metric/query/ncp/server";
import getCloudMysqlInstanceMetric from "@modules/Metric/query/ncp/cloudMysql";
import getCloudMongoDBInstanceMetric from "@modules/Metric/query/ncp/cloudMongoDB";
import getCloudRedisInstanceMetric from "@modules/Metric/query/ncp/cloudRedis";
import getCloudPostgresqlInstanceMetric from "@modules/Metric/query/ncp/cloudPostgresql";
import { HttpException } from "@common/exceptions/HttpException";

class QueryService {
  public async getMetricQuery(totalMsg) {
    let queryResult = {};
    const credentialName = totalMsg.inputs.credential_key || totalMsg.inputs.ncp_key || null

    if (!credentialName) {
      throw new HttpException(400, 'invalid credential name');
    }
    const clusterUuid = credentialName.split('.')[1]
    if (clusterUuid === '') {
      throw new HttpException(400, `invalid cluster uuid from credential name(${credentialName})`);
    }

    switch (totalMsg.template_uuid) {
      case "NCM00000000000000000000000000001":
        queryResult = await getServerInstanceMetric(totalMsg, clusterUuid)
        break;
      case "NCM00000000000000000000000000002":
        queryResult = await getCloudMysqlInstanceMetric(totalMsg, clusterUuid)
        break;
      case "NCM00000000000000000000000000003":
        queryResult = await getCloudMongoDBInstanceMetric(totalMsg, clusterUuid)
        break;
      case "NCM00000000000000000000000000004":
        queryResult = await getCloudRedisInstanceMetric(totalMsg, clusterUuid)
        break;
      case "NCM00000000000000000000000000005":
        queryResult = await getCloudPostgresqlInstanceMetric(totalMsg, clusterUuid)
        break;
    }

    return queryResult;
  }
}

export default QueryService
