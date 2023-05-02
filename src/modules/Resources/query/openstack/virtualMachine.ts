import formatter_resource from "@common/utils/formatter";

export default async function getVirtualMachineListQuery(result, clusterUuid) {
  let query = {};
  let mergedQuery = {};
  let tempQuery = {};

  let resourceType = "VM";
  let resultLength = result.servers.length;

  for (let i = 0; i < resultLength; i++)
  {
    query['resource_Type'] = resourceType;
    query['resource_Spec'] = result.servers[i];
    query['resource_Group_Uuid'] = clusterUuid;
    query['resource_Name'] = result.servers[i].name;
    query['resource_Description'] = result.servers[i].description;
    query['resource_Instance'] = result.servers[i].addresses;
    query['resource_Target_Uuid'] = result.servers[i].id;
    query['resource_Target_Created_At'] = result.servers[i].created;
    query['resource_Namespace'] = result.servers[i].tenant_id;
    query['parent_Resource_Id'] = result.servers[i]["OS-EXT-SRV-ATTR:host"];  //Openstack-Cluster
    // query['resource_Status'] = result.servers[i].status;
    query['resource_Level1'] = "OS"; // Openstack
    query['resource_Level2'] = "PJ";
    query['resource_Level3'] = resourceType;
    query['resource_Level_Type'] = "OX";  //Openstack-Cluster
    query['resource_Rbac'] = false;
    query['resource_Anomaly_Monitor'] = false;
    query['resource_Active'] = true;
    query['resource_Status_Updated_At'] = new Date();

    tempQuery = formatter_resource(i, resultLength, resourceType, clusterUuid, query, mergedQuery);
    mergedQuery = tempQuery;
  }

  return { message: mergedQuery, resourceType: resourceType }
}
