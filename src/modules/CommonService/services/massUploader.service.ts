import config from '@config/index';
import { IResponseMassUploader, IRequestMassUploader } from '@/common/interfaces/massUploader.interface';
import resourceService from '@/modules/Resources/services/resource.service';
import resourceGroupService from '@/modules/Resources/services/resourceGroup.service';
import tableIdService from '@/modules/CommonService/services/tableId.service';
//import { IResponseIssueTableIdBulkDto } from '@/modules/CommonService/dtos/tableId.dto';
import { IResourceGroup } from '@/common/interfaces/resourceGroup.interface';
import { IResource, IResourceTargetUuid } from '@/common/interfaces/resource.interface';
import DB from '@/database';
import { Op } from 'sequelize';
import { ICatalogPlan, ICatalogPlanProduct } from '@/common/interfaces/productCatalog.interface';
import { ISubscribedProduct, ISubscriptions } from '@/common/interfaces/subscription.interface';
import { SubscribedProductModel } from '@/modules/Subscriptions/models/subscribedProduct.model';
import SubscriptionService from '@/modules/Subscriptions/services/subscriptions.service';
import { IAnomalyMonitoringTarget } from '@/common/interfaces/monitoringTarget.interface';
import sequelize from 'sequelize';
import { IBayesianModel } from '@/common/interfaces/bayesianModel.interface';

//import { condition } from 'sequelize';
//import Connection from 'mysql2/typings/mysql/lib/Connection';
//import DB from '@/database';
//import { ConnectionAcquireTimeoutError } from 'sequelize/types';

class massUploaderService {
  public tableIdService = new tableIdService();
  public resourceGroupService = new resourceGroupService();
  public resourceService = new resourceService();
  public subscriptionService = new SubscriptionService();

  public resource = DB.Resource;
  public catalogPlan = DB.CatalogPlan;
  public subscription = DB.Subscription;
  public subscribedProduct = DB.SubscribedProduct;
  public catalogPlanProduct = DB.CatalogPlanProduct;
  public anomalyMonitoringTarget = DB.AnomalyMonitoringTarget;

