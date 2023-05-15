import formatter_resource from "@common/utils/formatter";

export default async function getCloudDBMysqlInstanceListQuery(result, clusterUuid) {
  let query = {};
  let mergedQuery = {};
  let tempQuery = {};

  let resourceType = "DBMYQL";
  let resultLength = result.length

  for (let i = 0; i < resultLength; i ++) {
    let instanceLength = result[i][0].outputs.getCloudMysqlInstanceDetailResponse.cloudMysqlInstanceList.length
    for (let j = 0; j < instanceLength; j++) {
      query['resource_Type'] = resourceType;
      query['resource_Spec'] = result[i][0].outputs.getCloudMysqlInstanceDetailResponse.cloudMysqlInstanceList[j];
      // getCloudMysqlInstanceDetailResponse with backup detail list
      query['resource_Spec']['backupDetailList'] = result[i][1].outputs.getCloudMysqlBackupDetailListResponse.cloudMysqlBackupDetailList
      query['resource_Group_Uuid'] = clusterUuid;
      query['resource_Name'] = result[i][0].outputs.getCloudMysqlInstanceDetailResponse.cloudMysqlInstanceList[j].cloudMysqlServiceName;
      query['resource_Description'] = "";
      // query['resource_Instance'] =
      query['resource_Target_Uuid'] = result[i][0].outputs.getCloudMysqlInstanceDetailResponse.cloudMysqlInstanceList[j].cloudMysqlInstanceNo; // new generate target uuid
      query['resource_Target_Created_At'] = result[i][0].outputs.getCloudMysqlInstanceDetailResponse.cloudMysqlInstanceList[j].createDate;
      // query['resource_Namespace'] =
      // query['parent_Resource_Id'] =
      query['resource_Status'] = result[i][0].outputs.getCloudMysqlInstanceDetailResponse.cloudMysqlInstanceList[j].cloudMysqlInstanceStatus
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

  }

  return { message: mergedQuery, resourceType: resourceType }
}

