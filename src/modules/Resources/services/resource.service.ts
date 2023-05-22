import config from '@config/index';
import { IRequestMassUploader } from '@/common/interfaces/massUploader.interface';
import { IResourceGroup } from '@/common/interfaces/resourceGroup.interface';
import { IResource, IResourceTargetUuid } from "@/common/interfaces/resource.interface";
import DB from '@/database';
import { IPartyUser } from '@/common/interfaces/party.interface';

import QueryService from "@modules/Resources/query/query";
import { HttpException } from "@common/exceptions/HttpException";
import mysql from "mysql2/promise";
import { IResourceEvent } from "@common/interfaces/resourceEvent.interface";

const uuid = require('uuid');

class resourceService {

  public queryService = new QueryService()

  public resource = DB.Resource;
  public resourceGroup = DB.ResourceGroup;
  public resourceEvent = DB.ResourceEvent;
  public partyUser = DB.PartyUser;

  public async uploadResource(totalMsg) {
    let queryResult: any
    let resultMsg
    queryResult = await this.queryService.getResourceQuery(totalMsg, totalMsg.cluster_uuid)
    if (Object.keys(queryResult.message).length === 0) {
      console.log(`skip to upload resource(${queryResult.resourceType}). cause: empty list`)
      return 'empty list'
    }

    try {
      if (queryResult.resourceType === 'EV' && totalMsg.template_uuid === '00000000000000000000000000000008') {
        resultMsg = await this.massUploadK8SEvent(JSON.parse(queryResult.message))

      } else if (queryResult.resourceType === 'NCPEV' && totalMsg.template_uuid === '70000000000000000000000000000033') {
        resultMsg = await this.massUploadNCPEvent(JSON.parse(queryResult.message))
      } else {
          resultMsg = await this.massUploadResource(JSON.parse(queryResult.message))
      }

      console.log(`success to upload resource(${queryResult.resourceType}).`)
      return resultMsg
    } catch (err) {
      console.log(`failed to upload resource(${queryResult.resourceType}. cause: ${err})`)
      return err
    }

  }

