import formatter_resource from "@common/utils/formatter";

class CloudDBPostgresqlService {
  public async getCloudDBPostgresqlInstanceListQuery(result, clusterUuid) {
    let query = {};
    let mergedQuery = {};
    let tempQuery = {};

    let resourceType = "DBPGQL";
    let resultLength = result.length

    for (let i = 0; i < resultLength; i ++) {
      let instanceLength = result[i][0].outputs.getCloudPostgresqlInstanceDetailResponse.cloudPostgresqlInstanceList.length
      for (let j = 0; j < instanceLength; j++) {
        query['resource_Type'] = resourceType;
        query['resource_Spec'] = result[i][0].outputs.getCloudPostgresqlInstanceDetailResponse.cloudPostgresqlInstanceList[j];
        // getCloudPostgresqlInstanceDetailResponse with backup detail list
        query['resource_Spec']['backupDetailList'] = result[i][1].outputs.getCloudPostgresqlBackupDetailListResponse.cloudPostgresqlBackupDetailList
        query['resource_Group_Uuid'] = clusterUuid;
        query['resource_Name'] = result[i][0].outputs.getCloudPostgresqlInstanceDetailResponse.cloudPostgresqlInstanceList[j].cloudPostgresqlServiceName;
        query['resource_Description'] = "";
        // query['resource_Instance'] =
        query['resource_Target_Uuid'] = result[i][0].outputs.getCloudPostgresqlInstanceDetailResponse.cloudPostgresqlInstanceList[j].cloudPostgresqlInstanceNo; // new generate target uuid
        query['resource_Target_Created_At'] = result[i][0].outputs.getCloudPostgresqlInstanceDetailResponse.cloudPostgresqlInstanceList[j].createDate;
        // query['resource_Namespace'] =
        // query['parent_Resource_Id'] =
        query['resource_Status'] = result[i][0].outputs.getCloudPostgresqlInstanceDetailResponse.cloudPostgresqlInstanceList[j].cloudPostgresqlInstanceStatus
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

        tempQuery = formatter_resource(j, resultLength, resourceType, clusterUuid, query, mergedQuery);
        mergedQuery = tempQuery;
      }

    }
    return { message: mergedQuery, resourceType: resourceType }
  }

  public async getCloudDBPostgresqlServerInstanceListQuery(result, clusterUuid) {
    let query = {};
    let mergedQuery = {};
    let tempQuery = {};

    let resourceType = "DBPGQLVM";
    let resultLength = result.length

    for (let i = 0; i < resultLength; i ++) {
      for (let j = 0; j < result[i][0].outputs.getCloudPostgresqlInstanceDetailResponse.cloudPostgresqlInstanceList.length; j++) {
        let instanceLength = result[i][0].outputs.getCloudPostgresqlInstanceDetailResponse.cloudPostgresqlInstanceList[j].cloudPostgresqlServerInstanceList.length
        for (let k = 0; k < instanceLength; k++) {
          query['resource_Type'] = resourceType;
          query['resource_Spec'] = result[i][0].outputs.getCloudPostgresqlInstanceDetailResponse.cloudPostgresqlInstanceList[j].cloudPostgresqlServerInstanceList[k];
          // getCloudPostgresqlInstanceDetailResponse with backup detail list
          query['resource_Group_Uuid'] = clusterUuid;
          query['resource_Name'] = result[i][0].outputs.getCloudPostgresqlInstanceDetailResponse.cloudPostgresqlInstanceList[j].cloudPostgresqlServerInstanceList[k].cloudPostgresqlServerName
          query['resource_Description'] = "";
          // query['resource_Instance'] =
          query['resource_Target_Uuid'] = result[i][0].outputs.getCloudPostgresqlInstanceDetailResponse.cloudPostgresqlInstanceList[j].cloudPostgresqlServerInstanceList[k].cloudPostgresqlServerInstanceNo
            query['resource_Target_Created_At'] = result[i][0].outputs.getCloudPostgresqlInstanceDetailResponse.cloudPostgresqlInstanceList[j].cloudPostgresqlServerInstanceList[k].createDate;
          // query['resource_Namespace'] =
          // query['parent_Resource_Id'] =
          query['resource_Status'] = result[i][0].outputs.getCloudPostgresqlInstanceDetailResponse.cloudPostgresqlInstanceList[j].cloudPostgresqlServerInstanceList[k].cloudPostgresqlServerInstanceStatus
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

          tempQuery = formatter_resource(k, resultLength, resourceType, clusterUuid, query, mergedQuery);
          mergedQuery = tempQuery;
        }
      }

    }

    return { message: mergedQuery, resourceType: resourceType }
  }

}
export default CloudDBPostgresqlService

