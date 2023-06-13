import formatter_resource from '@common/utils/formatter';

export default async function getZoneListQuery(result, clusterUuid) {
  const query = {};
  let mergedQuery = {};
  let tempQuery = {};

  const resourceType = 'ZN';
  const resultLength = result.getZoneListResponse?.zoneList?.length;
  for (let i = 0; i < resultLength; i++) {
    query['resource_Type'] = resourceType;
    query['resource_Spec'] = result.getZoneListResponse?.zoneList[i];
    query['resource_Group_Uuid'] = clusterUuid;
    query['resource_Name'] = result.getZoneListResponse?.zoneList[i]?.zoneName;
    query['resource_Description'] = result.getZoneListResponse?.zoneList[i]?.zoneDescription;
    // query['resource_Instance'] =
    query['resource_Target_Uuid'] = result.getZoneListResponse?.zoneList[i]?.zoneCode; // new generate target uuid
    query['resource_Target_Created_At'] = new Date();
    // query['resource_Namespace'] =
    // query['parent_Resource_Id'] =
    // query['resource_Status'] =
    query['resource_Level1'] = 'NCP';
    query['resource_Level2'] = 'RG';
    // query['resource_Level3'] = "";
    query['resource_Level_Type'] = 'NX';
    query['resource_Rbac'] = false;
    query['resource_Anomaly_Monitor'] = false;
    query['resource_Active'] = true;
    query['resource_Status_Updated_At'] = new Date();

    tempQuery = formatter_resource(i, resultLength, resourceType, clusterUuid, query, mergedQuery);
    mergedQuery = tempQuery;
  }

  console.log('tempQuery :: \n ' + tempQuery);

  return { message: mergedQuery, resourceType: resourceType };
}
