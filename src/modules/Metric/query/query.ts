import getServerInstanceMetric from "@modules/Metric/query/ncp/server";

class QueryService {
  public async getMetricQuery(totalMsg) {
    let queryResult = {};
    switch (totalMsg.template_uuid) {
      case "NCM00000000000000000000000000001":
        queryResult = await getServerInstanceMetric(totalMsg)
        break;
    }

    return queryResult;
  }
}

export default QueryService
