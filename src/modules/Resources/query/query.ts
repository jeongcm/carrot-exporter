import getRegionListQuery from "@modules/Resources/query/ncp/region/region";

class QueryService {

  public async getResourceQuery(totalMsg, clusterUuid) {
    let queryResult = {};
    let result = totalMsg.result
    switch (totalMsg.template_uuid) {
      case "70000000000000000000000000000001":
        queryResult = await getRegionListQuery(result, clusterUuid)
        break;
    }

    return queryResult;
  }
}




export default QueryService;
