import formatter_resource from "@common/utils/formatter";

export default async function getBlockStorageSnapshotInstanceListQuery(result, clusterUuid) {
    let query = {};
    let mergedQuery = {};
    let tempQuery = {};

    let resourceType = "SS";
    let resultLength = result.getBlockStorageSnapshotInstanceListResponse?.blockStorageSnapshotInstanceList?.length
    for (let i = 0; i < resultLength; i ++) {
        query['resource_Type'] = resourceType;
        query['resource_Spec'] = result.getBlockStorageSnapshotInstanceListResponse?.blockStorageSnapshotInstanceList[i];
        query['resource_Group_Uuid'] = clusterUuid;
        query['resource_Name'] = result.getBlockStorageSnapshotInstanceListResponse?.blockStorageSnapshotInstanceList[i]?.blockStorageSnapshotName;
        query['resource_Description'] = result.getBlockStorageSnapshotInstanceListResponse?.blockStorageSnapshotInstanceList[i]?.blockStorageSnapshotDescription;
        // query['resource_Instance'] =
        query['resource_Target_Uuid'] = result.getBlockStorageSnapshotInstanceListResponse?.blockStorageSnapshotInstanceList[i]?.blockStorageSnapshotInstanceNo;
        query['resource_Target_Created_At'] = result.getBlockStorageSnapshotInstanceListResponse?.blockStorageSnapshotInstanceList[i]?.createDate;
        // query['resource_Namespace'] =
        // query['parent_Resource_Id'] =
        query['resource_Status'] = result.getBlockStorageSnapshotInstanceListResponse?.blockStorageSnapshotInstanceList[i]?.blockStorageSnapshotInstanceStatus;
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
