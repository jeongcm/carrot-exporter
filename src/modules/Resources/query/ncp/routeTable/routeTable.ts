import formatter_resource from '@common/utils/formatter';

export default async function getRouteTableQuery(result, clusterUuid) {
  const query = {};
  let mergedQuery = {};

  const routeTableList = result[0].outputs.getRouteTableListResponse.routeTableList;
  const routeList = result[1];
  const routeTableSubnetList = result[2];
  const resourceType = 'RT';

  for (let i = 0; i < routeTableList.length; i++) {
    const specList = routeTableList[i];

    if (routeList[i].outputs.getRouteListResponse.routeList.length > 0) {
      specList.routeList = routeList[i].outputs.getRouteListResponse.routeList;
    }

    if (routeTableSubnetList[i].outputs.getRouteTableSubnetListResponse.subnetList.length > 0) {
      specList.routeTableSubnetList = routeTableSubnetList[i].outputs.getRouteTableSubnetListResponse.subnetList;
    }

    query['resource_Type'] = resourceType;
    query['resource_Spec'] = specList;
    query['resource_Group_Uuid'] = clusterUuid;
    query['resource_Name'] = routeTableList[i].routeTableName;
    query['resource_Description'] = routeTableList[i].routeTableDescription;
    // query['resource_Instance'] =
    query['resource_Target_Uuid'] = routeTableList[i].routeTableNo;
    query['resource_Target_Created_At'] = new Date();
    // query['resource_Namespace'] =
    // query['parent_Resource_Id'] =
    query['resource_Status'] = routeTableList[i].routeTableStatus.code;
    query['resource_Level1'] = 'NCP';
    query['resource_Level2'] = 'RG';
    query['resource_Level3'] = 'VPC';
    query['resource_Level4'] = resourceType;
    // query['resource_Level5'] = resourceType;
    query['resource_Level_Type'] = 'NX';
    query['resource_Rbac'] = false;
    query['resource_Anomaly_Monitor'] = false;
    query['resource_Active'] = true;
    query['resource_Status_Updated_At'] = new Date();

    const tempQuery = formatter_resource(i, routeTableList.length, resourceType, clusterUuid, query, mergedQuery);
    mergedQuery = tempQuery;
  }

  return { message: mergedQuery, resourceType: resourceType };
}
