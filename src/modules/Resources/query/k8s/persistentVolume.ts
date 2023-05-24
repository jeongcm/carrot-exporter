import formatter_resource from "@common/utils/formatter";

export default async function getPersistentVolumeListQuery(result, clusterUuid) {
  let query = {};
  let mergedQuery = {};
  let tempQuery = {};

  let resourceType = "PV";
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
    query['resource_Pv_Storage'] = result.items[i].spec.capacity.storage;
    query['resource_Pv_Claim_Ref'] = result.items[i].spec.claimRef; //object
    query['resource_Pv_Storage_Class_Name'] = result.items[i].spec.storageClassName;
    query['resource_Pv_Volume_Mode'] = result.items[i].spec.volumeMode;
    query['resource_Status'] = result.items[i].status; //object
    query['resource_Level1'] = "K8"; //k8s
    query['resource_Level2'] = resourceType;
    query['resource_Level4'] = resourceType; //for MetricOps
    query['resource_Level_Type'] = "KC";  //K8s-Cluster
    query['resource_Rbac'] = false;
    query['resource_Anomaly_Monitor'] = false;
    query['resource_Active'] = true;
    query['resource_Status_Updated_At'] = new Date();

    tempQuery = formatter_resource(i, resultLength, resourceType, clusterUuid, query, mergedQuery);
    mergedQuery = tempQuery;

  }

  return { message: mergedQuery, resourceType: resourceType }
}