  public async massUploadResource(resourceMassFeed: IRequestMassUploader): Promise<string> {
    const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const sizeOfInput = resourceMassFeed.resource.length;

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
    const responseResourceGroup: IResourceGroup = await this.resourceGroupService.getResourceGroupByUuid(resourceGroupUuid);
    const customerAccountKey = responseResourceGroup.customerAccountKey;
    const resourceGroupKey = responseResourceGroup.resourceGroupKey;
    const resourceType = resourceMassFeed.resource_Type;

    // mass upload #1
    // update resource deactivated if there is no matched resoure in NC database.
    const currentResourceFiltered: IResourceTargetUuid[] = await this.resourceService.getResourceForMass(
      resourceType,
      resourceGroupKey,
      customerAccountKey,
    );
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

    // mass upload #2
    // query below will cover "insert" of new resources or "update" of existing resources.
    const query1 = `INSERT INTO Resource (resource_id, created_by, created_at, resource_target_uuid, resource_target_created_at,
                      resource_name, parent_resource_id, resource_namespace, resource_type, resource_labels, resource_annotations, resource_owner_references, resource_description, resource_status,
                      resource_spec, resource_level1, resource_level2, resource_level3, resource_level4, resource_level_type, resource_instance,
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
      // create resource_id
      /*
        resource_id_postfix_number = resource_id_postfix_number + 1;
        resource_id_postfix = resource_id_postfix_number.toString();
        while (resource_id_postfix.length < tableIdSequenceDigit) {
            resource_id_postfix = '0' + resource_id_postfix;
        }
        */
      const uuid = require('uuid');
      const apiId = uuid.v1();
      const resource_Target_Created_At = new Date(resourceMassFeed.resource[i].resource_Target_Created_At);
      //const resource_event_first_timestamp = new Date(resourceMassFeed.resource[i].resource_event_first_timestamp);
      //const resource_event_last_timestamp = new Date(resourceMassFeed.resource[i].resource_event_last_timestamp);

      //let resource_id = resource_id_prefix + resource_id_postfix;
      const resource_id = apiId;
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
        'SYSTEM', // created_By
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
      throw err`error on sql execution: ${resourceType}`;
    }
    await mysqlConnection.end();

    // Subscribed Product for new nodes - If nodes are deleted, expire the subscribedProducts
    if (resourceType === 'ND') {
      //for new Nodes
      const newNode = newResourceReceived.filter(o1 => !currentResource.includes(o1));
      if (newNode.length > 0) {
        const getResourceNode: IResource[] = await this.resource.findAll({ where: { resourceTargetUuid: { [Op.in]: newNode } } });
        let catalogPlanProductIdForOb: string;
        let catalogPlanProductIdForMo: string;
        if (getResourceNode.length > 0) {
          //find subscription for CatalogPlanProductId
          const findSubsription: ISubscriptions[] = await this.subscription.findAll({ where: { customerAccountKey, deletedAt: null } });
          let subscriptionId;
          //find catalogPlanProduct Id
          for (let i = 0; i < findSubsription.length; i++) {
            subscriptionId = findSubsription[i].subscriptionId;
            const findCatalogPlan: ICatalogPlan = await this.catalogPlan.findOne({
              where: {
                catalogPlanKey: findSubsription[i].catalogPlanKey,
                deletedAt: null,
              },
            });
            const findCatalogPlanProduct: ICatalogPlanProduct = await this.catalogPlanProduct.findOne({
              where: {
                catalogPlanKey: findSubsription[i].catalogPlanKey,
                catalogPlanProductType: resourceType,
                deletedAt: null,
              },
            });
            if (findCatalogPlan.catalogPlanType === 'OB') {
              catalogPlanProductIdForOb = findCatalogPlanProduct.catalogPlanProductId;
            } else if (findCatalogPlan.catalogPlanType === 'MO') {
              catalogPlanProductIdForMo = findCatalogPlanProduct.catalogPlanProductId;
            }
          }
          //register node as new subscribedProduct
          for (let i = 0; i < getResourceNode.length; i++) {
            const resourceId = getResourceNode[i].resourceId;
            const subscribedProduct = {
              subscribedProductFrom: new Date(),
              subscribedProductTo: new Date('9999-12-31T23:59:59Z'),
              subscriptionId,
              catalogPlanProductType: resourceType,
              subscribedProductStatus: 'AC',
              resourceId,
              catalogPlanProductId: catalogPlanProductIdForOb,
            };
            //insert SubsvcribedProduct
            const createSubscribedProduct = await this.subscriptionService.createSubscribedProduct(
              subscribedProduct,
              'SYSTEM',
              'SYSTEM',
              customerAccountKey,
            );
            console.log('new node registered:', createSubscribedProduct);
          }
        }
      }
      //for deleted Nodes - delete subscribedProduct, anomaly target if exists
      const deletedNode = currentResource.filter(o1 => !newResourceReceived.includes(o1));
      if (deletedNode.length > 0) {
        console.log('deletednode------', deletedNode);
        const getDeletedNodeResource: IResource[] = await this.resource.findAll({ where: { resourceTargetUuid: { [Op.in]: deletedNode } } });
        if (getDeletedNodeResource.length > 0) {
          const resourceKey = getDeletedNodeResource.map(x => x.resourceKey);
          const deleteQuerySp = {
            subscribedProductStatus: 'CA',
            deletedAt: new Date(),
            subscribedProductTo: new Date(),
            updatedAt: new Date(),
            updatedBy: 'SYSTEM',
          };
          const deleteQueryAmt = {
            anomaly_monitoring_target_status: 'CA',
            deletedAt: new Date(),
            updatedAt: new Date(),
            updatedBy: 'SYSTEM',
          };

          try {
            return await DB.sequelize.transaction(async t => {
              const conditionQuery = { where: { resourceKey: resourceKey }, transaction: t };
              const deleteSubscribedProduct = await this.subscribedProduct.update(deleteQuerySp, conditionQuery);
              const deleteAnomalyTarget = await this.anomalyMonitoringTarget.update(deleteQueryAmt, conditionQuery);

              console.log(`deleted subscribedProduct - ${JSON.stringify(resourceKey)}, updatedRow: ${deleteSubscribedProduct}`);
              console.log(`deleted anomalyTarget - ${JSON.stringify(resourceKey)}, updatedRow: ${deleteAnomalyTarget}`);
              const result = `sucess to delete subscribedProduct, anomalyTarget - ${JSON.stringify(resourceKey)}`;
              return result;
            });
          } catch (error) {
            console.log(`error on deleteing subscribedProduct and anomalyTarget - ${JSON.stringify(resourceKey)}`);
          }
        }
      }
    }
    // if pod is deleted, but a new pod with the same app is provisoning, replace it for subscribed product & metricOps target
    // if pod is deleted but there is no new pod, make the subscribed product status 'SP'
    if (resourceType === 'PD') {
      // for deleted pod
      const deletedPod = currentResource.filter(o1 => !newResourceReceived.includes(o1));
      if (deletedPod.length > 0) {
        const getDeletedResourcePod: IResource[] = await this.resource.findAll({
          where: { resourceTargetUuid: { [Op.in]: deletedPod } },
        });
        let resourceApp;
        if (getDeletedResourcePod.length > 0) {
          //get unique resourceApp information to identify pods having the same resourceApp
          resourceApp = Array.from(new Set(getDeletedResourcePod.map((pod: any) => pod.resourceApp)));
        }
        //search pod list with unique resourceApp information
        const getPodWithSameApp: IResource[] = await this.resource.findAll({
          where: { resourceApp: { [Op.in]: resourceApp } },
        });

        if (getPodWithSameApp.length > 0) {
          //check customer's subscription to MO
          const findSubscription: ISubscriptions[] = await this.subscription.findAll({ where: { deletedAt: null, customerAccountKey } });
          let catalogPlanProductKey = 0;
          let subscriptionKey = 0;
          let bayesianModelKey = 0;

          if (findSubscription.length > 0) {
            for (let i = 0; i < findSubscription.length; i++) {
              const catalogPlanKey = findSubscription[i].catalogPlanKey;
              const findCatalogPlan: ICatalogPlan = await this.catalogPlan.findOne({ where: { deletedAt: null, catalogPlanKey } });
              if (findCatalogPlan.catalogPlanType == 'MO') {
                const findCatalogPlanProduct: ICatalogPlanProduct = await this.catalogPlanProduct.findOne({
                  where: { deletedAt: null, catalogPlanKey, catalogPlanProductType: resourceType },
                });
                subscriptionKey = findSubscription[i].subscriptionKey;
                catalogPlanProductKey = findCatalogPlanProduct.catalogPlanProductKey;
                const findSubscribedProduct: ISubscribedProduct = await this.subscribedProduct.findOne({
                  where: { subscriptionKey, catalogPlanProductKey },
                });
                const subscribedProductKey = findSubscribedProduct.subscribedProductKey;
                const findAnomalyMonitoringTarget: IAnomalyMonitoringTarget = await this.anomalyMonitoringTarget.findOne({
                  where: { subscribedProductKey },
                });
                bayesianModelKey = findAnomalyMonitoringTarget.bayesianModelKey;
                i = findSubscription.length;
              }
            }
          }
          //process pod by pod
          for (let i = 0; i < getPodWithSameApp.length; i++) {
            const resourceKey = getPodWithSameApp[i].resourceKey;
            const resourceName = getPodWithSameApp[i].resourceName;

            const deleteQuerySp = {
              subscribedProductStatus: 'CA',
              deletedAt: new Date(),
              subscribedProductTo: new Date(),
              updatedAt: new Date(),
              updatedBy: 'SYSTEM',
            };
            const deleteQueryAmt = {
              anomaly_monitoring_target_status: 'CA',
              deletedAt: new Date(),
              updatedAt: new Date(),
              updatedBy: 'SYSTEM',
            };
            //remove all of pods from subscription
            try {
              return await DB.sequelize.transaction(async t => {
                const conditionQuery = { where: { resourceKey: resourceKey }, transaction: t };

                const deleteSubscribedProduct = await this.subscribedProduct.update(deleteQuerySp, conditionQuery);
                const deleteAnomalyTarget = await this.anomalyMonitoringTarget.update(deleteQueryAmt, conditionQuery);

                console.log(`deleted subscribedProduct - ${JSON.stringify(resourceKey)}, updatedRow: ${deleteSubscribedProduct}`);
                console.log(`deleted anomalyTarget - ${JSON.stringify(resourceKey)}, updatedRow: ${deleteAnomalyTarget}`);
                const result = `sucess to delete subscribedProduct, anomalyTarget - ${JSON.stringify(resourceKey)}`;
                return result;
              });
            } catch (error) {
              console.log(`error on deleteing subscribedProduct and anomalyTarget - ${JSON.stringify(resourceKey)}`);
            }
            // add newly added pods with the Pods to subscribedProduct & anomalymonitoringtarget if the customer has MO subscription
            if (catalogPlanProductKey != 0) {
              const uuid = require('uuid');
              //insert data to SubscribedProduct & AnomalyTarget
              try {
                return await DB.sequelize.transaction(async t => {
                  const conditionQuery = { transaction: t };
                  const insertQuerySp = {
                    subscribedProductId: uuid.v1(),
                    resourceKey,
                    catalogPlanProductKey,
                    subscriptionKey,
                    subscribedProductFrom: new Date(),
                    subscribedProductTo: new Date('9999-12-31T23:59:59Z'),
                    subscribedProductStatus: 'AC',
                    createdAt: new Date(),
                    createdBy: 'SYSTEM',
                  };
                  const createSubscribedProduct: ISubscribedProduct = await this.subscribedProduct.create(insertQuerySp, conditionQuery);
                  const insertQueryAmt = {
                    customerAccountKey,
                    anomalyMonitoringTargetId: uuid.v1(),
                    resourceKey,
                    subscribedProductKey: createSubscribedProduct.subscribedProductKey,
                    bayesianModelKey,
                    anomalyMonitoringTargetName: 'AnomalyMonitor' + resourceName,
                    anomalyMonitoringTargetDescription: resourceName,
                    anomaly_monitoring_target_status: 'AC',
                    createdAt: new Date(),
                    createdBy: 'SYSTEM',
                  };
                  const createAnomalyTarget: IAnomalyMonitoringTarget = await this.anomalyMonitoringTarget.create(insertQueryAmt, conditionQuery);

                  console.log(`deleted subscribedProduct - ${JSON.stringify(resourceKey)}, updatedRow: ${createSubscribedProduct}`);
                  console.log(`deleted anomalyTarget - ${JSON.stringify(resourceKey)}, updatedRow: ${createAnomalyTarget}`);
                  const result = `sucess to create subscribedProduct, anomalyTarget - ${JSON.stringify(resourceKey)}`;
                  return result;
                });
              } catch (error) {
                console.log(`error on creating subscribedProduct and anomalyTarget - ${JSON.stringify(resourceKey)}`);
              }
            }
          } // end of for
        }
      } // end of if (deletedPod.length > 0)
    } // end of pod
    // if pbc is deleted, make the subscribed product stauts 'SP'
    if (resourceType === 'PC') {
      //for deleted pvc
      const deletedPvc = currentResource.filter(o1 => !newResourceReceived.includes(o1));
      if (deletedPvc.length > 0) {
        console.log('deletedPvc------', deletedPvc);
        const getDeletedPvcResource: IResource[] = await this.resource.findAll({ where: { resourceTargetUuid: { [Op.in]: deletedPvc } } });
        if (getDeletedPvcResource.length > 0) {
          const resourceKey = getDeletedPvcResource.map(x => x.resourceKey);
          const deleteQuerySp = {
            subscribedProductStatus: 'CA',
            deletedAt: new Date(),
            subscribedProductTo: new Date(),
            updatedAt: new Date(),
            updatedBy: 'SYSTEM',
          };
          const deleteQueryAmt = {
            anomaly_monitoring_target_status: 'CA',
            deletedAt: new Date(),
            updatedAt: new Date(),
            updatedBy: 'SYSTEM',
          };

          try {
            return await DB.sequelize.transaction(async t => {
              const conditionQuery = { where: { resourceKey: resourceKey }, transaction: t };
              const deleteSubscribedProduct = await this.subscribedProduct.update(deleteQuerySp, conditionQuery);
              const deleteAnomalyTarget = await this.anomalyMonitoringTarget.update(deleteQueryAmt, conditionQuery);

              console.log(`deleted subscribedProduct - ${JSON.stringify(resourceKey)}, updatedRow: ${deleteSubscribedProduct}`);
              console.log(`deleted anomalyTarget - ${JSON.stringify(resourceKey)}, updatedRow: ${deleteAnomalyTarget}`);
              const result = `sucess to delete subscribedProduct, anomalyTarget - ${JSON.stringify(resourceKey)}`;
              return result;
            });
          } catch (error) {
            console.log(`error on deleteing subscribedProduct and anomalyTarget - ${JSON.stringify(resourceKey)}`);
          }
        }
      }
    }

    return 'successful DB update ';
  } // end of massUploadResource
}

export default massUploaderService;
