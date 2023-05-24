import formatter_resource from "@common/utils/formatter";

export default async function getEventListQuery(result, clusterUuid) {
  let query = {};
  let mergedQuery = {};
  let tempQuery = {};

  let resourceType = "EV";
  let resultLength = result.items.length;

  for (let i = 0; i < resultLength; i++)
  {
    query['resource_Type'] = resourceType ;
    query['resource_Spec'] = result.items[i].spec;
    query['resource_Group_Uuid'] = clusterUuid ;
    query['resource_Name'] = result.items[i].metadata.name ;
    query['resource_Namespace'] = result.items[i].metadata.namespace;
    query['resource_Target_Uuid'] = result.items[i].metadata.uid ;
    query['resource_Target_Created_At'] = result.items[i].metadata.creationTimestamp ;

    query['resource_event_involved_object_kind'] = result.items[i].involvedObject.kind;
    query['resource_event_involved_object_name'] = result.items[i].involvedObject.name;
    query['resource_event_involved_object_namespace'] = result.items[i].involvedObject.namespace;

    query['resource_event_reason'] = result.items[i].reason;
    query['resource_event_message'] = result.items[i].message;

    query['resource_event_source_component'] = result.items[i].source.component;
    query['resource_event_source_host'] = result.items[i].source.host;

    query['resource_event_first_timestamp'] = result.items[i].firstTimestamp;
    query['resource_event_last_timestamp'] = result.items[i].lastTimestamp;
    query['resource_event_count'] = result.items[i].count;
    query['resource_event_type'] = result.items[i].type;

    query['resource_Level1'] = "K8"; //k8s
    query['resource_Level2'] = "NS"; //Namespace
    query['resource_Level_Type'] = "KS";  //K8s-Namespaces-Services
    query['resource_Rbac'] = false;
    query['resource_Anomaly_Monitor'] = false;
    query['resource_Active'] = true;
    query['resource_Status_Updated_At'] = new Date();

    tempQuery = formatter_resource(i, resultLength, resourceType, clusterUuid, query, mergedQuery);
    mergedQuery = tempQuery;
  }

  return { message: mergedQuery, resourceType: resourceType }
}
