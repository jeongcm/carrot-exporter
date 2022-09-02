import DB from '@/database';
import config from '@config/index';
import { IResourceEvent } from '@/common/interfaces/resourceEvent.interface';
import { IResource } from '@/common/interfaces/resource.interface';
import { IRequestMassUploader } from '@/common/interfaces/massUploader.interface';
//import { ResourceEventDto } from '../dtos/resourceEvent.dto';
import { HttpException } from '@/common/exceptions/HttpException';
import { isEmpty } from '@/common/utils/util';
//import { ICustomerAccount } from '@/common/interfaces/customerAccount.interface';
import { IResourceGroup } from '@/common/interfaces/resourceGroup.interface';
import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';
import ResourceGroupService from '@/modules/Resources/services/resourceGroup.service';
import { Op } from 'sequelize';
import { ResourceEventModel } from '../models/resourceEvent.model';

class ResourceService {
    public resource = DB.Resource;
    public resourceEvent = DB.ResourceEvent;
    public customerAccountService = new CustomerAccountService();
    public resourceGroupService = new ResourceGroupService();

    public async createResourceEventMass(resourceEventData: IRequestMassUploader): Promise<string> {
        console.log (resourceEventData);
        const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const sizeOfInput = resourceEventData.resource.length;

        const resource_template = [
            {resourceName: "Service", resourceType: "SV", template_uuid:  "00000000000000000000000000000020"},  //service
            {resourceName: "Node", resourceType: "ND", template_uuid:  "00000000000000000000000000000010"},  // node
            {resourceName: "Namespace", resourceType: "NS", template_uuid:  "00000000000000000000000000000004"}, //namespace
            {resourceName: "Pod", resourceType: "PD", template_uuid:  "00000000000000000000000000000002"}, //pod
            {resourceName: "Deployment", resourceType: "DP", template_uuid:  "00000000000000000000000000001002"}, //deployment
            {resourceName: "StatefulSet", resourceType: "SS", template_uuid:  "00000000000000000000000000001004"}, //statefulset
            {resourceName: "Daemonset", resourceType: "DS", template_uuid:  "00000000000000000000000000001006"}, //daemonset
            {resourceName: "ReplicaSet", resourceType: "RS", template_uuid:  "00000000000000000000000000001008"}, //replicaset
            {resourceName: "PVC", resourceType: "PC", template_uuid:  "00000000000000000000000000000018"}, //pvc
            {resourceName: "Secret", resourceType: "SE", template_uuid:  "00000000000000000000000000000014"},  //secret
            {resourceName: "Endpoint", resourceType: "EP", template_uuid:  "00000000000000000000000000000016"}, //endpoint
            {resourceName: "Configmap", resourceType: "CM", template_uuid:  "00000000000000000000000000000006"}, //configmap
            {resourceName: "Ingress", resourceType: "IG", template_uuid:  "00000000000000000000000000002002"}, //ingress
            {resourceName: "PV", resourceType: "PV", template_uuid:  "00000000000000000000000000000012"},  //pv
            {resourceName: "Storage Class", resourceType: "SC", template_uuid:  "00000000000000000000000000003002"},  //storageclass
            {resourceName: "Event", resourceType: "EV", template_uuid:  "00000000000000000000000000000008"},  //storageclass
           //template_uuid: "00000000000000000000000000003002",
           //template_uuid: "00000000000000000000000000003002";
           ];
   
        //1. validate ResourceGroup
        const resourceGroupUuid = resourceEventData.resource_Group_Uuid;
        const resourceType = resourceEventData.resource_Type; 
        const responseResourceGroup: IResourceGroup = await this.resourceGroupService.getResourceGroupByUuid(resourceGroupUuid); 
        if (!responseResourceGroup) {
            throw new HttpException(400, 'resourceGroup not found');
          }
        const customerAccountKey = responseResourceGroup.customerAccountKey;
        const resourceGroupKey = responseResourceGroup.resourceGroupKey;

        //2. prepare for sql
        const query1 = `INSERT IGNORE INTO ResourceEvent (
            resource_event_id, 
            created_by, 
            created_at, 
            resource_event_name, 
            resource_event_namespace, 
            resource_event_description,
            resource_event_type,
            resource_event_target_created_at,
            resource_event_target_uuid,

            resource_event_involved_object_kind, 
            resource_event_involved_object_name,
            resource_event_involved_object_namespace,
            resource_event_reason,
            resource_event_message,
            resource_event_source_component,
            resource_event_source_host,
            resource_event_first_timestamp,
            resource_event_last_timestamp,
            resource_event_count,
            customer_account_key,
            resource_group_uuid,
            resource_key
            ) VALUES ?
            `;
    
        var query2 = new Array();
        for (let i = 0; i < sizeOfInput; i++) {
            let uuid = require('uuid');
            let resource_event_id = uuid.v1();
            let resource_event_first_timestamp = new Date(resourceEventData.resource[i].resource_event_first_timestamp);
            let resource_event_last_timestamp = new Date(resourceEventData.resource[i].resource_event_last_timestamp);   
            let resource_event_target_created_at = new Date(resourceEventData.resource[i].resource_Target_Created_At);
            
            let selectedTemplate = resource_template.find( template => {
                return template.resourceName === resourceEventData.resource[i].resource_event_involved_object_kind;
            });
            
            let resourceKey = null;
            if (selectedTemplate) {
                let resourceSearch:IResource = await this.resource.findOne(
                    {where: 
                        {resourceName: resourceEventData.resource[i].resource_event_involved_object_name,
                        resourceType: selectedTemplate.resourceType,
                        resourceGroupKey: resourceGroupKey,
                        }
                    }
                );
                if (resourceSearch) {resourceKey = resourceSearch.resourceKey;} 
            }

            query2[i] = [
                resource_event_id, 
                'SYSTEM', // created_By
                currentTime, //created_At
                resourceEventData.resource[i].resource_Name, 
                resourceEventData.resource[i].resource_Namespace,
                resourceEventData.resource[i].resource_Description || 'No description provided',
                resourceEventData.resource[i].resource_Type, 
                resource_event_target_created_at,
                resourceEventData.resource[i].resource_Target_Uuid, 
                resourceEventData.resource[i].resource_event_involved_object_kind, 
                resourceEventData.resource[i].resource_event_involved_object_name,
                resourceEventData.resource[i].resource_event_involved_object_namespace,
                resourceEventData.resource[i].resource_event_reason,
                resourceEventData.resource[i].resource_event_message,
                resourceEventData.resource[i].resource_event_source_component,
                resourceEventData.resource[i].resource_event_source_host,
                resource_event_first_timestamp,
                resource_event_last_timestamp,
                resourceEventData.resource[i].resource_event_count,
                customerAccountKey, //customer_Account_Key
                resourceGroupKey, //resource_Group_Kep 17 total columns
                resourceKey,
            ];
            
        }
        console.log(query1);
        console.log(query2);
        //3. DB insert
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
        try{
            await mysqlConnection.query(query1, [query2])
            await mysqlConnection.query('COMMIT');
        }
        catch(err)
        {
            await mysqlConnection.query('ROLLBACK');
            await mysqlConnection.end();
            console.info('Rollback successful');
            throw err `error on sql execution: ${resourceType}`;
        }
        await mysqlConnection.end();
        return "successful DB update ";

    }    
} //end of class

export default ResourceService;