import formatter_resource from "@common/utils/formatter";

export default async function getDaemonSetListQuery(result, clusterUuid) {
  let query = {};
  let mergedQuery = {};
  let tempQuery = {};

  let resourceType = "DS";
  let resultLength = result.items.length;

  for (let i = 0; i < resultLength; i++)
  {
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
    query['resource_Match_Labels'] = result.items[i].spec.selector.matchLabels; //object
    query['resource_Status'] = result.items[i].status; //object
    query['resource_Level1'] = "K8"; //k8s
    query['resource_Level2'] = "NS"; //Namespace
    query['resource_Level3'] = resourceType; //Deployment
    query['resource_Level4'] = "WL"; //Workload // MetricOps
    query['resource_Level_Type'] = "KS";  //K8s-Namespaces-Services
    query['resource_Rbac'] = false;
    query['resource_Anomaly_Monitor'] = false;
    query['resource_Active'] = true;
    query['resource_Status_Updated_At'] = new Date();

    tempQuery = formatter_resource(i, resultLength, resourceType, clusterUuid, query, mergedQuery);
    mergedQuery = tempQuery;
  }

  return { message: mergedQuery, resourceType: resourceType }
}
