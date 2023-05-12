import getServerInstanceMetric from "@modules/Metric/query/ncp/server";
import getCloudMysqlInstanceMetric from "@modules/Metric/query/ncp/cloudMysql";
import getCloudMongoDBInstanceMetric from "@modules/Metric/query/ncp/cloudMongoDB";
import getCloudRedisInstanceMetric from "@modules/Metric/query/ncp/cloudRedis";
import getCloudPostgresqlInstanceMetric from "@modules/Metric/query/ncp/cloudPostgresql";

class QueryService {
  public async getMetricQuery(totalMsg) {
    let queryResult = {};
    switch (totalMsg.template_uuid) {
      case "NCM00000000000000000000000000001":
        queryResult = await getServerInstanceMetric(totalMsg)
        break;
      case "NCM00000000000000000000000000002":
        queryResult = await getCloudMysqlInstanceMetric(totalMsg)
        break;
      case "NCM00000000000000000000000000003":
        queryResult = await getCloudMongoDBInstanceMetric(totalMsg)
        break;
      case "NCM00000000000000000000000000004":
        queryResult = await getCloudRedisInstanceMetric(totalMsg)
        break;
      case "NCM00000000000000000000000000005":
        queryResult = await getCloudPostgresqlInstanceMetric(totalMsg)
        break;
    }

    return queryResult;
  }
}

export default QueryService
