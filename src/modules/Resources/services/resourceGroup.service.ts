import DB from '@/database';
import { IResourceGroup, IResourceGroupUi } from '@/common/interfaces/resourceGroup.interface';
import { IResource } from '@/common/interfaces/resource.interface';
import { IMetricMeta } from '@/common/interfaces/metricMeta.interface';
//import { IMetricReceived } from '@/common/interfaces/metricReceived.interface';
import { ResourceGroupDto } from '../dtos/resourceGroup.dto';
import { Op } from 'sequelize';
import { HttpException } from '@/common/exceptions/HttpException';
import { isEmpty } from '@/common/utils/util';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';
import AlertRuleService from '@/modules/Alert/services/alertRule.service';
import SchedulerService from '@/modules/Scheduler/services/scheduler.service';
import SubscriptionsService from '@/modules/Subscriptions/services/subscriptions.service';
import SudoryService from '@/modules/CommonService/services/sudory.service';
//import { Db } from 'mongodb';
//import sequelize from 'sequelize';
import config from '@config/index';;

class ResourceGroupService {
  public resourceGroup = DB.ResourceGroup;
  public resource = DB.Resource;
  public metricMeta = DB.MetricMeta;
  public metricReceived = DB.MetricReceived;
  public partyResource = DB.PartyResource;
  public subscribedProduct= DB.SubscribedProduct;
  public anomalyTarget = DB.AnomalyMonitoringTarget;
  public tableIdService = new TableIdService();
  public customerAccountService = new CustomerAccountService();
  public alertRuleService = new AlertRuleService();
  public schedulerService = new SchedulerService();
  public subscriptionsService = new SubscriptionsService();
  public sudoryService = new SudoryService();


