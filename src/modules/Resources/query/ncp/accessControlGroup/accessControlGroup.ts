import formatter_resource from "@common/utils/formatter";

export default async function getAccessControlGroupListQuery(result, clusterUuid) {
    let query = {};
    let mergedQuery = {};
    let tempQuery = {};

    let resourceType = "ACG";

    const acgList = result[0].outputs?.getAccessControlGroupListResponse.accessControlGroupList || 0
    const acgRuleList = result[1]

    for (let i = 0; i < acgList.length; i ++) {
        const specList = acgList[i]
        //rule 정보가 있다면, spec 컬럼에 value 추가
        if (acgRuleList[i].outputs.getAccessControlGroupRuleListResponse.accessControlGroupRuleList.length > 0) {
            specList.accssControlGroupRuleList = acgRuleList[i].outputs.getAccessControlGroupRuleListResponse.accessControlGroupRuleList;
        }
        query['resource_Type'] = resourceType;
        query['resource_Spec'] = specList;
        query['resource_Group_Uuid'] = clusterUuid;
        query['resource_Name'] = acgList[i]?.accessControlGroupName;
        query['resource_Description'] = "";
        // query['resource_Instance'] =
        query['resource_Target_Uuid'] = acgList[i]?.accessControlGroupNo;
        query['resource_Target_Created_At'] = new Date();
        // query['resource_Namespace'] =
        // query['parent_Resource_Id'] =
        query['resource_Status'] = acgList[i]?.accessControlGroupStatus;
        query['resource_Level1'] = "NCP";
        query['resource_Level2'] = "RG";
        query['resource_Level3'] = "VPC";
        query['resource_Level4'] = "SBN";
        query['resource_Level5'] = resourceType;
        query['resource_Level_Type'] = "NX";
        query['resource_Rbac'] = false;
        query['resource_Anomaly_Monitor'] = false;
        query['resource_Active'] = true;
        query['resource_Status_Updated_At'] = new Date();

        tempQuery = formatter_resource(i, acgList.length, resourceType, clusterUuid, query, mergedQuery);
        mergedQuery = tempQuery;
    }

    return { message: mergedQuery, resourceType: resourceType }
}
