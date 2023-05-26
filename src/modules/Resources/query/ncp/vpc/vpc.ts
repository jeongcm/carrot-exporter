import formatter_resource from '@common/utils/formatter';

export default async function getVpcListQuery(result, clusterUuid) {
  const query = {};
  let mergedQuery = {};
  let tempQuery = {};

  const resourceType = 'VPC';
  const resultLength = result.getVpcListResponse?.vpcList?.length;
  for (let i = 0; i < resultLength; i++) {
    query['resource_Type'] = resourceType;
    query['resource_Spec'] = result.getVpcListResponse?.vpcList[i];
    query['resource_Group_Uuid'] = clusterUuid;
    query['resource_Name'] = result.getVpcListResponse?.vpcList[i]?.vpcName;
    query['resource_Description'] = '';
    // query['resource_Instance'] =
    query['resource_Target_Uuid'] = result.getVpcListResponse?.vpcList[i]?.vpcNo;
    query['resource_Target_Created_At'] = new Date();
    // query['resource_Namespace'] =
    // query['parent_Resource_Id'] =
    query['resource_Status'] = result.getVpcListResponse?.vpcList[i]?.vpcStatus.code;
    query['resource_Level1'] = 'NCP';
    query['resource_Level2'] = 'RG';
    query['resource_Level3'] = 'VPC';
    query['resource_Level4'] = 'SBN';
    query['resource_Level5'] = resourceType;
    query['resource_Level_Type'] = 'NX';
    query['resource_Rbac'] = false;
    query['resource_Anomaly_Monitor'] = false;
    query['resource_Active'] = true;
    query['resource_Status_Updated_At'] = new Date();

    tempQuery = formatter_resource(i, resultLength, resourceType, clusterUuid, query, mergedQuery);
    mergedQuery = tempQuery;
  }

  return { message: mergedQuery, resourceType: resourceType };
}
