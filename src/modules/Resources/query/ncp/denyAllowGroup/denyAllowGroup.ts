import formatter_resource from '@common/utils/formatter';

export default async function getDenyAllowGroupList(result, clusterUuid) {
  const query = {};
  let mergedQuery = {};
  let tempQuery = {};

  const resourceType = 'DNAG';
  const denyAllowGroupList = result[1][0].outputs.getNetworkAclDenyAllowGroupDetailResponse.networkAclDenyAllowGroupList;
  for (let i = 0; i < denyAllowGroupList.length; i++) {
    query['resource_Type'] = resourceType;
    query['resource_Spec'] = denyAllowGroupList[i];
    query['resource_Group_Uuid'] = clusterUuid;
    query['resource_Name'] = denyAllowGroupList[i]?.networkAclDenyAllowGroupName;
    query['resource_Description'] = denyAllowGroupList[i]?.networkAclDenyAllowGroupDescription;
    // query['resource_Instance'] =
    query['resource_Target_Uuid'] = denyAllowGroupList[i]?.networkAclDenyAllowGroupNo;
    query['resource_Target_Created_At'] = new Date();
    // query['resource_Namespace'] =
    // query['parent_Resource_Id'] =
    query['resource_Status'] = denyAllowGroupList[i]?.networkAclDenyAllowGroupStatus.code;
    query['resource_Level1'] = 'NCP';
    query['resource_Level2'] = 'RG';
    query['resource_Level3'] = "VPC";
    query['resource_Level4'] = "ACL";
    query['resource_Level5'] = resourceType
    query['resource_Level_Type'] = 'NX';
    query['resource_Rbac'] = false;
    query['resource_Anomaly_Monitor'] = false;
    query['resource_Active'] = true;
    query['resource_Status_Updated_At'] = new Date();

    tempQuery = formatter_resource(i, denyAllowGroupList.length, resourceType, clusterUuid, query, mergedQuery);
    mergedQuery = tempQuery;
  }

  // console.log('tempQuery :: \n ' + tempQuery);

  return { message: mergedQuery, resourceType: resourceType };
}
