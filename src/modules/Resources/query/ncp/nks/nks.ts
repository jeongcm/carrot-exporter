export default async function getNksQuery(result, clusterUuid) {
  const query = {};

  let clusterQuery = '';
  let nodeQuery = '';
  /*
   result[0]: Cluster 
   result[1]: NodePool 
   result[2]: WorkerNode
  */
  const resourceType = 'NKS';
  const clusterList = result[0].outputs.clusters;
  const nodePoolList = result[1];
  const workerNodeList = result[2];

  for (let i = 0; i < clusterList.length; i++) {
    query['resource_Type'] = resourceType;
    query['resource_Spec'] = clusterList[i];
    query['resource_Group_Uuid'] = clusterUuid;
    query['resource_Name'] = clusterList[i].name;
    query['resource_Description'] = '';
    // query['resource_Instance'] =
    query['resource_Target_Uuid'] = clusterList[i].uuid;
    query['resource_Target_Created_At'] = clusterList[i].createdAt;
    // query['resource_Namespace'] =
    // query['parent_Resource_Id'] =
    query['resource_Status'] = clusterList[i].status;
    query['resource_Level1'] = 'NCP';
    query['resource_Level2'] = 'RG';
    query['resource_Level3'] = 'VPC';
    query['resource_Level4'] = 'SBN';
    query['resource_Level5'] = resourceType;
    query['resource_Level_Type'] = 'NX';
    query['resource_Rbac'] = false;
    query['resource_Anomaly_Monitor'] = false;
    query['resource_Active'] = true;
    query['resource_Status_Updated_At'] = clusterList[i].updatedAt;

    clusterQuery += JSON.stringify(query);
    clusterQuery += ',';
  }

  for (let i = 0; i < nodePoolList.length; i++) {
    for (let y = 0; y < nodePoolList[i].outputs.nodePool.length; y++) {
      const specList = nodePoolList[i].outputs.nodePool[y];

      if (workerNodeList[i].outputs.nodes.length > 0) {
        specList.workerNodeList = workerNodeList[i].outputs.nodes;
      }

      query['resource_Type'] = 'NKSNP';
      query['resource_Spec'] = specList;
      query['resource_Group_Uuid'] = clusterUuid;
      query['resource_Name'] = nodePoolList[i].outputs.nodePool[y].name;
      query['resource_Description'] = '';
      // query['resource_Instance'] =
      query['resource_Target_Uuid'] = nodePoolList[i].outputs.nodePool[y].instanceNo;
      query['resource_Target_Created_At'] = new Date();
      // query['resource_Namespace'] =
      // query['parent_Resource_Id'] =
      query['resource_Status'] = nodePoolList[i].outputs.nodePool[y].status;
      query['resource_Level1'] = 'NCP';
      query['resource_Level2'] = 'RG';
      query['resource_Level3'] = 'VPC';
      query['resource_Level4'] = 'SBN';
      query['resource_Level5'] = 'NKSNP';
      query['resource_Level_Type'] = 'NX';
      query['resource_Rbac'] = false;
      query['resource_Anomaly_Monitor'] = false;
      query['resource_Active'] = true;
      query['resource_Status_Updated_At'] = new Date();

      nodeQuery += JSON.stringify(query);
      nodeQuery += ',';
    }
  }

  //node 정보가 없다면
  if ('' === nodeQuery) {
    //cluster 정보가 있다면 clusterList 쉼표 제거.
    if ('' !== clusterQuery) {
      clusterQuery = clusterQuery.substring(0, nodeQuery.length - 1);
    }
    //node 정보 있다면 node 쉼표 제거
  } else {
    nodeQuery = nodeQuery.substring(0, nodeQuery.length - 1);
  }

  const mergeQuery =
    '{"resource_Type": "' + resourceType + '", "resource_Group_Uuid": "' + clusterUuid + '", ' + '"resource":[' + clusterQuery + nodeQuery + ']}';

  return { message: mergeQuery, resourceType: resourceType };
}
