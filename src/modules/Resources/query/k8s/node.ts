import formatter_resource from "@common/utils/formatter";
import config from "@/config";

export default async function getNodeListQuery(result, clusterUuid) {
  let query = {};
  let mergedQuery = {};
  let tempQuery = {};

  let resourceType = "ND";
  let resultLength = result.items.length;
  let nodeExporterPort = config.obsUrl.nodeExporterPort;
  for (let i=0; i<resultLength; i++)
  {
    // get internal IP address from addresses array and assign to InternalIP letiable.
    let internalIpLength = result.items[i].status.addresses.length
    let internalIp = "";
    for (let j=0; j<internalIpLength; j++)
    {
      if (result.items[i].status.addresses[j].type == 'InternalIP')
      {
        let ipHeader = (result.items[i].status.addresses[j].address).substr(0,3);
        if (ipHeader=="10." || ipHeader=="192" || ipHeader=="172" ) {
          internalIp = result.items[i].status.addresses[j].address;
          break;
        }
        //find internal IP address of node using the first part of ip address 10 or 192
      }
    }
    query['resource_Type'] = resourceType ;
    query['resource_Spec'] = result.items[i].spec;
    query['resource_Group_Uuid'] = clusterUuid ;
    query['resource_Name'] = result.items[i].metadata.name ;
    query['resource_Target_Uuid'] = result.items[i].metadata.uid ;
    query['resource_Target_Created_At'] = result.items[i].metadata.creationTimestamp ;
    query['resource_Labels'] = result.items[i].metadata.labels ; //object
    query['resource_Annotations'] = result.items[i].metadata.annotations ; //object
    query['resource_Owner_References'] = result.items[i].metadata.ownerReferences ; //object
    query['resource_Instance'] = internalIp + ":" + nodeExporterPort;
    query['resource_Status'] = result.items[i].status; //object
    query['resource_Level1'] = "K8";
    query['resource_Level2'] = resourceType;
    query['resource_Level4'] = resourceType;
    query['resource_Level_Type'] = "KN";
    query['resource_Rbac'] = false;
    query['resource_Anomaly_Monitor'] = false;
    query['resource_Active'] = true;
    query['resource_Status_Updated_At'] = new Date();

    tempQuery = formatter_resource(i, resultLength, resourceType, clusterUuid, query, mergedQuery);
    mergedQuery = tempQuery;
  }

  return { message: mergedQuery, resourceType: resourceType }
}