  public async massUploadResource(resourceMassFeed: IRequestMassUploader): Promise<string> {
    const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const sizeOfInput = resourceMassFeed.resource.length;
    const findSystemUser: IPartyUser = await this.partyUser.findOne({ where: { userId: config.partyUser.userId } });
    const systemUserId = findSystemUser.partyUserId;

    /* process bulk id for Resource table
    const targetTable = 'Resource';
    const responseTableIdData: IResponseIssueTableIdBulkDto = await this.tableIdService.issueTableIdBulk(targetTable, sizeOfInput);
    const resource_id_prefix = responseTableIdData.tableIdFinalIssued.substring(0, 8);
    var resource_id_postfix_number = Number(responseTableIdData.tableIdFinalIssued.substring(8, 16)) - responseTableIdData.tableIdRange;
    var resource_id_postfix = '';
    const tableIdSequenceDigit = responseTableIdData.tableIdSequenceDigit;
    */
    // search for customerAccount & resourceGroup key
    const resourceGroupUuid = resourceMassFeed.resource_Group_Uuid;
    const responseResourceGroup: IResourceGroup = await this.resourceGroup.findOne({where: {resourceGroupUuid}});
    const customerAccountKey = responseResourceGroup.customerAccountKey;
    const resourceGroupKey = responseResourceGroup.resourceGroupKey;
    const resourceType = resourceMassFeed.resource_Type;

    // mass formatter #1
    // update resource deactivated if there is no matched resoure in NC database.
    const currentResourceFiltered: IResourceTargetUuid[] = await this.resource.findAll({
      where: { resourceType, resourceGroupKey, customerAccountKey, deletedAt: null },
      attributes: ['resourceTargetUuid', 'deletedAt'],
    });
    const sizeOfCurrentResource = currentResourceFiltered.length;

    const currentResource = [];
    for (let i = 0; i < sizeOfCurrentResource; i++) {
      currentResource[i] = currentResourceFiltered[i].resourceTargetUuid;
    }
    //console.log("********in db********************")
    //console.log(currentResource);
    const newResourceReceived = [];
    for (let i = 0; i < sizeOfInput; i++) {
      newResourceReceived[i] = resourceMassFeed.resource[i].resource_Target_Uuid;
    }
    //console.log("********in msg********************")
    //console.log(newResourceReceived);

    // filter only for the resource that is needed to be deleted softly.
    const difference = currentResource.filter(o1 => !newResourceReceived.includes(o1));
    const lengthOfDifference = difference.length;
    //console.log("********in difference********************")
    //console.log(lengthOfDifference);

    // mass formatter #2
    // query below will cover "insert" of new resources or "update" of existing resources.
    const query1 = `INSERT INTO Resource (resource_id, created_by, created_at, resource_target_uuid, resource_target_created_at,
                      resource_name, parent_resource_id, resource_namespace, resource_type, resource_labels, resource_annotations, resource_owner_references, resource_description, resource_status,
                      resource_spec, resource_level1, resource_level2, resource_level3, resource_level4, resource_level5, resource_level_type, resource_instance,
                      resource_pod_phase, resource_pod_container, resource_pod_volume, resource_replicas, resource_sts_volume_claim_templates,
                      resource_pvc_storage, resource_pvc_volume_name, resource_pvc_storage_class_name, resource_pvc_volume_mode, resource_endpoint,
                      resource_configmap_data, resource_ingress_class, resource_ingress_rules,
                      resource_pv_storage, resource_pv_claim_ref, resource_pv_storage_class_name, resource_pv_volume_mode,
                      resource_sc_provisioner, resource_sc_reclaim_policy, resource_sc_allow_volume_expansion, resource_sc_volume_binding_mode,
                      resource_rbac, resource_anomaly_monitor, resource_active,
                      customer_account_key, resource_group_key,
                      resource_app
                      ) VALUES ?
                      ON DUPLICATE KEY UPDATE
                      resource_active=VALUES(resource_active),
                      resource_name=VALUES(resource_name),
                      parent_resource_id=VALUES(parent_resource_id),
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
                      resource_level5=VALUES(resource_level5),
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
                      updated_by=VALUES(created_by),
                      resource_app=VALUES(resource_app)
                      `;
    const query2 = [];
    for (let i = 0; i < sizeOfInput; i++) {
      const resource_Target_Created_At = new Date(resourceMassFeed.resource[i].resource_Target_Created_At);
      //const resource_event_first_timestamp = new Date(resourceMassFeed.resource[i].resource_event_first_timestamp);
      //const resource_event_last_timestamp = new Date(resourceMassFeed.resource[i].resource_event_last_timestamp);

      //let resource_id = resource_id_prefix + resource_id_postfix;
      const resource_id = uuid.v1();
      const resource_lables = JSON.stringify(resourceMassFeed.resource[i].resource_Labels);
      const resource_annotations = JSON.stringify(resourceMassFeed.resource[i].resource_Annotations);
      const resource_owner_references = JSON.stringify(resourceMassFeed.resource[i].resource_Owner_References);
      const resource_status = JSON.stringify(resourceMassFeed.resource[i].resource_Status);
      const resource_pod_container = JSON.stringify(resourceMassFeed.resource[i].resource_Pod_Container);
      const resource_pod_volume = JSON.stringify(resourceMassFeed.resource[i].resource_Pod_Volume);
      const resource_sts_volume_claim_templates = JSON.stringify(resourceMassFeed.resource[i].resource_Sts_volume_Claim_Templates);
      const resource_pvc_storage = JSON.stringify(resourceMassFeed.resource[i].resource_Pvc_Storage);
      const resource_endpoint = JSON.stringify(resourceMassFeed.resource[i].resource_Endpoint);
      const resource_configmap_data = JSON.stringify(resourceMassFeed.resource[i].resource_Configmap_Data);
      const resource_ingress_rules = JSON.stringify(resourceMassFeed.resource[i].resource_Ingress_Rules);
      const resource_pv_claim_ref = JSON.stringify(resourceMassFeed.resource[i].resource_Pv_Claim_Ref);
      const resource_spec = JSON.stringify(resourceMassFeed.resource[i].resource_Spec);
      const resource_app = resourceMassFeed.resource[i].resource_App;

      query2[i] = [
        //1st line
        resource_id, //resource_Id
        systemUserId, // created_By
        currentTime, //created_At
        resourceMassFeed.resource[i].resource_Target_Uuid,
        resource_Target_Created_At,
        //2nd line
        resourceMassFeed.resource[i].resource_Name,
        resourceMassFeed.resource[i].parent_Resource_Id, // parent resource id
        resourceMassFeed.resource[i].resource_Namespace,
        resourceMassFeed.resource[i].resource_Type,
        resource_lables,
        resource_annotations,
        resource_owner_references,
        resourceMassFeed.resource[i].resource_Description || 'No description provided',
        resource_status,
        //3rd line
        resource_spec,
        resourceMassFeed.resource[i].resource_Level1,
        resourceMassFeed.resource[i].resource_Level2,
        resourceMassFeed.resource[i].resource_Level3,
        resourceMassFeed.resource[i].resource_Level4,
        resourceMassFeed.resource[i].resource_Level5,
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
        resourceGroupKey, //resource_Group_Kep 17 total columns
        resource_app,
      ];
      //resource_Target_Created_At = null;
    }

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
        let query_delete = '';
        query_delete +=
          "UPDATE Resource SET deleted_at = NOW(), updated_at = NOW(), updated_by = 'SYSTEM', resource_active = 0  WHERE resource_target_uuid IN (";
        for (let i = 0; i < lengthOfDifference; i++) {
          if (lengthOfDifference == 1) {
            query_delete += "'" + difference[i] + "')";
          } else if (i == lengthOfDifference - 1) {
            query_delete += "'" + difference[i] + "')";
          } else {
            query_delete += "'" + difference[i] + "',";
          }
        }
        await mysqlConnection.query(query_delete);
        await mysqlConnection.query('COMMIT');
      } // end of soft delete

