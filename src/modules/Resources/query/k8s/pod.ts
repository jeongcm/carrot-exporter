import formatter_resource from "@common/utils/formatter";

export default async function getPodListQuery(result, clusterUuid) {
  let query = {};
  let mergedQuery = {};
  let tempQuery = {};

  let resourceType = "PD";
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
    query['resource_Instance'] = result.items[i].status.podIP;
    query['resource_Pod_Phase'] = result.items[i].status.phase;
    query['resource_Pod_Container'] = result.items[i].spec.containers; //array
    query['resource_Pod_Volume'] = result.items[i].spec.volumes; //array
    query['resource_Status'] = result.items[i].status; //object
    query['resource_Level1'] = "K8"; //k8s
    query['resource_Level2'] = "ND"; //Node
    query['resource_Level3'] = resourceType; //Pod
    query['resource_Level4'] = resourceType; //for MetricOps
    query['resource_Level_Type'] = "KN";  //K8s-Nodes-Pods
    query['resource_Rbac'] = false;
    query['resource_Anomaly_Monitor'] = true;
    query['resource_Active'] = true;
    query['resource_Status_Updated_At'] = new Date();
    query['resource_App'] = result.items[i].metadata.labels?.["app.kubernetes.io/name"] || result.items[i].metadata.labels?.app || result.items[i].metadata.labels?.["k8s-app"] || result.items[i].metadata.labels?.name || ''; //array
    //console.log('app---------',query['resource_App'] + query['resource_Name'] );

    tempQuery = formatter_resource(i, resultLength, resourceType, clusterUuid, query, mergedQuery);
    mergedQuery = tempQuery;
  }

  return { message: mergedQuery, resourceType: resourceType }
}
