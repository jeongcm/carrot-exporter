import formatter_resource from '@common/utils/formatter';

export default async function getNetworkAclListQuery(result, clusterUuid) {
  const query = {};
  let mergedQuery = {};
  let tempQuery = {};
  
  const networkAclList = result[0].outputs.getNetworkAclListResponse.networkAclList;
  const networkAClRuleList = result[1];

  const resourceType = 'ACL';
  for (let i = 0; i < networkAclList.length; i++) {

    const specList = networkAclList[i];

    //acl Rule 정보가 있다면, spec 컬럼에 value 추가
    if (networkAClRuleList[i].outputs.getNetworkAclRuleListResponse.networkAclRuleList.length > 0) {
      specList.networkAclRuleList = networkAClRuleList[i].outputs.getNetworkAclRuleListResponse.networkAclRuleList;
    }
    
    query['resource_Type'] = resourceType;
    query['resource_Spec'] = specList;
    query['resource_Group_Uuid'] = clusterUuid;
    query['resource_Name'] = networkAclList[i]?.networkAclName;
    query['resource_Description'] = networkAclList[i]?.networkAclDescription;
    // query['resource_Instance'] =
    query['resource_Target_Uuid'] = networkAclList[i]?.networkAclNo;
    query['resource_Target_Created_At'] = new Date();
    // query['resource_Namespace'] =
    // query['parent_Resource_Id'] =
    query['resource_Status'] = networkAclList[i]?.networkAclStatus.code;
    query['resource_Level1'] = 'NCP';
    query['resource_Level2'] = 'RG';
    query['resource_Level3'] = 'VPC';
    query['resource_Level4'] = resourceType;
    // query['resource_Level5'] = resourceType;
    // query['resource_Level_Type'] = 'NX';
    query['resource_Rbac'] = false;
    query['resource_Anomaly_Monitor'] = false;
    query['resource_Active'] = true;
    query['resource_Status_Updated_At'] = new Date();

    tempQuery = formatter_resource(i, networkAclList.length, resourceType, clusterUuid, query, mergedQuery);
    mergedQuery = tempQuery;
  }
  return { message: mergedQuery, resourceType: resourceType };
}
