export default async function getResourceGroupQuery(result, clusterUuid) {
  const query = {};

  const resourceType = 'RSG';
  const resultLength = result.items?.length;

  let tempQuery = '[';
  for (let i = 0; i < resultLength; i++) {
    query['group_id'] = result.items[i].groupId;
    query['group_name'] = result.items[i].groupName;
    query['group_desc'] = result.items[i].groupDesc;
    query['create_time'] = result.items[i].createTime;
    query['update_time'] = result.items[i].updateTime;

    tempQuery += JSON.stringify(query);

    if (resultLength > i + 1) {
      tempQuery += ',';
    }
  }
  tempQuery += ']';
  console.log('tempQuery :: ' + tempQuery);
  return { message: tempQuery, resourceType: resourceType };
}
