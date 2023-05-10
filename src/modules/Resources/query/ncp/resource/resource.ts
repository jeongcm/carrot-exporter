export default async function getResourceQuery(result, clusterUuid) {
  const query = {};

  const resourceType = 'NCP_RESOURCE'; //TODO 리소스 타입 정의 후 수정
  const resultLength = result.items?.length;

  let tempQuery = '[';
  for (let i = 0; i < resultLength; i++) {
    query['nrn'] = result.items[i].nrn;
    query['platform_type'] = result.items[i].platformType;
    query['product_name'] = result.items[i].productName;
    query['product_display_name'] = result.items[i].productDisplayName;
    query['region_code'] = result.items[i].regionCode;
    query['region_display_name'] = result.items[i].regionDisplayName;
    query['resource_type'] = result.items[i].resourceType;
    query['resource_name'] = result.items[i].resourceName;
    query['create_time'] = result.items[i].createTime;
    query['event_time'] = result.items[i].eventTime;
    query['resource_id'] = result.items[i].resourceId;

    tempQuery += JSON.stringify(query);

    if (resultLength > i + 1) {
      tempQuery += ',';
    }
  }
  tempQuery += ']';

  //console.log('tempQuery :: \n' + tempQuery);
  return { message: tempQuery, resourceType: resourceType };
}
