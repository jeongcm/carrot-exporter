import formatter_resource from "@common/utils/formatter";

export default async function getServiceListQuery(result, clusterUuid) {
  let query = {};
  let mergedQuery = {};
  let tempQuery = {};

  let resourceType = "SV";
  let resultPortsLength;
  let resultPort = 0
  let resultLength = result.items.length;

  for (let i=0; i<resultLength; i++)
  {
    tempQuery = {};
    // get port number from port array and assign to resultPort letiable.
    resultPortsLength = result.items[i].spec.ports.length
    for (let j=0; j<resultPortsLength; j++)
    {
      if (result.items[i].spec.ports[j].key === 'port')
      {
        resultPort = result.items[i].spec.ports[j].port;
      }
    }
    query['resource_Type'] = resourceType;
    query['resource_Spec'] = result.items[i].spec;
    query['resource_Group_Uuid'] = clusterUuid;
    query['resource_Name'] = result.items[i].metadata.name;
    query['resource_Target_Uuid'] = result.items[i].metadata.uid;
    query['resource_Target_Created_At'] = result.items[i].metadata.creationTimestamp;
    query['resource_Labels'] = result.items[i].metadata.labels; //object
    query['resource_Annotations'] = result.items[i].metadata.annotations; //object
    query['resource_Owner_References'] = result.items[i].metadata.ownerReferences; //object
    query['resource_Namespace'] = result.items[i].metadata.namespace;
    query['resource_Instance'] = result.items[i].spec.clusterIP + ":" + resultPort;
    query['resource_Status'] = result.items[i].status; //object
    query['resource_Level1'] = "K8";
    query['resource_Level2'] = "NS";
    query['resource_Level3'] = resourceType;
    query['resource_Level4'] = resourceType;
    query['resource_Level_Type'] = "KS";
    query['resource_Rbac'] = true;
    query['resource_Anomaly_Monitor'] = true;
    query['resource_Active'] = true;
    query['resource_Status_Updated_At'] = new Date();

    tempQuery = formatter_resource(i, resultLength, resourceType, clusterUuid, query, mergedQuery);
    mergedQuery = tempQuery;
  }

  return { message: mergedQuery, resourceType: resourceType }
}
