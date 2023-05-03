import getQueryDataMultipleForServerVPC from "@modules/Metric/query/ncp/server";

class QueryService {
  public async getMetricQuery(totalMsg) {
    let queryResult = {};
    switch (totalMsg.template_uuid) {
      case "queryMultipleDataForServer":
        queryResult = await getQueryDataMultipleForServerVPC(totalMsg)
        break;
    }

    return queryResult;
  }
}

export default QueryService
