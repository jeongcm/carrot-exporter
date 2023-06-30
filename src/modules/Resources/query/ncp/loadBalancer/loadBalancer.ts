export default async function getLoadBalancerQuery(result, clusterUuid) {
    let loadBalancerQuery = {}
    let lbListenerQuery = {}
    let lbRuleQuery = {}
    let tempQuery = ''

    const lbList = result[0].outputs.getLoadBalancerInstanceListResponse.loadBalancerInstanceList

    for (let i = 0; i < lbList.length; i ++) {

        loadBalancerQuery['resource_Type'] = "LB";
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
        loadBalancerQuery['resource_Level4'] = "LB";
        // query['resource_Level5'] = "";
        loadBalancerQuery['resource_Level_Type'] = "NX";
        loadBalancerQuery['resource_Rbac'] = false;
        loadBalancerQuery['resource_Anomaly_Monitor'] = false;
        loadBalancerQuery['resource_Active'] = true;
        loadBalancerQuery['resource_Status_Updated_At'] = new Date();

        tempQuery += JSON.stringify(loadBalancerQuery);
        tempQuery += ',';
    }

    //loadbalancer Listener , Rule 
    for (let i = 0; i < result[1].length; i++) {
        
        let ruleArray = []

        //짝수는 Listener, 홀수는 Rule 정보를 가져옴
        if (i % 2 === 0) {

            //짝수인 경우, Listener 정보 추가.
            let lbListenerList = result[1][i].outputs.getLoadBalancerListenerListResponse.loadBalancerListenerList

            for (let y = 0; y < lbListenerList.length; y ++) {
        
                lbListenerQuery['resource_Type'] = "LBLSTNR";
                lbListenerQuery['resource_Spec'] = lbListenerList[y];
                lbListenerQuery['resource_Group_Uuid'] = clusterUuid;
                lbListenerQuery['resource_Name'] = "LB_Listener_"+lbListenerList[y]?.loadBalancerListenerNo + "_"+y
                // loadBalancerQuery['resource_Description'] = lbListenerList[i]?.loadBalancerDescription;
                // query['resource_Instance'] =
                lbListenerQuery['resource_Target_Uuid'] = lbListenerList[y]?.loadBalancerListenerNo;
                lbListenerQuery['resource_Target_Created_At'] = new Date();
                // query['resource_Namespace'] =
                // query['parent_Resource_Id'] =
                // loadBalancerQuery['resource_Status'] = lbListenerList[i]?.loadBalancerInstanceStatusName;
                lbListenerQuery['resource_Level1'] = "NCP";
                lbListenerQuery['resource_Level2'] = "RG";
                lbListenerQuery['resource_Level3'] = "VPC";
                lbListenerQuery['resource_Level4'] = "LBLSTNR";
                // query['resource_Level5'] = "";
                lbListenerQuery['resource_Level_Type'] = "NX";
                lbListenerQuery['resource_Rbac'] = false;
                lbListenerQuery['resource_Anomaly_Monitor'] = false;
                lbListenerQuery['resource_Active'] = true;
                lbListenerQuery['resource_Status_Updated_At'] = new Date();

                tempQuery += JSON.stringify(lbListenerQuery);
                tempQuery += ',';
            }
        } else {
            //홀수인 경우, Rule 정보 추가.
            for (let y = 0; y < result[1][i].length; y++) {
                
                ruleArray[y] = result[1][i][y].outputs.getLoadBalancerRuleListResponse.loadBalancerRuleList

                for (let j = 0; j < ruleArray[y].length; j ++) {

                    let lbRuleList = ruleArray[y][j]

                    lbRuleQuery['resource_Type'] = "LBRL";
                    lbRuleQuery['resource_Spec'] = lbRuleList;
                    lbRuleQuery['resource_Group_Uuid'] = clusterUuid;
                    lbRuleQuery['resource_Name'] = "LB_Rule_"+lbRuleList?.loadBalancerRuleNo+"_"+j 
                    // loadBalancerQuery['resource_Description'] = lbList[i]?.loadBalancerDescription;
                    // query['resource_Instance'] =
                    lbRuleQuery['resource_Target_Uuid'] = lbRuleList?.loadBalancerRuleNo;
                    lbRuleQuery['resource_Target_Created_At'] = new Date();
                    // query['resource_Namespace'] =
                    // query['parent_Resource_Id'] =
                    // loadBalancerQuery['resource_Status'] = lbList[i]?.loadBalancerInstanceStatusName;
                    lbRuleQuery['resource_Level1'] = "NCP";
                    lbRuleQuery['resource_Level2'] = "RG";
                    lbRuleQuery['resource_Level3'] = "VPC";
                    lbRuleQuery['resource_Level4'] = "LBRL";
                    // query['resource_Level5'] = "";
                    lbRuleQuery['resource_Level_Type'] = "NX";
                    lbRuleQuery['resource_Rbac'] = false;
                    lbRuleQuery['resource_Anomaly_Monitor'] = false;
                    lbRuleQuery['resource_Active'] = true;
                    lbRuleQuery['resource_Status_Updated_At'] = new Date();
            
                    tempQuery += JSON.stringify(lbRuleQuery);
                    tempQuery += ',';
                }
            }
        } 
    }

    tempQuery = tempQuery.substring(0, tempQuery.length - 1);
    const mergeQuery =
    '{"resource_Type": "LB", "resource_Group_Uuid": "' + clusterUuid + '", ' + '"resource":[' + tempQuery + ']}';

    // console.log(">>>>>>>>>>>>>>>>>>>>>> \n" + mergeQuery)
    return { message: mergeQuery, resourceType: "LB" }
}
