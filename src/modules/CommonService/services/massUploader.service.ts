import config from '@config/index';
import { IResponseMassUploader, IRequestMassUploader } from '@/common/interfaces/massUploader.interface';
import resourceService from '@/modules/Resources/services/resource.service';
import resourceGroupService from '@/modules/Resources/services/resourceGroup.service';
import tableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdBulkDto } from '@/modules/CommonService/dtos/tableId.dto';
import { IResourceGroup } from '@/common/interfaces/resourceGroup.interface';
import { IResourceTargetUuid } from '@/common/interfaces/resource.interface';
//import { condition } from 'sequelize';
import Connection from 'mysql2/typings/mysql/lib/Connection';
import DB from '@/database';
//import { ConnectionAcquireTimeoutError } from 'sequelize/types';


class massUploaderService {
  public tableIdService = new tableIdService();
  public resourceGroupService = new resourceGroupService(); 
  public resourceService = new resourceService(); 

  public async massUploadResource(resourceMassFeed: IRequestMassUploader): Promise<string> {
    const uuid = require('uuid');
    const apiId = uuid.v1();

    const targetTable = 'Resource';
    const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const sizeOfInput = resourceMassFeed.resource.length;
    // process bulk id for Resource table
    /*
    const responseTableIdData: IResponseIssueTableIdBulkDto = await this.tableIdService.issueTableIdBulk(targetTable, sizeOfInput);
    const resource_id_prefix = responseTableIdData.tableIdFinalIssued.substring(0, 8);
    var resource_id_postfix_number = Number(responseTableIdData.tableIdFinalIssued.substring(8, 16)) - responseTableIdData.tableIdRange;
    var resource_id_postfix = '';
    const tableIdSequenceDigit = responseTableIdData.tableIdSequenceDigit;
    */
    // search for customerAccount & resourceGroup key
    const resourceGroupUuid = resourceMassFeed.resource_Group_Uuid;
    const responseResourceGroup: IResourceGroup = await this.resourceGroupService.getResourceGroupByUuid(resourceGroupUuid); 
    const customerAccountKey = responseResourceGroup.customerAccountKey;
    const resourceGroupKey = responseResourceGroup.resourceGroupKey;
    const resourceType = resourceMassFeed.resource_Type; 
    
    // mass upload #1
    // update resource deactivated if there is no matched resoure in NC database. 
    const currentResourceFiltered: IResourceTargetUuid[] = await this.resourceService.getResourceForMass(resourceType, resourceGroupKey, customerAccountKey); 
    const sizeOfCurrentResource =  currentResourceFiltered.length;
    
    //const maxRetry = config.deadLock.retries; 
    //var retrycount = 0;

    var currentResource = new Array();
    for (let i = 0; i < sizeOfCurrentResource; i++) {
        currentResource[i] =  currentResourceFiltered[i].resourceTargetUuid;
    } 
    console.log("********in db********************")
    console.log(currentResource);
    var newResourceReceived = new Array();
    for (let i = 0; i < sizeOfInput; i++) {
        newResourceReceived [i]=  resourceMassFeed.resource[i].resource_Target_Uuid;
    } 
    console.log("********in msg********************")
    console.log(newResourceReceived);

    // filter only for the resource that is needed to be deleted softly. 
    const difference = currentResource.filter(o1 => !newResourceReceived.includes(o1));
    const lengthOfDifference = difference.length;
    console.log("********in difference********************")
    console.log(lengthOfDifference); 

    // mass upload #2
    // query below will cover "insert" of new resources or "update" of existing resources.    
    const query1 = `INSERT INTO Resource (resource_id, created_by, created_at, resource_target_uuid, resource_target_created_at,
                      resource_name, resource_namespace, resource_type, resource_labels, resource_annotations, resource_owner_references, resource_description, resource_status,
                      resource_spec, resource_level1, resource_level2, resource_level3, resource_level4, resource_level_type, resource_instance,
                      resource_pod_phase, resource_pod_container, resource_pod_volume, resource_replicas, resource_sts_volume_claim_templates,
                      resource_pvc_storage, resource_pvc_volume_name, resource_pvc_storage_class_name, resource_pvc_volume_mode, resource_endpoint,
                      resource_configmap_data, resource_ingress_class, resource_ingress_rules,
                      resource_pv_storage, resource_pv_claim_ref, resource_pv_storage_class_name, resource_pv_volume_mode,
                      resource_sc_provisioner, resource_sc_reclaim_policy, resource_sc_allow_volume_expansion, resource_sc_volume_binding_mode,
                      resource_rbac, resource_anomaly_monitor, resource_active, 
                      customer_account_key, resource_group_key ) VALUES ?
                      ON DUPLICATE KEY UPDATE 
                      resource_active=VALUES(resource_active),
                      resource_name=VALUES(resource_name),
                      resource_namespace=VALUES(resource_namespace),  
                      resource_type=VALUES(resource_type),
                      resource_labels=VALUES(resource_labels),
                      resource_annotations=VALUES(resource_annotations),
                      resource_owner_references=VALUES(resource_owner_references),
                      resource_description=VALUES(resource_description),
                      resource_status=VALUES(resource_status),
                      resource_spec=VALUES(resource_spec),                      
                      resource_level1=VALUES(resource_level1),                      
                      resource_level2=VALUES(resource_level2),                      
                      resource_level3=VALUES(resource_level3),                      
                      resource_level4=VALUES(resource_level4),                      
                      resource_level_type=VALUES(resource_level_type),
                      resource_instance=VALUES(resource_instance),
                      resource_pod_phase=VALUES(resource_pod_phase),
                      resource_pod_container=VALUES(resource_pod_container),
                      resource_pod_volume=VALUES(resource_pod_volume),
                      resource_replicas=VALUES(resource_replicas),
                      resource_sts_volume_claim_templates=VALUES(resource_sts_volume_claim_templates),
                      resource_pvc_storage=VALUES(resource_pvc_storage),
                      resource_pvc_volume_name=VALUES(resource_pvc_volume_name),
                      resource_pvc_storage_class_name=VALUES(resource_pvc_storage_class_name),
                      resource_pvc_volume_mode=VALUES(resource_pvc_volume_mode),
                      resource_endpoint=VALUES(resource_endpoint),
                      resource_configmap_data=VALUES(resource_configmap_data),
                      resource_ingress_class=VALUES(resource_ingress_class),
                      resource_ingress_rules=VALUES(resource_ingress_rules),
                      resource_pv_storage=VALUES(resource_pv_storage),
                      resource_pv_claim_ref=VALUES(resource_pv_claim_ref),
                      resource_pv_storage_class_name=VALUES(resource_pv_storage_class_name),
                      resource_pv_volume_mode=VALUES(resource_pv_volume_mode),
                      resource_sc_provisioner=VALUES(resource_sc_provisioner), 
                      resource_sc_reclaim_policy=VALUES(resource_sc_reclaim_policy), 
                      resource_sc_allow_volume_expansion=VALUES(resource_sc_allow_volume_expansion), 
                      resource_sc_volume_binding_mode=VALUES(resource_sc_volume_binding_mode),
                      resource_rbac=VALUES(resource_rbac),                      
                      resource_anomaly_monitor=VALUES(resource_anomaly_monitor),                      
                      resource_active=VALUES(resource_active),                      
                      customer_account_key=VALUES(customer_account_key),                      
                      resource_group_key=VALUES(resource_group_key),
                      resource_status_updated_at=VALUES(created_at),
                      updated_at=VALUES(created_at),
                      updated_by=VALUES(created_by)        
                      `;
    var query2 = new Array();
    for (let i = 0; i < sizeOfInput; i++) {
        // create resource_id 
        /*
        resource_id_postfix_number = resource_id_postfix_number + 1;
        resource_id_postfix = resource_id_postfix_number.toString();
        while (resource_id_postfix.length < tableIdSequenceDigit) {
            resource_id_postfix = '0' + resource_id_postfix;
        }
        */
        let uuid = require('uuid');
        let apiId = uuid.v1();
        let resource_Target_Created_At = new Date(resourceMassFeed.resource[i].resource_Target_Created_At);
        //let resource_id = resource_id_prefix + resource_id_postfix;
        let resource_id = apiId;
        let resource_lables = JSON.stringify(resourceMassFeed.resource[i].resource_Labels);
        let resource_annotations = JSON.stringify(resourceMassFeed.resource[i].resource_Annotations);
        let resource_owner_references = JSON.stringify(resourceMassFeed.resource[i].resource_Owner_References);
        let resource_status = JSON.stringify(resourceMassFeed.resource[i].resource_Status);
        let resource_pod_container = JSON.stringify(resourceMassFeed.resource[i].resource_Pod_Container);
        let resource_pod_volume = JSON.stringify(resourceMassFeed.resource[i].resource_Pod_Volume);
        let resource_sts_volume_claim_templates = JSON.stringify(resourceMassFeed.resource[i].resource_Sts_volume_Claim_Templates);
        let resource_pvc_storage = JSON.stringify(resourceMassFeed.resource[i].resource_Pvc_Storage); 
        let resource_endpoint = JSON.stringify(resourceMassFeed.resource[i].resource_Endpoint); 
        let resource_configmap_data = JSON.stringify(resourceMassFeed.resource[i].resource_Configmap_Data); 
        let resource_ingress_rules = JSON.stringify(resourceMassFeed.resource[i].resource_Ingress_Rules); 
        let resource_pv_claim_ref = JSON.stringify(resourceMassFeed.resource[i].resource_Pv_Claim_Ref); 
        let resource_spec = JSON.stringify(resourceMassFeed.resource[i].resource_Spec); 

        query2[i] = [
            //1st line
            resource_id, //resource_Id
            'SYSTEM', // created_By
            currentTime, //created_At
            resourceMassFeed.resource[i].resource_Target_Uuid, 
            resource_Target_Created_At,
            //2nd line
            resourceMassFeed.resource[i].resource_Name, 
            resourceMassFeed.resource[i].resource_Namespace,
            resourceMassFeed.resource[i].resource_Type, 
            resource_lables,
            resource_annotations,
            resource_owner_references,
            resourceMassFeed.resource[i].resource_Description || 'some description',
            resource_status,
            //3rd line
            resource_spec,
            resourceMassFeed.resource[i].resource_Level1,
            resourceMassFeed.resource[i].resource_Level2,
            resourceMassFeed.resource[i].resource_Level3,
            resourceMassFeed.resource[i].resource_Level4,
            resourceMassFeed.resource[i].resource_Level_Type,
            resourceMassFeed.resource[i].resource_Instance,
            //4th line resource_pod_phase, resource_pod_container, resource_pod_volume, resource_replicas, resource_sts_volume_claim_templates,
            resourceMassFeed.resource[i].resource_Pod_Phase,
            resource_pod_container,
            resource_pod_volume,
            resourceMassFeed.resource[i].resource_Replicas,
            resource_sts_volume_claim_templates,
            //5th line resource_pvc_storage, resource_pvc_volume_name, resource_pvc_storage_class_name, resource_pvc_volume_mode, resource_endpoint,
            resource_pvc_storage,
            resourceMassFeed.resource[i].resource_Pvc_Volumne_Name,
            resourceMassFeed.resource[i].resource_Pvc_Storage_Class_Name,
            resourceMassFeed.resource[i].resource_Pvc_Volume_Mode,
            resource_endpoint,
            //6th line resource_configmap_data, resource_ingress_class, resource_ingress_rules,
            resource_configmap_data,
            resourceMassFeed.resource[i].resource_Ingress_Class,
            resource_ingress_rules,
            //7th line resource_pv_storage, resource_pv_claim_ref, resource_pv_storage_class_name, resource_pv_volume_mode,
            resourceMassFeed.resource[i].resource_Pv_Storage,
            resource_pv_claim_ref,
            resourceMassFeed.resource[i].resoruce_Pv_Storage_Class_Name,
            resourceMassFeed.resource[i].resource_Pv_Volume_Mode,
            //8th line resource_sc_provisioner, resource_sc_reclaim_policy, resource_sc_allow_volume_expansion, resource_sc_volume_binding_mode, 
            resourceMassFeed.resource[i].resource_Sc_Provisioner, 
            resourceMassFeed.resource[i].resource_Sc_Reclaim_Policy, 
            resourceMassFeed.resource[i].resource_Sc_Allow_Volume_Expansion, 
            resourceMassFeed.resource[i].resource_Sc_Volume_Binding_Mode,
            //9th line resource_rbac, resource_anomaly_monitor, resource_active, 
            resourceMassFeed.resource[i].resource_Rbac,
            resourceMassFeed.resource[i].resource_Anomaly_Monitor,
            resourceMassFeed.resource[i].resource_Active,
            customerAccountKey, //customer_Account_Key
            resourceGroupKey //resource_Group_Kep 17 total columns
        ];
        //resource_Target_Created_At = null;
    }

    const mysql = require('mysql2/promise');
    const mysqlConnection = await mysql.createConnection({
        host: config.db.mariadb.host,
        user: config.db.mariadb.user,
        port: config.db.mariadb.port || 3306,
        password: config.db.mariadb.password,
        database: config.db.mariadb.dbName,
        multipleStatements: true,
    });
    
    await mysqlConnection.query('START TRANSACTION');
    try { 
        //create sql to delete the retired resources if exist.   
        if (lengthOfDifference > 0) {
            var query_delete = ""; 
            query_delete += "UPDATE Resource SET deleted_at = NOW(), updated_at = NOW(), updated_by = 'SYSTEM', resource_active = 0  WHERE resource_target_uuid IN (";
            for (let i = 0; i < lengthOfDifference; i++) {
                if (lengthOfDifference == 1) {
                    query_delete += "'" + difference[i] + "')"; 
                }
                else if (i==(lengthOfDifference-1)) {
                    query_delete += "'" + difference[i] + "')"; 
                }
                else {
                    query_delete += "'" + difference[i] + "',";
                }
            }
            await mysqlConnection.query(query_delete);
            await mysqlConnection.query('COMMIT');
        } // end of soft delete
        
        await mysqlConnection.query(query1, [query2])
        await mysqlConnection.query('COMMIT');
        
    } catch (err){
        console.error(`Error occurred while creating resource: ${err.message}`, err);
        await mysqlConnection.query('ROLLBACK');
        await mysqlConnection.end();
        console.info('Rollback successful');
        throw err `error on sql execution: ${resourceType}`;
    }
    await mysqlConnection.end();
    return "successful DB update ";
} // end of massUploadResource
  
}

export default massUploaderService;
