import getRegionListQuery from "@modules/Resources/query/ncp/region/region";
import getNetworkInterfaceListQuery from "@modules/Resources/query/ncp/networkInterface/networkInterface";
import getServerInstanceListQuery from "@modules/Resources/query/ncp/serverInstance/serverInstance";

class QueryService {

  public async getResourceQuery(totalMsg, clusterUuid) {
    let queryResult = {};
    let result = totalMsg.result
    switch (totalMsg.template_uuid) {
      case "70000000000000000000000000000001":
        queryResult = await getRegionListQuery(result, clusterUuid)
        break;
      case "70000000000000000000000000000003":
        queryResult = await getNetworkInterfaceListQuery(result, clusterUuid)
        break;
      case "70000000000000000000000000000004":
        queryResult = await getServerInstanceListQuery(result, clusterUuid)
        break;
    }

    return queryResult;
  }
}

export default QueryService;
