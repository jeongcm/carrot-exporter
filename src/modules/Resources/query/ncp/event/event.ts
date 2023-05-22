import formatter_resource from "@common/utils/formatter";

class EventService {
  public async getSearchEventListQuery(result, clusterUuid) {
    let query = {};
    let mergedQuery = {};
    let tempQuery = {};

    let resourceType = "NCPEV"; // 안쓰임 query 만들때 사용만 하고 resourceEvent 에 upload 되진 않음
    let resultLength = result.events.length;

    for (let i = 0; i < resultLength; i++)
    {
      query['resource_Group_Uuid'] = clusterUuid;
      query['resource_Name'] = result.events[i].ruleName + '.' + result.events[i].eventId;
      query['resource_Description'] = result.events[i].describe; // resource Event Id
      query['resource_event_type'] = result.events[i].eventLevel;
      query['resource_Target_Uuid'] = this.getResourceEventTargetUuid(result.events[i].prodName, result.events[i].dimension);
      query['resource_Target_Created_At'] = result.events[i].startTime;
      query['resource_event_involved_object_kind'] = result.events[i].prodName;
      query['resource_event_involved_object_name'] = result.events[i].resourceName;
      query['resource_event_reason'] = result.events[i].metric + result.events[i].operatorSymbol + result.events[i].criteria + result.events[i].unit;
      query['resource_event_first_timestamp'] = result.events[i].startTime;
      query['resource_event_last_timestamp'] = result.events[i].endTime;

      query['resource_Spec'] = result.events[i]; // resource_event_content

      tempQuery = formatter_resource(i, resultLength, resourceType, clusterUuid, query, mergedQuery);
      mergedQuery = tempQuery;
    }

    return { message: mergedQuery, resourceType: resourceType }
  }

  private getResourceEventTargetUuid(prodName: any, dimension: any) {
    let targetUuid: any = ''
    switch (prodName) {
      case 'System/Cloud Search':
      case 'System/Server(VPC)':
      case 'System/Cloud DB for MySQL(VPC)':
      case 'System/Cloud DB for MSSQL(VPC)':
      case 'System/Cloud DB for Redis(VPC)':
      case 'System/Cloud DB for MongoDB(VPC)':
      case 'System/Cloud DB for PostgreSQL(VPC)':
      case 'System/Cloud Hadoop(VPC)':
      case 'System/Search Engine Service(VPC)':
      case 'System/Cloud Data Streaming Service(VPC)':
      case 'System/NAS(VPC)':
      case 'System/CLOVA NSML(VPC)':
      case 'System/Server':
      case 'System/NAS':
        targetUuid = dimension.instanceNo
        break;
      case 'System/Object Storage':
        targetUuid = dimension.resourceId
        break;
      case 'System/AiTEMS':
        targetUuid = dimension.serviceId
        break;
      case 'System/Load Balancer(VPC)':
        targetUuid = dimension.instanceId
        break;
      case 'System/Load Balancer Target Group(VPC)':
        targetUuid = dimension.targetGroupNo
        break;
      case 'System/Kubernetes Service':
        switch (dimension.type) {
          case 'CpuMem':
          case 'Network':
          case 'Disk':
            targetUuid = dimension.nodeInstanceNo
            break
          case 'NodeAvailability':
            targetUuid = dimension.clusterUUID
            break
        }
        break;
      case 'System/Auto Scaling(VPC)':
        targetUuid = dimension.autoScalingGroupNo
        break;
      case 'System/Kubernetes Service(VPC)':
        targetUuid = dimension.serverInstanceNo
        break;
      case 'System/Load Balancer':
        targetUuid = dimension.instanceId
        break;
    }

    return targetUuid
  }

}

export default EventService
