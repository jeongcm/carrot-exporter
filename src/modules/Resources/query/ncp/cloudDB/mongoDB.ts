import formatter_resource from "@common/utils/formatter";

class CloudDBMongoDBService {
  public async getCloudDBMongoDbInstanceListQuery(result, clusterUuid) {
    let query = {};
    let mergedQuery = {};
    let tempQuery = {};

    let resourceType = "DBMONGO";
    let resultLength = result.length

    for (let i = 0; i < resultLength; i ++) {
      let instanceLength = result[i][0]?.outputs?.getCloudMongoDbInstanceDetailResponse.cloudMongoDbInstanceList.length || 0
      for (let j = 0; j < instanceLength; j++) {
        query['resource_Type'] = resourceType;
        query['resource_Spec'] = result[i][0].outputs.getCloudMongoDbInstanceDetailResponse.cloudMongoDbInstanceList[j];
        // getCloudMongoDbInstanceDetailResponse with backup detail list
        query['resource_Spec']['backupDetailList'] = result[i][1].outputs.getCloudMongoDbBackupDetailListResponse.cloudMongoDbBackupDetailList
        query['resource_Group_Uuid'] = clusterUuid;
        query['resource_Name'] = result[i][0].outputs.getCloudMongoDbInstanceDetailResponse.cloudMongoDbInstanceList[j].cloudMongoDbServiceName;
        query['resource_Description'] = "";
        // query['resource_Instance'] =
        query['resource_Target_Uuid'] = result[i][0].outputs.getCloudMongoDbInstanceDetailResponse.cloudMongoDbInstanceList[j].cloudMongoDbInstanceNo; // new generate target uuid
        query['resource_Target_Created_At'] = result[i][0].outputs.getCloudMongoDbInstanceDetailResponse.cloudMongoDbInstanceList[j].createDate;
        // query['resource_Namespace'] =
        // query['parent_Resource_Id'] =
        query['resource_Status'] = result[i][0].outputs.getCloudMongoDbInstanceDetailResponse.cloudMongoDbInstanceList[j].cloudMongoDbInstanceStatus
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

        tempQuery = formatter_resource(j, instanceLength, resourceType, clusterUuid, query, mergedQuery);
        mergedQuery = tempQuery;
      }

    }

    return { message: mergedQuery, resourceType: resourceType }
  }

  public async getCloudDBMongoDbServerInstanceListQuery(result, clusterUuid) {
    let query = {};
    let mergedQuery = {};
    let tempQuery = {};

    let resourceType = "DBMONGOVM";
    let resultLength = result.length

    for (let i = 0; i < resultLength; i ++) {
      for (let j = 0; j < result[i][0]?.outputs?.getCloudMongoDbInstanceDetailResponse?.cloudMongoDbInstanceList?.length; j++) {
        let instanceLength = result[i][0]?.outputs?.getCloudMongoDbInstanceDetailResponse?.cloudMongoDbInstanceList[j]?.cloudMongoDbServerInstanceList?.length
        for (let k = 0; k < instanceLength; k++) {
          query['resource_Type'] = resourceType;
          query['resource_Spec'] = result[i][0].outputs.getCloudMongoDbInstanceDetailResponse.cloudMongoDbInstanceList[j].cloudMongoDbServerInstanceList[k];
          // getCloudMongoDbInstanceDetailResponse with backup detail list
          query['resource_Group_Uuid'] = clusterUuid;
          query['resource_Name'] = result[i][0].outputs.getCloudMongoDbInstanceDetailResponse.cloudMongoDbInstanceList[j].cloudMongoDbServerInstanceList[k].cloudMongoDbServerName
          query['resource_Description'] = "";
          // query['resource_Instance'] =
          query['resource_Target_Uuid'] = result[i][0].outputs.getCloudMongoDbInstanceDetailResponse.cloudMongoDbInstanceList[j].cloudMongoDbServerInstanceList[k].cloudMongoDbServerInstanceNo
            query['resource_Target_Created_At'] = result[i][0].outputs.getCloudMongoDbInstanceDetailResponse.cloudMongoDbInstanceList[j].cloudMongoDbServerInstanceList[k].createDate;
          // query['resource_Namespace'] =
          // query['parent_Resource_Id'] =
          query['resource_Status'] = result[i][0].outputs.getCloudMongoDbInstanceDetailResponse.cloudMongoDbInstanceList[j].cloudMongoDbServerInstanceList[k].cloudMongoDbServerInstanceStatus
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

          tempQuery = formatter_resource(k, instanceLength, resourceType, clusterUuid, query, mergedQuery);
          mergedQuery = tempQuery;
        }
      }

    }

    return { message: mergedQuery, resourceType: resourceType }
  }

}



export default CloudDBMongoDBService
