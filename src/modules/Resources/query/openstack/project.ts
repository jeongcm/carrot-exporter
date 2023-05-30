import formatter_resource from "@common/utils/formatter";

export default async function getProjectListQuery(result, clusterUuid) {
  let query = {};
  let mergedQuery = {};
  let tempQuery = {};

  let resourceType = "PJ";
  let resultLength = result.projects.length;

  for (let i = 0; i < resultLength; i++)
  {
    query['resource_Type'] = resourceType;
    query['resource_Spec'] = result.projects[i];
    query['resource_Group_Uuid'] = clusterUuid;
    query['resource_Name'] = result.projects[i].name;
    query['resource_Description'] = result.projects[i].description;
    query['resource_Target_Uuid'] = result.projects[i].id;
    query['resource_Target_Created_At'] = null
    query['resource_Level1'] = "OS"; //Openstack
    query['resource_Level2'] = resourceType;
    query['resource_Level_Type'] = "OX";  //Openstack-Cluster
    query['resource_Rbac'] = false;
    query['resource_Anomaly_Monitor'] = false;
    query['resource_Active'] = true;
    if (result.projects[i].enabled) {
      query['resource_Status'] = "true";
    } else {
      query['resource_Status'] = "false";
    }
    query['resource_Status_Updated_At'] = new Date();

    tempQuery = formatter_resource(i, resultLength, resourceType, clusterUuid, query, mergedQuery);
    mergedQuery = tempQuery;
  }

  return { message: mergedQuery, resourceType: resourceType }
}
