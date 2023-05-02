import getRegionListQuery from "@modules/Resources/query/ncp/region/region";
import getNetworkInterfaceListQuery from "@modules/Resources/query/ncp/networkInterface/networkInterface";
import getServerInstanceListQuery from "@modules/Resources/query/ncp/serverInstance/serverInstance";
import getInitScriptListQuery from "@modules/Resources/query/ncp/initScript/initScript";
import getPlacementGroupListQuery from "@modules/Resources/query/ncp/placementGroup/placementGroup";
import getServerImageProductListQuery from "@modules/Resources/query/ncp/serverImage/serverImage";
import getBlockStorageInstanceListQuery from "@modules/Resources/query/ncp/blockStorageInstance/blockStorageInstance";
import getPublicIpInstanceListQuery from "@modules/Resources/query/ncp/publicIpInstance/publicIpInstance";
import getAccessControlGroupListQuery from "@modules/Resources/query/ncp/accessControlGroup/accessControlGroup";
import getBlockStorageSnapshotInstanceListQuery
  from "@modules/Resources/query/ncp/blockStorageSnapshotInstance/blockStorageSnapshotInstance";

class QueryService {

  public async getResourceQuery(totalMsg, clusterUuid) {
    let queryResult = {};
    let result = totalMsg.result
    switch (totalMsg.template_uuid) {

      // ncp
      case "70000000000000000000000000000001":
        queryResult = await getRegionListQuery(result, clusterUuid)
        break;
      case "70000000000000000000000000000003":
        queryResult = await getNetworkInterfaceListQuery(result, clusterUuid)
        break;
      case "70000000000000000000000000000004":
        queryResult = await getServerInstanceListQuery(result, clusterUuid)
        break;
      case "70000000000000000000000000000009":
        queryResult = await getAccessControlGroupListQuery(result, clusterUuid)
        break;
      case "70000000000000000000000000000012":
        queryResult = await getPublicIpInstanceListQuery(result, clusterUuid)
        break;
      case "70000000000000000000000000000006":
        queryResult = await getBlockStorageInstanceListQuery(result, clusterUuid)
        break;
      case "70000000000000000000000000000014":
        queryResult = await getBlockStorageSnapshotInstanceListQuery(result, clusterUuid);
        break;
      case "70000000000000000000000000000005":
        queryResult = await getServerImageProductListQuery(result, clusterUuid)
        break;
      case "placementGroup":
        queryResult = await getPlacementGroupListQuery(result, clusterUuid)
        break;
      case "initScript":
        queryResult = await getInitScriptListQuery(result, clusterUuid)
        break;
    }

    return queryResult;
  }
}

export default QueryService;