      await mysqlConnection.query(query1, [query2]);
      await mysqlConnection.query('COMMIT');
    } catch (err) {
      //console.error(`Error occurred while creating resource: ${err.message}`, err);
      await mysqlConnection.query('ROLLBACK');
      await mysqlConnection.end();
      console.info('Rollback successful');
      throw `${err} error on sql execution: ${resourceType}`;
    }
    await mysqlConnection.end();

    // Subscription & MetricOps Part
    // Subscribed Product for new nodes - If nodes are deleted, expire the subscribedProducts
    if (resourceType === 'ND') {
      //for new Nodes
      await this.resourceGroup.update(
        { resourceGroupLastServerUpdatedAt: new Date(), updatedAt: new Date(), updatedBy: systemUserId },
        { where: { resourceGroupUuid } },
      );
    }

    return 'successful DB update ';
  } // end of massUploadResource

  public async massUploadK8SEvent(resourceEventData: IRequestMassUploader): Promise<string> {
    //console.log(resourceEventData);
    const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const sizeOfInput = resourceEventData.resource.length;

    const resource_template = [
      { resourceName: 'Service', resourceType: 'SV', template_uuid: '00000000000000000000000000000020' }, //service
      { resourceName: 'Node', resourceType: 'ND', template_uuid: '00000000000000000000000000000010' }, // node
      { resourceName: 'Namespace', resourceType: 'NS', template_uuid: '00000000000000000000000000000004' }, //namespace
      { resourceName: 'Pod', resourceType: 'PD', template_uuid: '00000000000000000000000000000002' }, //pod
      { resourceName: 'Deployment', resourceType: 'DP', template_uuid: '00000000000000000000000000001002' }, //deployment
      { resourceName: 'StatefulSet', resourceType: 'SS', template_uuid: '00000000000000000000000000001004' }, //statefulset
      { resourceName: 'Daemonset', resourceType: 'DS', template_uuid: '00000000000000000000000000001006' }, //daemonset
      { resourceName: 'ReplicaSet', resourceType: 'RS', template_uuid: '00000000000000000000000000001008' }, //replicaset
      { resourceName: 'PVC', resourceType: 'PC', template_uuid: '00000000000000000000000000000018' }, //pvc
      { resourceName: 'Secret', resourceType: 'SE', template_uuid: '00000000000000000000000000000014' }, //secret
      { resourceName: 'Endpoint', resourceType: 'EP', template_uuid: '00000000000000000000000000000016' }, //endpoint
      { resourceName: 'Configmap', resourceType: 'CM', template_uuid: '00000000000000000000000000000006' }, //configmap
      { resourceName: 'Ingress', resourceType: 'IG', template_uuid: '00000000000000000000000000002002' }, //ingress
      { resourceName: 'PV', resourceType: 'PV', template_uuid: '00000000000000000000000000000012' }, //pv
      { resourceName: 'Storage Class', resourceType: 'SC', template_uuid: '00000000000000000000000000003002' }, //storageclass
      { resourceName: 'Event', resourceType: 'EV', template_uuid: '00000000000000000000000000000008' }, //storageclass
      //template_uuid: "00000000000000000000000000003002",
      //template_uuid: "00000000000000000000000000003002";
    ];

    //1. validate ResourceGroup
    const resourceGroupUuid = resourceEventData.resource_Group_Uuid;
    const resourceType = resourceEventData.resource_Type;
    const responseResourceGroup: IResourceGroup = await this.resourceGroup.findOne({ where: {resourceGroupUuid: resourceGroupUuid, deletedAt: null} });
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
            resource_group_key,
            resource_key
            ) VALUES ?
            `;

    const query2 = [];
    for (let i = 0; i < sizeOfInput; i++) {
      const uuid = require('uuid');
      const resource_event_id = uuid.v1();
      const resource_event_target_created_at = new Date(resourceEventData.resource[i].resource_Target_Created_At);
      let resource_event_first_timestamp = new Date(resourceEventData.resource[i].resource_event_first_timestamp);
      if (resource_event_first_timestamp <= new Date('2000-01-01 00:00:00.000')) resource_event_first_timestamp = resource_event_target_created_at;
      let resource_event_last_timestamp = new Date(resourceEventData.resource[i].resource_event_last_timestamp);
      if (resource_event_last_timestamp <= new Date('2000-01-01 00:00:00.000')) resource_event_last_timestamp = resource_event_target_created_at;

      const selectedTemplate = resource_template.find(template => {
        return template.resourceName === resourceEventData.resource[i].resource_event_involved_object_kind;
      });

      let resourceKey = null;
      if (selectedTemplate) {
        const resourceSearch: IResource = await this.resource.findOne({
          where: {
            resourceName: resourceEventData.resource[i].resource_event_involved_object_name,
            resourceType: selectedTemplate.resourceType,
            resourceGroupKey: resourceGroupKey,
          },
        });
        if (resourceSearch) {
          resourceKey = resourceSearch.resourceKey;
        }
      }

      query2[i] = [
        resource_event_id,
        'SYSTEM', // created_By
        currentTime, //created_At
        resourceEventData.resource[i].resource_Name,
        resourceEventData.resource[i].resource_Namespace,
        resourceEventData.resource[i].resource_Description || 'No description provided',
        resourceEventData.resource[i].resource_event_type,
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
        resourceGroupUuid, //resource_Group_uuid 17 total columns
        resourceGroupKey,
        resourceKey,
      ];
    }
    //console.log(query1);
    //console.log(query2);
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
    try {
      await mysqlConnection.query(query1, [query2]);
      await mysqlConnection.query('COMMIT');
    } catch (err) {
      await mysqlConnection.query('ROLLBACK');
      await mysqlConnection.end();
      console.info('Rollback successful');
      throw `${err}error on sql execution: ${resourceType}`;
    }
    await mysqlConnection.end();
    return 'successful DB update ';
  }

  public async massUploadNCPEvent(resourceEventData: IRequestMassUploader): Promise<string> {
    //console.log(resourceEventData);
    const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const sizeOfInput = resourceEventData.resource.length;

    //1. validate ResourceGroup
    const resourceGroupUuid = resourceEventData.resource_Group_Uuid;
    const resourceType = resourceEventData.resource_Type;
    const responseResourceGroup: IResourceGroup = await this.resourceGroup.findOne({ where: {resourceGroupUuid: resourceGroupUuid, deletedAt: null} });
    if (!responseResourceGroup) {
      throw new HttpException(400, 'resourceGroup not found');
    }

    const customerAccountKey = responseResourceGroup.customerAccountKey;
    const resourceGroupKey = responseResourceGroup.resourceGroupKey;

    //find exist event, and delete insert
    const currentResourceFiltered: IResourceEvent[] = await this.resourceEvent.findAll({
      where: { resourceGroupUuid, deletedAt: null },
      attributes: ['resourceEventTargetUuid', 'deletedAt'],
    });

    const sizeOfCurrentResource = currentResourceFiltered.length;

    const currentResource = [];
    for (let i = 0; i < sizeOfCurrentResource; i++) {
      currentResource[i] = currentResourceFiltered[i].resourceEventTargetUuid;
    }

    //console.log("********in db********************")
    //console.log(currentResource);
    const newResourceReceived = [];
    for (let i = 0; i < sizeOfInput; i++) {
      newResourceReceived[i] = resourceEventData.resource[i].resource_Target_Uuid;
    }
    //console.log("********in msg********************")
    //console.log(newResourceReceived);

    // filter only for the resource that is needed to be deleted softly.
    const difference = currentResource.filter(o1 => !newResourceReceived.includes(o1));
    const lengthOfDifference = difference.length;

    //2. prepare for sql
    const query1 = `INSERT INTO ResourceEvent (
            resource_event_id,
            created_by,
            created_at,
            resource_event_name,
            resource_event_description,
            resource_event_type,
            resource_event_target_created_at,
            resource_event_target_uuid,
            resource_event_involved_object_kind,
            resource_event_involved_object_name,
            resource_event_reason,
            resource_event_first_timestamp,
            resource_event_last_timestamp,
            resource_event_content,
            customer_account_key,
            resource_group_uuid,
            resource_group_key,
            resource_key
            ) VALUES ?
            ON DUPLICATE KEY UPDATE
            resource_event_id=VALUES(resource_event_id)
            `;

    const query2 = [];
    for (let i = 0; i < sizeOfInput; i++) {
      const resource_event_target_created_at = new Date(resourceEventData.resource[i].resource_Target_Created_At);
      let resource_event_first_timestamp = new Date(resourceEventData.resource[i].resource_event_first_timestamp);
      if (resource_event_first_timestamp <= new Date('2000-01-01 00:00:00.000')) resource_event_first_timestamp = resource_event_target_created_at;
      let resource_event_last_timestamp = new Date(resourceEventData.resource[i].resource_event_last_timestamp);
      if (resource_event_last_timestamp <= new Date('2000-01-01 00:00:00.000')) resource_event_last_timestamp = resource_event_target_created_at;


      let resourceKey = null;

      query2[i] = [
        resourceEventData.resource[i].resource_event_id,
        'SYSTEM', // created_By
        currentTime, //created_At
        resourceEventData.resource[i].resource_Name,
        resourceEventData.resource[i].resource_Description || 'No description provided',
        resourceEventData.resource[i].resource_event_type,
        resource_event_target_created_at,
        resourceEventData.resource[i].resource_Target_Uuid,
        resourceEventData.resource[i].resource_event_involved_object_kind,
        resourceEventData.resource[i].resource_event_involved_object_name,
        resourceEventData.resource[i].resource_event_reason,
        resource_event_first_timestamp,
        resource_event_last_timestamp,
        JSON.stringify(resourceEventData.resource[i].resource_Spec),
        customerAccountKey, //customer_Account_Key
        resourceGroupUuid, //resource_Group_uuid 17 total columns
        resourceGroupKey,
        resourceKey
      ];
    }
    //console.log(query1);
    //console.log(query2);
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
    try {
      await mysqlConnection.query(query1, [query2]);
      await mysqlConnection.query('COMMIT');

    } catch (err) {
      await mysqlConnection.query('ROLLBACK');
      await mysqlConnection.end();
      console.info('Rollback successful');
      throw `${err}error on sql execution: ${resourceType}`;
    }
    await mysqlConnection.end();
    return 'successful DB update ';
  }
}

export default resourceService;
