import DB from '@/database';
import { IResourceGroup, IResourceGroupUi } from '@/common/interfaces/resourceGroup.interface';
import { IResource, IResourceTargetUuid } from '@/common/interfaces/resource.interface';
import { ResourceGroupDto, ResourceGroupExecutorDto } from '../dtos/resourceGroup.dto';
import { HttpException } from '@/common/exceptions/HttpException';
import { isEmpty } from '@/common/utils/util';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';
import AlertRuleService from '@/modules/Alert/services/alertRule.service';
import MetricMetaService from '@/modules/Metric/services/metricMeta.service';
import SubscriptionsService from '@/modules/Subscriptions/services/subscriptions.service';
import ResourceService from '@/modules/Resources/services/resource.service';

class ResourceGroupService {
  public resourceGroup = DB.ResourceGroup;
  public resource = DB.Resource;
  //public resourceSerivce = new ResourceService();
  public tableIdService = new TableIdService();
  public customerAccountService = new CustomerAccountService();
  public alertRuleService = new AlertRuleService();
  public metricMetaService = new MetricMetaService();
  public subscriptionsService = new SubscriptionsService();
  public resourceService = new ResourceService();

  /**
   * @param  {ResourceGroupDto} resourceGroupData
   * @param  {string} currentUserId
   * @param  {number} customerAccountKey
   */
  public async createResourceGroup(resourceGroupData: ResourceGroupDto, currentUserId: string, customerAccountKey: number): Promise<Object> {
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
  public async deleteResourceGroupByResourceGroupUuid (resourceGroupUuid: string): Promise<object>{

    if (isEmpty(resourceGroupUuid)) throw new HttpException(400, 'ResourceGroupUuid  must not be empty');
    const findResourceGroup: IResourceGroup = await this.resourceGroup.findOne({ where: { resourceGroupUuid: resourceGroupUuid } });
    if (!findResourceGroup) throw new HttpException(400, "ResourceGroup  doesn't exist");

    // 1. AlertRule, AlertReceived
    const resultAlertRule = await this.alertRuleService.deleteAlertRuleByResourceGroupUuid(resourceGroupUuid);
    console.log (resultAlertRule); 

    // 2. MetricMeta, MetricReceived
    const resultMetricMeta = await this.metricMetaService.deleteMetricMetaByResourceGroupUuid(resourceGroupUuid);
    console.log (resultMetricMeta); 

    // 3. Resource, PartyResource, SubscribedProduct, AnomalyMonitoringTarget
    const resultResource = await this.resourceService.deleteResourceByResourceGroupUuid(resourceGroupUuid);
    console.log (resultResource);
    
    // 4. ResourceGroup
    const resultResourceGroup = await this.resourceGroup.update({deletedAt: new Date()}, { where: {resourceGroupUuid: resourceGroupUuid} });
    if (!resultResourceGroup) throw new HttpException(500, `Issue on deleting ResourceGroup ${resourceGroupUuid}`);
    console.log (resultResourceGroup); 
    return resultResourceGroup;
  }


}
export default ResourceGroupService;
