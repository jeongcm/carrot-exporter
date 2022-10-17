import DB from '@/database';
import { IResourceGroup, IResourceGroupUi } from '@/common/interfaces/resourceGroup.interface';
import { IResource } from '@/common/interfaces/resource.interface';
import { IMetricMeta } from '@/common/interfaces/metricMeta.interface';
import { IAlertRule } from '@/common/interfaces/alertRule.interface';
import { ResourceGroupDto } from '../dtos/resourceGroup.dto';
import { Op } from 'sequelize';
import { HttpException } from '@/common/exceptions/HttpException';
import { isEmpty } from '@/common/utils/util';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';
import SchedulerService from '@/modules/Scheduler/services/scheduler.service';
import SubscriptionsService from '@/modules/Subscriptions/services/subscriptions.service';
import SudoryService from '@/modules/CommonService/services/sudory.service';

//import { Db } from 'mongodb';
//import sequelize from 'sequelize';
import config from '@config/index';
import axios from '@/common/httpClient/axios';
import { ICustomerAccount } from '@/common/interfaces/customerAccount.interface';

class ResourceGroupService {
  public resourceGroup = DB.ResourceGroup;
  public resource = DB.Resource;
  public metricMeta = DB.MetricMeta;
  public metricReceived = DB.MetricReceived;
  public partyResource = DB.PartyResource;
  public subscribedProduct = DB.SubscribedProduct;
  public anomalyTarget = DB.AnomalyMonitoringTarget;
  public alertRule = DB.AlertRule;
  public alertReceived = DB.AlertReceived;
  public customerAccount = DB.CustomerAccount;

  public tableIdService = new TableIdService();
  public customerAccountService = new CustomerAccountService();

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

