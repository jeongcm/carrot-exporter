import formatter_resource from "@common/utils/formatter";

export default async function getLoadBalancerQuery(result, clusterUuid) {
    let loadBalancerQuery = {}
    let mergedQuery = {};
    let tempQuery = {};

    let resourceType = "LB";
    const lbList = result[0].outputs.getLoadBalancerInstanceListResponse.loadBalancerInstanceList
    
    let specArray = []
    let specList = {}
    let idx = 0
    
    //loadbalancer Listener , Rule 
    for (let i = 0; i < result[1].length; i++) {
        
        let ruleArray = []

        //짝수는 Listener, 홀수는 Rule 정보를 가져옴
        if (i % 2 === 0) {
            //짝수인 경우, Listener 정보 추가.
            specList['loadBalancerListenerList'] = result[1][i].outputs.getLoadBalancerListenerListResponse.loadBalancerListenerList
        } else {
            //홀수인 경우, Rule 정보 추가.
            for (let y = 0; y < result[1][i].length; y++) {
                ruleArray[y] = result[1][i][y].outputs.getLoadBalancerRuleListResponse.loadBalancerRuleList
            }
            specList['loadBalancerRuleList'] = ruleArray

            //Rule까지 들어갔을 경우, 배열에 복사
            specArray[idx] = JSON.parse(JSON.stringify(specList))
            idx++
        }
    }
    
    for (let i = 0; i < lbList.length; i ++) {

        lbList[i].loadBalancerListenerList = specArray[i].loadBalancerListenerList;
        lbList[i].loadBalancerRuleList = specArray[i].loadBalancerRuleList;

        loadBalancerQuery['resource_Type'] = resourceType;
        loadBalancerQuery['resource_Spec'] = lbList[i];
        loadBalancerQuery['resource_Group_Uuid'] = clusterUuid;
        loadBalancerQuery['resource_Name'] = lbList[i]?.loadBalancerName;
        loadBalancerQuery['resource_Description'] = lbList[i]?.loadBalancerDescription;
        // query['resource_Instance'] =
        loadBalancerQuery['resource_Target_Uuid'] = lbList[i]?.loadBalancerInstanceNo;
        loadBalancerQuery['resource_Target_Created_At'] = new Date();
        // query['resource_Namespace'] =
        // query['parent_Resource_Id'] =
        loadBalancerQuery['resource_Status'] = lbList[i]?.loadBalancerInstanceStatusName;
        loadBalancerQuery['resource_Level1'] = "NCP";
        loadBalancerQuery['resource_Level2'] = "RG";
        loadBalancerQuery['resource_Level3'] = "VPC";
        loadBalancerQuery['resource_Level4'] = resourceType;
        // query['resource_Level5'] = "";
        loadBalancerQuery['resource_Level_Type'] = "NX";
        loadBalancerQuery['resource_Rbac'] = false;
        loadBalancerQuery['resource_Anomaly_Monitor'] = false;
        loadBalancerQuery['resource_Active'] = true;
        loadBalancerQuery['resource_Status_Updated_At'] = new Date();

        tempQuery = formatter_resource(i, lbList.length, resourceType, clusterUuid, loadBalancerQuery, mergedQuery);
        mergedQuery = tempQuery;
    }

    return { message: mergedQuery, resourceType: resourceType }
}
