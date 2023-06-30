export default async function getResourceGroupQuery(result, clusterUuid) {
  const groupQuery = {};
  const relationQuery = {};
  const resourceType = 'RSG';

  /*
    ResourceGroupRelation
    step1: ncp group list.
    step2: group list loop
    step3: resource relation list.
  */

  //step1. 리소스 그룹 목록
  const stepOneGroupList = result[0].outputs.items;
  let stepTwoGroupRelationList;

  let resourceGroupList = '';
  let resourceGroupRelationList = '';

  for (let i = 0; i < stepOneGroupList.length; i++) {
    groupQuery['group_id'] = stepOneGroupList[i].groupId;
    groupQuery['group_name'] = stepOneGroupList[i].groupName;
    groupQuery['group_desc'] = stepOneGroupList[i].groupDesc;
    groupQuery['create_time'] = stepOneGroupList[i].createTime;
    groupQuery['update_time'] = stepOneGroupList[i].updateTime;

    resourceGroupList += JSON.stringify(groupQuery);

    if (stepOneGroupList.length > i + 1) {
      resourceGroupList += ',';
    }
  }

  for (let i = 0; i < result[1].length; i++) {
    stepTwoGroupRelationList = result[1][i].outputs.items;
    if ('{}' !== stepTwoGroupRelationList) {
      for (let y = 0; y < stepTwoGroupRelationList.length; y++) {
        relationQuery['group_id'] = result[1][i].inputs.req_body.groupId; //groupId는 param이 아니지만, input으로 main -> detail 전달
        relationQuery['resource_id'] = stepTwoGroupRelationList[y].resourceId;

        resourceGroupRelationList += JSON.stringify(relationQuery);
        resourceGroupRelationList += ',';
      }
    }
  }
  resourceGroupRelationList = resourceGroupRelationList.substring(0, resourceGroupRelationList.length - 1);
  const tempQuery = '{ "resourceGroupList": [' + resourceGroupList + '],' + '"resourceGroupRelationList": [' + resourceGroupRelationList + ']}';

  // console.log('tempQuery :: ' + tempQuery);
  return { message: tempQuery, resourceType: resourceType, clusterUuid: clusterUuid };
}
