import formatter_resource from '@common/utils/formatter';

export default async function getNasVolumeQuery(result, clusterUuid) {
  const query = {};
  let mergedQuery = {};

  const nasVolumeInstanceList = result[0].outputs.getNasVolumeInstanceListResponse.nasVolumeInstanceList;
  const nasSnapshotList = result[1];
  const resourceType = 'NAS';

  for (let i = 0; i < nasVolumeInstanceList.length; i++) {
    const specList = nasVolumeInstanceList[i];

    //snapshot 정보가 있다면, spec 컬럼에 value 추가
    if (nasSnapshotList[i].outputs.getNasVolumeSnapshotListResponse.nasVolumeSnapshotList.length > 0) {
      specList.nasSnapshotList = nasSnapshotList[i].outputs.getNasVolumeSnapshotListResponse.nasVolumeSnapshotList;
    }

    query['resource_Type'] = resourceType;
    query['resource_Spec'] = specList;
    query['resource_Group_Uuid'] = clusterUuid;
    query['resource_Name'] = nasVolumeInstanceList[i].volumeName;
    query['resource_Description'] = nasVolumeInstanceList[i].nasVolumeDescription;
    // query['resource_Instance'] =
    query['resource_Target_Uuid'] = nasVolumeInstanceList[i].nasVolumeInstanceNo;
    query['resource_Target_Created_At'] = nasVolumeInstanceList[i].createDate;
    // query['resource_Namespace'] =
    // query['parent_Resource_Id'] =
    query['resource_Status'] = query['resource_Level1'] = 'NCP';
    query['resource_Level2'] = 'RG';
    query['resource_Level3'] = 'VPC';
    query['resource_Level4'] = 'SBN';
    query['resource_Level5'] = resourceType;
    query['resource_Level_Type'] = 'NX';
    query['resource_Rbac'] = false;
    query['resource_Anomaly_Monitor'] = false;
    query['resource_Active'] = true;
    query['resource_Status_Updated_At'] = new Date();

    const tempQuery = formatter_resource(i, nasVolumeInstanceList.length, resourceType, clusterUuid, query, mergedQuery);
    mergedQuery = tempQuery;
  }

  return { message: mergedQuery, resourceType: resourceType };
}