      console.log(createResourceGroup);
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
      };

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
      where: { resourceGroupId, deletedAt: null },
      attributes: { exclude: ['deletedAt'] },
    });

    return resourceGroup;
  }

  /**
   * @param  {string[]} resourceGroupIds
   * @returns Promise
   */
  public async getResourceGroupByIds(resourceGroupId: string[]): Promise<IResourceGroup[]> {
    const resourceGroups: IResourceGroup[] = await this.resourceGroup.findAll({
      where: { resourceGroupId, deletedAt: null },
      attributes: { exclude: ['deletedAt'] },
    });

    return resourceGroups;
  }

  /**
   * @param  {number[]} resourceGroupKeys
   * @returns Promise
   */
  public async getUserResourceGroupByKeys(customerAccountKey: number, resourceGroupKeys: number[]): Promise<IResourceGroup[]> {
    const resourceGroups: IResourceGroup[] = await this.resourceGroup.findAll({
      where: { customerAccountKey, resourceGroupKey: resourceGroupKeys, deletedAt: null },
      attributes: { exclude: ['deletedAt'] },
    });

    return resourceGroups;
  }

  public async getUserResourceGroupByKey(customerAccountKey: number, resourceGroupKey: number): Promise<IResourceGroup> {
    const resourceGroup: IResourceGroup = await this.resourceGroup.findOne({
      where: { resourceGroupKey, customerAccountKey, deletedAt: null },
      //attributes: { exclude: ['resourceGroupKey', 'deletedAt'] },
    });
    return resourceGroup;
  }

  /**
   * @param  {string} resourceGroupUuid
   * @returns Promise
   */
  public async getResourceGroupByUuid(resourceGroupUuid: string): Promise<IResourceGroup> {
    const resourceGroup: IResourceGroup = await this.resourceGroup.findOne({
      where: { resourceGroupUuid, deletedAt: null },
      //attributes: { exclude: ['resourceGroupKey', 'deletedAt'] },
    });
    return resourceGroup;
  }

  public async getUserResourceGroupByUuid(customerAccountKey: number, resourceGroupUuid: string): Promise<IResourceGroup> {
    const resourceGroup: IResourceGroup = await this.resourceGroup.findOne({
      where: { resourceGroupUuid, customerAccountKey, deletedAt: null },
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

    const resourceGroupResult = [];

    for (let i = 0; i < numberOfResouceGroup; i++) {
      const resourceGroupKey = resultResourceGroup[i].resourceGroupKey;

      const resultResource = await this.resource.findAll({
        where: { deletedAt: null, resourceType: resourceType, resourceGroupKey: resourceGroupKey },
      });
      const numberOfNode = resultResource.length;

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
   * @param  {string} platform
   * @param  {string} customerAccountId
   * @returns Promise
   */
  public async getResourceGroupByCustomerAccountIdForOpenstack(platform: string, customerAccountId: string, query?: any): Promise<IResourceGroupUi[]> {
    const resourceGroupId = query.resourceGroupId as string[];

    const resultCustomerAccount = await this.customerAccountService.getCustomerAccountKeyById(customerAccountId);
    const customerAccountKey = resultCustomerAccount.customerAccountKey;

    const resourceGroupWhereCondition = { deletedAt: null, customerAccountKey: customerAccountKey, resourceGroupPlatform: platform };
    if (resourceGroupId) {
      resourceGroupWhereCondition['resourceGroupId'] = { [Op.or]: resourceGroupId};
    }

    console.log("query:", resourceGroupWhereCondition)

    const resultResourceGroup: IResourceGroup[] = await this.resourceGroup.findAll({
      where: resourceGroupWhereCondition,
    });

    console.log("data:", resultResourceGroup)

    const resourceGroupResult = [];

    for (let i = 0; i < resultResourceGroup.length; i++) {
      const resourceGroupKey = resultResourceGroup[i].resourceGroupKey;

      const projectCount = await this.resource.count({
        where: { deletedAt: null, resourceType: "PJ", resourceGroupKey: resourceGroupKey },
      });

      const vmCount = await this.resource.count({
        where: { deletedAt: null, resourceType: "VM", resourceGroupKey: resourceGroupKey },
      });

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
        numberOfProject: projectCount,
        numberOfVM: vmCount,
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

    const findResourceGroup: IResourceGroup = await this.resourceGroup.findOne({ where: { resourceGroupId: resourceGroupId, deletedAt: null } });

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

    const findResourceGroup: IResourceGroup = await this.resourceGroup.findOne({ where: { resourceGroupUuid: resourceGroupUuid, deletedAt: null } });
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
      where: { customerAccountKey, deletedAt: null },
      attributes: { exclude: ['resourceGroupKey', 'deletedAt'] },
    });
    return resourceGroup.resourceGroupUuid;
  }

  /**
   * @param {string} resourceGroupUuid
   * @param {number} customerAccountKey
   * @param {string} deleteOption
   */

  public async deleteResourceGroupByResourceGroupUuid(resourceGroupUuid: string, customerAccountKey: number, deleteOption: string): Promise<object> {
    if (isEmpty(resourceGroupUuid)) throw new HttpException(400, 'ResourceGroupUuid  must not be empty');
    const findResourceGroup: IResourceGroup = await this.resourceGroup.findOne({ where: { resourceGroupUuid: resourceGroupUuid, deletedAt: null } });
    if (!findResourceGroup) throw new HttpException(400, "*ResourceGroup doesn't exist");
    const findCustomerAccount: ICustomerAccount = await this.customerAccount.findOne({ where: { customerAccountKey: customerAccountKey } });
    if (!findCustomerAccount) throw new HttpException(400, "*CustomerAccount doesn't exist");
    const customerAccountId = findCustomerAccount.customerAccountId;

    const sudoryChannel = config.sudoryApiDetail.channel_webhook;
    const kpsLokiNamespace = findResourceGroup.resourceGroupKpsLokiNamespace || 'monitor';
    const sudoryNamespace = findResourceGroup.resourceGroupSudoryNamespace || 'sudoryclient';

    if (deleteOption == '2') {
      //0-1. Prometheus / KPS
      const nameKps = 'KPS uninstall';
      const summaryKps = 'KPS uninstall';
      const templateUuidKps = '20000000000000000000000000000002';
      const stepsKps = [{ args: { name: 'kps', namespace: kpsLokiNamespace } }];
      const resultUninstallKps = await this.sudoryService.postSudoryService(
        nameKps,
        summaryKps,
        resourceGroupUuid,
        templateUuidKps,
        stepsKps,
        customerAccountKey,
        sudoryChannel,
      );
      console.log('kps client - uninstalled - ', resourceGroupUuid);

      //0-2. Loki
      const nameLoki = 'Loki uninstall';
      const summaryLoki = 'Loki uninstall';
      const templateUuidLoki = '20000000000000000000000000000002';
      const stepsLoki = [{ args: { name: 'loki', namespace: kpsLokiNamespace } }];
      const resultUninstallLoki = await this.sudoryService.postSudoryService(
        nameLoki,
        summaryLoki,
        resourceGroupUuid,
        templateUuidLoki,
        stepsLoki,
        customerAccountKey,
        sudoryChannel,
      );
      console.log('Loki client - uninstalled - ', resourceGroupUuid);
    }

    try {
      return await DB.sequelize.transaction(async t => {
        // 1. MetricMeta, MetricReceived
        const deleteData = { deletedAt: new Date() };
        const findMetricMeta: IMetricMeta = await this.metricMeta.findOne({ where: { resourceGroupUuid: resourceGroupUuid, deletedAt: null } });

        if (findMetricMeta) {
          const resultDeleteMetricReceived = await this.metricReceived.update(deleteData, {
            where: { metricMetaKey: findMetricMeta.metricMetaKey },
            transaction: t,
          });
          const resultDeleteMetricMeta = await this.metricMeta.update(deleteData, {
            where: { resourceGroupUuid: resourceGroupUuid },
            transaction: t,
          });
          console.log('metric deleted - ', resourceGroupUuid);
        }
        // 2. Resource, PartyResource, SubscribedProduct, AnomalyMonitoringTarget
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
        let resourceKey = {};

        for (let i = 0; i < getResource.length; i++) {
          resourceKey = Object.assign(resourceKey, getResource[i].resourceKey);
        }

        const queryIn = {
          where: { resourceKey: { [Op.in]: resourceKey } },
          transaction: t,
        };

        console.log(deleteData);
        console.log(queryIn);
        const deleteResultPartyResource = await this.partyResource.update(deleteData, queryIn);
        console.log('PartyResource deleted - ', resourceGroupUuid);
        const deleteResultSubscribedProduct = await this.subscribedProduct.update(deleteData, queryIn);
        console.log('SubscribedProduct deleted - ', resourceGroupUuid);
        const deleteResultAnomalyTarget = await this.anomalyTarget.update(deleteData, queryIn);
        console.log('AnomalyTarget deleted - ', resourceGroupUuid);

        const updatedResource = {
          resourceActive: false,
          deletedAt: new Date(),
        };
        const queryT = {
          where: {
            resourceGroupKey: findResourceGroup.resourceGroupKey,
            deletedAt: null,
            resourceActive: true,
          },
          transaction: t,
        };
        const deleteResultResource = await this.resource.update(updatedResource, queryT);
        console.log('Resource deleted - ', resourceGroupUuid);

        // 3. ResourceGroup
        const resultResourceGroup = await this.resourceGroup.update(deleteData, { where: { resourceGroupUuid: resourceGroupUuid }, transaction: t });
        if (!resultResourceGroup) throw new HttpException(500, `Issue on deleting ResourceGroup ${resourceGroupUuid}`);
        console.log('ResourceGroup deleted- ', resourceGroupUuid);

        // 4. Billing Interface- To Be Coded

        // 5. scheduler
        const resultCancelScheduler = await this.schedulerService.cancelCronScheduleByResourceGroupUuid(resourceGroupUuid);
        console.log('Scheduler - cancalled - ', resourceGroupUuid);

        // 6. AlertRule, AlertReceived
        const findAlertRule: IAlertRule[] = await this.alertRule.findAll({ where: { resourceGroupUuid: resourceGroupUuid } });
        if (!findAlertRule) {
          console.log('no alert rules');
        } else {
          let alertRuleKey = {};
          for (let i = 0; i < findAlertRule.length; i++) {
            alertRuleKey = Object.assign(alertRuleKey, findAlertRule[i].alertRuleKey);
          }
          const queryIn = {
            where: {
              alertRuleKey: { [Op.in]: alertRuleKey },
            },
            transaction: t,
          };
          const deleteAlertReceived = await this.alertReceived.update(deleteData, queryIn);
          const deleteAlertRule = await this.alertRule.update(deleteData, { where: { resourceGroupUuid: resourceGroupUuid }, transaction: t });
        }
        console.log('alert deleted - ', resourceGroupUuid);

        //7. sudoryclient?
        const executorServerUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathService;
        const nameSudoryClient = 'sudory uninstall';
        const summarySudoryClient = 'sudory uninstall';
        const helmUninstallTemplateUuid = '20000000000000000000000000000002';
        const steps = [{ args: { name: 'sudory', namespace: sudoryNamespace } }];
        const on_completion = parseInt(config.sudoryApiDetail.service_result_delete);
        const scheduleFromSudoryClient = new Date().toISOString();
        const currentTime = new Date();
        currentTime.setMinutes(currentTime.getMinutes() + 12);
        const scheduleToSudoryClient = currentTime.toISOString();
        const uninstallSudoryClient = {
          name: nameSudoryClient,
          summary: summarySudoryClient,
          apiUrl: executorServerUrl,
          apiType: 'POST',
          apiBody: {
            name: nameSudoryClient,
            summary: summarySudoryClient,
            template_uuid: helmUninstallTemplateUuid,
            cluster_uuid: resourceGroupUuid,
            on_completion: on_completion,
            steps: steps,
            subscribed_channel: sudoryChannel,
          },
          cronTab: '*/5 * * * *',
          clusterId: resourceGroupUuid,
          scheduleFrom: scheduleFromSudoryClient,
          scheduleTo: scheduleToSudoryClient,
          reRunRequire: false,
        };
        console.log('sudory uninstall scheduler data map:', uninstallSudoryClient);
        const resultCreateSchedulerDeleteClient = await this.schedulerService.createScheduler(uninstallSudoryClient, customerAccountId);

        console.log('sudory client - uninstalled - ', resourceGroupUuid);

        //8. sudoryserver?
        const executeServerClusterUrl = config.sudoryApiDetail.baseURL + config.sudoryApiDetail.pathCreateCluster + '/' + resourceGroupUuid;
        const nameSudoryCluster = 'Delete Sudory Cluster';
        const summarySudoryCluster = 'Delete Sudory Cluster';

        const currentTimeCluster = new Date();
        currentTimeCluster.setMinutes(currentTimeCluster.getMinutes() + 20);
        const schedulefromSudoryCluster = currentTimeCluster.toISOString();

        const currentTimeClusterTo = new Date();
        currentTimeClusterTo.setMinutes(currentTimeClusterTo.getMinutes() + 32);
        const scheduleToSudoryCluster = currentTimeClusterTo.toISOString();

        const deleteSudoryCluster = {
          name: nameSudoryCluster,
          summary: summarySudoryCluster,
          apiUrl: executeServerClusterUrl,
          apiType: 'DELETE',
          apiBody: {},
          cronTab: '*/10 * * * *',
          clusterId: resourceGroupUuid,
          scheduleFrom: schedulefromSudoryCluster,
          scheduleTo: scheduleToSudoryCluster,
          reRunRequire: false,
        };

        console.log('sudory - delete cluster data map:', uninstallSudoryClient);
        const resultCreateSchedulerDeleteCluster = await this.schedulerService.createScheduler(deleteSudoryCluster, customerAccountId);

        //9. Customer Notification (To Be Coded)

        //10. return
        return resultResourceGroup;
      });
    } catch (err) {
      console.log(err);
      throw new HttpException(500, 'Unknown error while deleting cluster');
    }
  }

  /**
   * @param  {string} resourceGroupUuid
   */

  public async getObservabilityResourcesByResourceGroupUuid(resourceGroupUuid: string): Promise<object> {
    const appName = 'app.kubernetes.io/name';
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
    const resultServiceSearch = await this.resource.findOne({
      where: { resourceName: grafanaServiceName, resourceType: 'SV', resourceGroupKey: resourceGroupKey, deletedAt: null },
    });
    const grafanaName = resultServiceSearch.resourceLabels[appName];
    const grafanaSvcName = resultServiceSearch.resourceName;
    const grafanaSvcId = resultServiceSearch.resourceId;

    //search PVC
    const resultPvcSearch = await this.resource.findOne({
      where: {
        deletedAt: null,
        resourceType: 'PC',
        resourceGroupKey: resourceGroupKey,
        resourceLabels: {
          '"app.kubernetes.io/name"': grafanaName,
        },
      },
    });

    let grafanaPvcName;
    let grafanaPvcId;
    let grafanaPvName;
    let grafanaPvId;

    if (resultPvcSearch) {
      grafanaPvcName = resultPvcSearch.resourceName;
      grafanaPvcId = resultPvcSearch.resourceId;

      //search PV
      const resultPvSearch = await this.resource.findOne({
        where: {
          deletedAt: null,
          resourceType: 'PV',
          resourceGroupKey: resourceGroupKey,
          resourcePvClaimRef: {
            name: grafanaPvcName,
          },
        },
      });
      grafanaPvName = resultPvSearch.resourceName;
      grafanaPvId = resultPvSearch.resourceId;
    }
    //2. Prometheus
    const prometheusServiceName = resourceGroupPrometheus.substring(7, resourceGroupPrometheus.indexOf('.'));
    //search Service
    const resultPrometheusServiceSearch = await this.resource.findOne({
      where: { resourceName: prometheusServiceName, resourceType: 'SV', resourceGroupKey: resourceGroupKey, deletedAt: null },
    });
    let prometheusName = resultPrometheusServiceSearch.resourceSpec['selector'];
    prometheusName = prometheusName[appName];
    const prometheusSvcName = resultPrometheusServiceSearch.resourceName;
    const prometheusSvcId = resultPrometheusServiceSearch.resourceId;

    //search PVC
    const resultPrometheusPvcSearch = await this.resource.findOne({
      where: {
        deletedAt: null,
        resourceType: 'PC',
        resourceGroupKey: resourceGroupKey,
        resourceLabels: {
          '"app.kubernetes.io/name"': prometheusName,
        },
      },
    });
    console.log(resultPrometheusPvcSearch);
    let prometheusPvcName;
    let prometheusPvcId;
    let prometheusPvName;
    let prometheusPvId;

    if (resultPrometheusPvcSearch) {
      prometheusPvcName = resultPrometheusPvcSearch.resourceName;
      prometheusPvcId = resultPrometheusPvcSearch.resourceId;

      //search PV
      const resultPrometheusPvSearch = await this.resource.findOne({
        where: {
          deletedAt: null,
          resourceType: 'PV',
          resourceGroupKey: resourceGroupKey,
          resourcePvClaimRef: {
            name: prometheusPvcName,
          },
        },
      });
      prometheusPvName = resultPrometheusPvSearch.resourceName;
      prometheusPvId = resultPrometheusPvSearch.resourceId;
    }
    const result = {
      resourceGroupuuid: resourceGroupUuid,
      grafanaSvcName: grafanaSvcName,
      grafanaSvcId: grafanaSvcId,
      grafanaPvcName: grafanaPvcName || '',
      grafanaPvcId: grafanaPvcId || '',
      grafanaPvName: grafanaPvName || '',
      grafanaPvId: grafanaPvId || '',
      prometheusSvcName: prometheusSvcName || '',
      prometheusSvcId: prometheusSvcId || '',
      prometheusPvcName: prometheusPvcName || '',
      prometheusPvcId: prometheusPvcId || '',
      prometheusPvName: prometheusPvName || '',
      prometheusPvId: prometheusPvId || '',
    };

    return result;
  }
}
export default ResourceGroupService;
