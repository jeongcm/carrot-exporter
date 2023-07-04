import formatter_resource from "@common/utils/formatter";

export default async function getBlockStorageInstanceListQuery(result, clusterUuid) {
    let query = {};
    let mergedQuery = {};
    let tempQuery = {};

    let resourceType = "BLS";
    let resultLength = result.getBlockStorageInstanceListResponse?.blockStorageInstanceList?.length || 0
    for (let i = 0; i < resultLength; i ++) {
        query['resource_Type'] = resourceType;
        query['resource_Spec'] = result.getBlockStorageInstanceListResponse?.blockStorageInstanceList[i];
        query['resource_Group_Uuid'] = clusterUuid;
        query['resource_Name'] = result.getBlockStorageInstanceListResponse?.blockStorageInstanceList[i]?.blockStorageName;
        query['resource_Description'] = result.getBlockStorageInstanceListResponse?.blockStorageInstanceList[i]?.blockStorageDescription;
        // query['resource_Instance'] =
        query['resource_Target_Uuid'] = result.getBlockStorageInstanceListResponse?.blockStorageInstanceList[i]?.blockStorageInstanceNo;
        query['resource_Target_Created_At'] = result.getBlockStorageInstanceListResponse?.blockStorageInstanceList[i]?.createDate;
        // query['resource_Namespace'] =
        // query['parent_Resource_Id'] =
        query['resource_Status'] = result.getBlockStorageInstanceListResponse?.blockStorageInstanceList[i]?.blockStorageInstanceStatus;
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