  /**
   * @param  {ResourceGroupDto} resourceGroupData
   * @param  {string} currentUserId
   * @param  {number} customerAccountKey
   */
  public async createResourceGroup(resourceGroupData: ResourceGroupDto, currentUserId: string, customerAccountKey: number): Promise<IResourceGroup> {
    if (isEmpty(resourceGroupData)) throw new HttpException(400, 'ResourceGroup must not be empty');

    try {
      const tableIdTableName = 'ResourceGroup';
      const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdTableName);

      const createResourceGroup: IResourceGroup = await this.resourceGroup.create({
        resourceGroupId: responseTableIdData.tableIdFinalIssued,
        createdBy: currentUserId,
        customerAccountKey,
        ...resourceGroupData,
      });

      console.log (createResourceGroup)
      const uuid = require('uuid');
      const apiId = uuid.v1();
      const resourceData = {
        resourceId: apiId,
        customerAccountKey: customerAccountKey,
        resourceType: 'K8',
        resourceName: resourceGroupData.resourceGroupName,
        resourceDescription: resourceGroupData.resourceGroupDescription,
        resourceTargetUuid: resourceGroupData.resourceGroupUuid,
        resourceGroupKey: createResourceGroup.resourceGroupKey,
        resourceLevelType: 'K8',
        resourceLevel1: 'K8',
        resourceRbac: true,
        resourceAnomalyMonitor: false,
        resourceActive: true,
        resourceStatusUpdatedAt: new Date(),
        resourceInstance: '',
        resourceLevel2: '',
        resourceLevel3: '',
        resourceLevel4: '',
        resourceNamespace: '',
        resourceStatus: null,
        parentResourceId: '',
        resourceOwnerReferences: null,
        resourceTargetCreatedAt: new Date(),
        createdAt: new Date(),
        createdBy: currentUserId,
      }

      const createResource: IResource = await this.resource.create(resourceData);


      const returnResult = createResourceGroup;

      return returnResult;
    } catch (error) {
      throw new HttpException(500, error);
    }
  }

  /**
   * @returns Promise
   */
  public async getAllResourceGroups(customerAccountKey: number): Promise<IResourceGroup[]> {
    const allResourceGroup: IResourceGroup[] = await this.resourceGroup.findAll({
      where: { deletedAt: null, customerAccountKey },
      attributes: { exclude: ['deletedAt'] },
    });

    return allResourceGroup;
  }

  /**
   * @param  {string} resourceGroupId
   * @returns Promise
   */
  public async getResourceGroupById(resourceGroupId: string): Promise<IResourceGroup> {
    const resourceGroup: IResourceGroup = await this.resourceGroup.findOne({
      where: { resourceGroupId },
      attributes: { exclude: ['deletedAt'] },
    });

    return resourceGroup;
  }

  /**
   * @param  {string} resourceGroupUuid
   * @returns Promise
   */
  public async getResourceGroupByUuid(resourceGroupUuid: string): Promise<IResourceGroup> {
    const resourceGroup: IResourceGroup = await this.resourceGroup.findOne({
      where: { resourceGroupUuid },
      //attributes: { exclude: ['resourceGroupKey', 'deletedAt'] },
    });
    return resourceGroup;
  }

  public async getUserResourceGroupByUuid(customerAccountKey: number, resourceGroupUuid: string): Promise<IResourceGroup> {
    const resourceGroup: IResourceGroup = await this.resourceGroup.findOne({
      where: { resourceGroupUuid, customerAccountKey },
      //attributes: { exclude: ['resourceGroupKey', 'deletedAt'] },
    });
    return resourceGroup;
  }

  public async getUserResourceGroupByKey(customerAccountKey: number, resourceGroupKey: number): Promise<IResourceGroup> {
    const resourceGroup: IResourceGroup = await this.resourceGroup.findOne({
      where: { resourceGroupKey, customerAccountKey },
      //attributes: { exclude: ['resourceGroupKey', 'deletedAt'] },
    });
    return resourceGroup;
  }

  /**
   * @param  {string} customerAccountId
   * @returns Promise
   */
  public async getResourceGroupByCustomerAccountId(customerAccountId: string): Promise<IResourceGroupUi[]> {
    const resourceType = 'ND';
    const resultCustomerAccount = await this.customerAccountService.getCustomerAccountKeyById(customerAccountId);
    const customerAccountKey = resultCustomerAccount.customerAccountKey;

    const resultResourceGroup: IResourceGroup[] = await this.resourceGroup.findAll({
      where: { customerAccountKey: customerAccountKey, deletedAt: null },
    });

    const numberOfResouceGroup = resultResourceGroup.length;

    var resourceGroupResult = new Array();

    for (let i = 0; i < numberOfResouceGroup; i++) {
      let resourceGroupKey = resultResourceGroup[i].resourceGroupKey;

      let resultResource = await this.resource.findAll({
        where: { deletedAt: null, resourceType: resourceType, resourceGroupKey: resourceGroupKey },
      });
      let numberOfNode = resultResource.length;

      resourceGroupResult[i] = {
        resourceGroupKey: resultResourceGroup[i].resourceGroupKey,
        resourceGroupId: resultResourceGroup[i].resourceGroupId,
        customerAccountKey: resultResourceGroup[i].customerAccountKey,
        createdBy: resultResourceGroup[i].createdBy,
        updatedBy: resultResourceGroup[i].updatedBy,
        createdAt: resultResourceGroup[i].createdAt,
        updatedAt: resultResourceGroup[i].updatedAt,
        deletedAt: resultResourceGroup[i].deletedAt,
        resourceGroupName: resultResourceGroup[i].resourceGroupName,
        resourceGroupDescription: resultResourceGroup[i].resourceGroupDescription,
        resourceGroupProvider: resultResourceGroup[i].resourceGroupProvider,
        resourceGroupPlatform: resultResourceGroup[i].resourceGroupPlatform,
        resourceGroupUuid: resultResourceGroup[i].resourceGroupUuid,
        resourceGroupPrometheus: resultResourceGroup[i].resourceGroupPrometheus,
        resourceGroupGrafana: resultResourceGroup[i].resourceGroupGrafana,
        resourceGroupLoki: resultResourceGroup[i].resourceGroupLoki,
        resourceGroupAlertManager: resultResourceGroup[i].resourceGroupAlertManager,
        numberOfNode: numberOfNode,
      };
    }

    return resourceGroupResult;
  }

  /**
   * @param  {string} resourceGroupId
   * @param  {ResourceGroupDto} resourceGroupData
   * @param  {string} currentUserId
   */
  public async updateResourceGroupById(resourceGroupId: string, resourceGroupData: ResourceGroupDto, currentUserId: string): Promise<IResourceGroup> {
    if (isEmpty(resourceGroupData)) throw new HttpException(400, 'ResourceGroup  must not be empty');

    const findResourceGroup: IResourceGroup = await this.resourceGroup.findOne({ where: { resourceGroupId: resourceGroupId } });

    if (!findResourceGroup) throw new HttpException(400, "ResourceGroup  doesn't exist");

    const updatedResourceGroup = {
      ...resourceGroupData,
      updatedBy: currentUserId,
      updatedAt: new Date(),
    };

    await this.resourceGroup.update(updatedResourceGroup, { where: { resourceGroupId: resourceGroupId } });

    return this.getResourceGroupById(resourceGroupId);
  }

  /**
   * @param  {string} resourceGroupUuId
   * @param  {ResourceGroupDto} resourceGroupData
   * @param  {string} currentUserId
   */
   public async updateResourceGroupByUuid(resourceGroupUuid: string, resourceGroupData: object, currentUserId: string): Promise<IResourceGroup> {
    if (isEmpty(resourceGroupData)) throw new HttpException(400, 'ResourceGroup  must not be empty');

    const findResourceGroup: IResourceGroup = await this.resourceGroup.findOne({ where: { resourceGroupUuid: resourceGroupUuid } });
    if (!findResourceGroup) throw new HttpException(400, "ResourceGroup  doesn't exist");

    const updatedResourceGroup = {
      ...resourceGroupData,
      updatedBy: currentUserId,
      updatedAt: new Date(),
    };

    await this.resourceGroup.update(updatedResourceGroup, { where: { resourceGroupUuid: resourceGroupUuid } });

    return this.getResourceGroupById(findResourceGroup.resourceGroupId);
  }

  /**
   * @param  {number} customerAccountKey
   */
  public async getResourceGroupUuidByCustomerAcc(customerAccountKey: number): Promise<string> {
    const resourceGroup: IResourceGroup = await this.resourceGroup.findOne({
      where: { customerAccountKey },
      attributes: { exclude: ['resourceGroupKey', 'deletedAt'] },
    });
    return resourceGroup.resourceGroupUuid;
  }

  /**
   * @param  {string} resourceGroupUuid
   */
  
  public async deleteResourceGroupByResourceGroupUuid (resourceGroupUuid: string, customerAccountKey: number): Promise<object>{

    if (isEmpty(resourceGroupUuid)) throw new HttpException(400, 'ResourceGroupUuid  must not be empty');
    console.log(resourceGroupUuid);
    const findResourceGroup: IResourceGroup = await this.resourceGroup.findOne({ where: { resourceGroupUuid: resourceGroupUuid, deletedAt: null } });
    if (!findResourceGroup) throw new HttpException(400, "*ResourceGroup doesn't exist");

    // 1. AlertRule, AlertReceived
    const resultAlertRule = await this.alertRuleService.deleteAlertRuleByResourceGroupUuid(resourceGroupUuid);
    console.log ("alert")
    console.log (resultAlertRule); 

    // 2. MetricMeta, MetricReceived
//    const resultMetricMeta = await this.metricMetaService.deleteMetricMetaByResourceGroupUuid(resourceGroupUuid);
//    console.log (resultMetricMeta);

    const deleteData = { deletedAt: new Date() };
    const findMetricMeta: IMetricMeta = await this.metricMeta.findOne({ where: { resourceGroupUuid: resourceGroupUuid, deletedAt: null } });
    console.log ("metric")
    if (findMetricMeta) {
      const resultDeleteMetricReceived = await this.metricReceived.update(deleteData, {where: {metricMetaKey: findMetricMeta.metricMetaKey}} );
      const resultDeleteMetricMeta = await this.metricMeta.update(deleteData, {where: {resourceGroupUuid: resourceGroupUuid}});
      console.log (findMetricMeta); 
      console.log (resultDeleteMetricReceived);
      console.log (resultDeleteMetricMeta);
    }
    // 3. Resource, PartyResource, SubscribedProduct, AnomalyMonitoringTarget
//    const resultResource = await this.resourceSerivce.deleteResourceByResourceGroupUuid(resourceGroupUuid, findResourceGroup.resourceGroupKey);
//    console.log (resultResource);

    const query = {
      where: {
        resourceGroupKey: findResourceGroup.resourceGroupKey,
        deletedAt: null,
        resourceActive: true,
      },
    };

    const getResource: IResource[] = await this.resource.findAll(query); 
    var resourceKey = {};

    for (let i=0; i<getResource.length; i++)
      {resourceKey = Object.assign(resourceKey, getResource[i].resourceKey); 
      }

    const queryIn = {
      where: {
        resourceKey: { [Op.in]: resourceKey },
      },
    };
    console.log ("Resource");
    const deleteResultPartyResource = await this.partyResource.update({deletedAt: new Date()}, queryIn); 
    const deleteResultSubscribedProduct = await this.subscribedProduct.update({deletedAt: new Date()}, queryIn); 
    const deleteResultAnomalyTarget = await this.anomalyTarget.update({deletedAt: new Date()}, queryIn); 

    const updatedResource = {
      resourceActive: false,
      deletedAt: new Date(),
    };

    const deleteResultResource = await this.resource.update(updatedResource, query);

    console.log (deleteResultPartyResource); 
    console.log (deleteResultSubscribedProduct); 
    console.log (deleteResultAnomalyTarget); 
    console.log (deleteResultResource);

    // 4. ResourceGroup
    const resultResourceGroup = await this.resourceGroup.update({deletedAt: new Date()}, { where: {resourceGroupUuid: resourceGroupUuid} });
    if (!resultResourceGroup) throw new HttpException(500, `Issue on deleting ResourceGroup ${resourceGroupUuid}`);
    console.log ("ResourceGroup");
    console.log (resultResourceGroup); 
    

    // 5. Billing


    // 6. scheduler
    const resultCancelScheduler = await this.schedulerService.cancelCronScheduleByResourceGroupUuid(resourceGroupUuid); 
    console.log ("Scheduler"); 
    console.log (resultCancelScheduler);

    // 7. sudoryclient?

    const name = "sudory uninstall";
    const summary = "sudory uninstall";
    const templateUuid = '20000000000000000000000000000002'; 
    const steps = [{args: 
      {name: 'sudory', 
       namespace: 'sudoryclient',
      }
    }];
    const sudoryChannel = config.sudoryApiDetail.channel_webhook; 
    const resultUninstallSudoryClient = await this.sudoryService.postSudoryService(name, summary, resourceGroupUuid, templateUuid, steps, customerAccountKey, sudoryChannel); 
    console.log ("sudory");
    console.log (resultUninstallSudoryClient);

    // 8. Customer Notification

    return resultResourceGroup;
  }

  /**
   * @param  {string} resourceGroupUuid
   */
  
   public async getObservabilityResourcesByResourceGroupUuid (resourceGroupUuid: string): Promise<object>{
    
    const appName = "app.kubernetes.io/name"
    if (isEmpty(resourceGroupUuid)) throw new HttpException(400, 'ResourceGroupUuid  must not be empty');
    console.log(resourceGroupUuid);
    const findResourceGroup: IResourceGroup = await this.resourceGroup.findOne({ where: { resourceGroupUuid: resourceGroupUuid, deletedAt: null } });
    if (!findResourceGroup) throw new HttpException(400, "ResourceGroup doesn't exist");

    const resourceGroupKey = findResourceGroup.resourceGroupKey;
    const resourceGroupGrafana = findResourceGroup.resourceGroupGrafana;
    const resourceGroupPrometheus = findResourceGroup.resourceGroupPrometheus;

    //1. Grafana
    const grafanaServiceName = resourceGroupGrafana.substring(7, resourceGroupGrafana.indexOf('.'));
    //search Service
    const resultServiceSearch = await this.resource.findOne({ where: {resourceName:grafanaServiceName, resourceType: "SV", resourceGroupKey: resourceGroupKey, deletedAt: null} });
    const grafanaName = resultServiceSearch.resourceLabels[appName];
    const grafanaSvcName = resultServiceSearch.resourceName;
    const grafanaSvcId = resultServiceSearch.resourceId;
    
    //search PVC
    const resultPvcSearch = await this.resource.findOne({ where: {
        deletedAt: null, 
        resourceType: "PC", 
        resourceGroupKey: resourceGroupKey,
        resourceLabels: {
          '"app.kubernetes.io/name"': grafanaName
        }
    } })
    const grafanaPvcName = resultPvcSearch.resourceName;
    const grafanaPvcId = resultPvcSearch.resourceId;
    
    //search PV
    const resultPvSearch =  await this.resource.findOne({ where: {
      deletedAt: null, 
      resourceType: "PV", 
      resourceGroupKey: resourceGroupKey,
      resourcePvClaimRef: {
        name: grafanaPvcName
      }
    }})
    const grafanaPvName = resultPvSearch.resourceName;
    const grafanaPvId = resultPvSearch.resourceId;
    
    //2. Prometheus
    const prometheusServiceName = resourceGroupPrometheus.substring(7, resourceGroupPrometheus.indexOf('.'));
    //search Service
    const resultPrometheusServiceSearch = await this.resource.findOne({ where: {resourceName:prometheusServiceName, resourceType: "SV", resourceGroupKey: resourceGroupKey, deletedAt: null} });
    var prometheusName = resultPrometheusServiceSearch.resourceSpec["selector"];
    prometheusName = prometheusName[appName]; 
    const prometheusSvcName = resultPrometheusServiceSearch.resourceName;
    const prometheusSvcId = resultPrometheusServiceSearch.resourceId;
    
    //search PVC
    const resultPrometheusPvcSearch = await this.resource.findOne({ where: {
        deletedAt: null, 
        resourceType: "PC", 
        resourceGroupKey: resourceGroupKey,
        resourceLabels: {
          '"app.kubernetes.io/name"': prometheusName
        }
    } })
    const prometheusPvcName = resultPrometheusPvcSearch.resourceName;
    const prometheusPvcId = resultPrometheusPvcSearch.resourceId;
    
    //search PV
    const resultPrometheusPvSearch =  await this.resource.findOne({ where: {
      deletedAt: null, 
      resourceType: "PV", 
      resourceGroupKey: resourceGroupKey,
      resourcePvClaimRef: {
        name: prometheusPvcName
      }
    }})
    const prometheusPvName = resultPrometheusPvSearch.resourceName;
    const prometheusPvId = resultPrometheusPvSearch.resourceId;
    const result = {resourceGroupuuid: resourceGroupUuid,
                    grafanaSvcName: grafanaSvcName,
                    grafanaSvcId: grafanaSvcId,
                    grafanaPvcName: grafanaPvcName,
                    grafanaPvcId: grafanaPvcId,
                    grafanaPvName: grafanaPvName,
                    grafanaPvId: grafanaPvId,
                    prometheusSvcName: prometheusSvcName,
                    prometheusSvcId: prometheusSvcId,
                    prometheusPvcName: prometheusPvcName,
                    prometheusPvcId: prometheusPvcId,
                    prometheusPvName: prometheusPvName,
                    prometheusPvId: prometheusPvId
                  }   

    return result;
   }
}
export default ResourceGroupService;
