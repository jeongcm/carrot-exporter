import formatter_resource from "@common/utils/formatter";

export default async function getServerImageProductListQuery(result, clusterUuid) {
    let query = {};
    let mergedQuery = {};
    let tempQuery = {};

    let resourceType = "SIMG";
    let resultLength = result.getMemberServerImageInstanceListResponse?.memberServerImageInstanceList?.length
    for (let i = 0; i < resultLength; i ++) {
        query['resource_Type'] = resourceType;
        query['resource_Spec'] = result.getMemberServerImageInstanceListResponse?.memberServerImageInstanceList[i];
        query['resource_Group_Uuid'] = clusterUuid;
        query['resource_Name'] = result.getMemberServerImageInstanceListResponse?.memberServerImageInstanceList[i]?.memberServerImageName;
        query['resource_Description'] = result.getMemberServerImageInstanceListResponse?.memberServerImageInstanceList[i]?.memberServerImageDescription;
        // query['resource_Instance'] =
        query['resource_Target_Uuid'] = result.getMemberServerImageInstanceListResponse?.memberServerImageInstanceList[i]?.memberServerImageInstanceNo;
        query['resource_Target_Created_At'] = new Date();
        // query['resource_Namespace'] =
        // query['parent_Resource_Id'] =
        query['resource_Status'] = result.getMemberServerImageInstanceListResponse?.memberServerImageInstanceList[i]?.memberServerImageInstanceStatus;
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

        tempQuery = formatter_resource(i, resultLength, resourceType, clusterUuid, query, mergedQuery);
        mergedQuery = tempQuery;
    }

    return { message: mergedQuery, resourceType: resourceType }
}
