import DB from '@/database';
import {IResource, IResourceTargetUuid} from '@/common/interfaces/resource.interface';
import {IRquestMassUploaderMongo} from '@/common/interfaces/massUploader.interface';
import {ResourceDetailQueryDTO, ResourceDto} from '../dtos/resource.dto';
import {HttpException} from '@/common/exceptions/HttpException';
import {isEmpty} from '@/common/utils/util';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import {IResourceGroup} from '@/common/interfaces/resourceGroup.interface';
//import { ICustomerAccount } from '@/common/interfaces/customerAccount.interface';
import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';
import ResourceGroupService from '@/modules/Resources/services/resourceGroup.service';
import {Op} from 'sequelize';
import {IAnomalyMonitoringTarget} from '@/common/interfaces/monitoringTarget.interface';
import {ResourceGroupModel} from '../models/resourceGroup.model';

class ResourceService {
  public resource = DB.Resource;
  public resourceGroup = DB.ResourceGroup;
  public anomalyTarget = DB.AnomalyMonitoringTarget;
  public partyResource = DB.PartyResource;
  public subscribedProduct = DB.SubscribedProduct;
  public TableIdService = new TableIdService();
  public customerAccountService = new CustomerAccountService();
  public resourceGroupService = new ResourceGroupService();

  /**
   * @param  {ResourceDto} resourceData
   * @param  {string} currentUserId
   * @param  {number} customerAccountKey
   */
  public async createResource(resourceData: ResourceDto, currentUserId: string, customerAccountKey: number): Promise<IResource> {
    if (isEmpty(resourceData)) throw new HttpException(400, 'Resource  must not be empty');

    const currentResourceGroup: IResourceGroup = await this.resourceGroup.findOne({ where: { resourceGroupId: resourceData.resourceGroupId } });

    if (!currentResourceGroup) {
      throw new HttpException(400, 'resourceGroupId not found');
    }

    try {
      //const tableIdTableName = 'Resource';
      //const responseTableIdData: IResponseIssueTableIdDto = await this.TableIdService.issueTableId(tableIdTableName);
      const uuid = require('uuid');
      const apiId = uuid.v1();

      const createResource: IResource = await this.resource.create({
        //resourceId: responseTableIdData.tableIdFinalIssued,
        resourceId: apiId,
        createdBy: currentUserId,
        customerAccountKey: customerAccountKey,
        resourceStatusUpdatedAt: new Date(),
        resourceGroupKey: currentResourceGroup.resourceGroupKey,
        ...resourceData,
      });
      return createResource;
    } catch (error) {
      throw new HttpException(500, error);
    }
  }

  /**
   * @param {number} customerAccountKey
   * @returns Promise
   */
  public async getAllResources(customerAccountKey: number, query: any): Promise<IResource[]> {
    const { resourceType, resourceAnomalyMonitor } = query;
    const whereCondition = { deletedAt: null, customerAccountKey };
    if (resourceType) {
      whereCondition['resourceType'] = resourceType;
    }
    if (resourceAnomalyMonitor) {
      whereCondition['resourceAnomalyMonitor'] = resourceAnomalyMonitor;
    }
    const allResource: IResource[] = await this.resource.findAll({
      where: whereCondition,
      attributes: { exclude: ['resourceKey', 'deletedAt'] },
    });

    return allResource;
  }

  /**
   * @param {number} customerAccountKey
   * @returns Promise
   */
  public async getAllResourcesRbac(customerAccountKey: number): Promise<IResource[]> {
    const allResource: IResource[] = await this.resource.findAll({
      where: {
        deletedAt: null,
        customerAccountKey,
        resourceRbac: true,
      },
      attributes: { exclude: ['deletedAt'] },
      include: [
        {
          model: this.resourceGroup,
          attributes: ['resourceGroupName', 'resourceGroupId'],
        },
      ],
    });

    return allResource;
  }

  /**
   * @param  {string} resourceType
   * @param  {number} resourceGroupKey
   * @param  {number} customerAccountKey
   */
  public async getResourceForMass(resourceType: string, resourceGroupKey: number, customerAccountKey: number): Promise<IResourceTargetUuid[]> {
    const allResource: IResourceTargetUuid[] = await this.resource.findAll({
      where: { resourceType, resourceGroupKey, customerAccountKey, deletedAt: null },
      attributes: ['resourceTargetUuid', 'deletedAt'],
    });

    return allResource;
  }

  /**
   * @param  {string} resourceId
   */
  public async getResourceById(resourceId: string): Promise<IResource> {
    const resource: IResource = await this.resource.findOne({
      where: { resourceId },
      attributes: { exclude: ['resourceKey', 'deletedAt'] },
      raw: true,
    });
    return resource;
  }

  /**
   * @param  {string} resourceId
   */
  public async getResourceKeyById(resourceId: string): Promise<number> {
    const resource: IResource = await this.resource.findOne({
      where: { resourceId },
      attributes: { exclude: ['deletedAt'] },
    });

    return resource.resourceKey;
  }

  /**
   * @param  {string} resourceId
   */
  public async getUserResourceById(customerAccountKey: number, resourceId: string): Promise<IResource> {
    const resource: IResource = await this.resource.findOne({
      where: { resourceId, customerAccountKey },
      attributes: { exclude: ['deletedAt'] },
    });

    return resource;
  }

  /**
   * @param  {string} resourceIds
   */
  public async getUserResourceByIds(customerAccountKey: number, resourceIds: string[]): Promise<IResource[]> {
    const resource: IResource[] = await this.resource.findAll({
      where: { resourceId: resourceIds, customerAccountKey },
      attributes: { exclude: ['deletedAt'] },
    });

    return resource;
  }

  /**
   * @param  {string} resourceId
   * @param  {ResourceDto} resourceData
   * @param  {string} currentUserId
   */
  public async updateResourceById(resourceId: string, resourceData: ResourceDto, currentUserId: string): Promise<IResource> {
    if (isEmpty(resourceData)) throw new HttpException(400, 'Resource  must not be empty');

    const findResource: IResource = await this.resource.findOne({ where: { resourceId: resourceId } });

    if (!findResource) throw new HttpException(400, "Resource  doesn't exist");

    const updatedResource = {
      ...resourceData,
      updatedBy: currentUserId,
    };

    try {
      await this.resource.update(updatedResource, { where: { resourceId: resourceId } });
    } catch (error) {
      throw new HttpException(400, error);
    }

    return this.getResourceById(resourceId);
  }

  /**
   * @param  {ResourceDto} resourceDetailData
   */
  public async getResourceDetail(resourceDetailData: ResourceDetailQueryDTO): Promise<IResource> {
    if (isEmpty(resourceDetailData)) throw new HttpException(400, 'Resource  must not be empty');

    const findResourceGroup: IResourceGroup = await this.resourceGroup.findOne({
      attributes: ['resourceGroupKey'],
      where: {
        resourceGroupUuid: resourceDetailData.resourceGroupUuid,
      },
    });

    if (!findResourceGroup) {
      throw new HttpException(404, "ResourceGroup with resourceGroupUuid doesn't exist");
    }

    let extraWhere = {};

    if (resourceDetailData.resourceNamespace) {
      extraWhere = {
        resourceNamespace: resourceDetailData.resourceNamespace,
      };
    }

    const findResource: IResource = await this.resource.findOne({
      where: {
        resourceName: resourceDetailData.resourceName,
        resourceType: resourceDetailData.resourceType,
        resourceGroupKey: findResourceGroup.resourceGroupKey,
        deletedAt: null,

        // NOTE: Temporarily ignoring namespace due to ticket: http://147.182.254.250/redmine/issues/88
        // ...extraWhere,
      },
      attributes: { exclude: ['deletedAt', 'resourceKey', 'resource_group_key'] },
      include: [{ model: ResourceGroupModel, attributes: ['resourceGroupId'] }],
    });
    if (!findResource) throw new HttpException(404, "Resource  doesn't exist");

    return findResource;
  }

  /**
   * @param  {string} resourceType
   * @param  {number} customerAccountId
   */
  public async getResourceByTypeCustomerAccountId(resourceType: string[], customerAccountId: string): Promise<IResource[]> {
    const resultCustomerAccount = await this.customerAccountService.getCustomerAccountKeyById(customerAccountId);
    const customerAccountKey = resultCustomerAccount.customerAccountKey;

    const resourceWhereCondition = { deletedAt: null, customerAccountKey, resourceType: resourceType,};

    const allResources: IResource[] = await this.resource.findAll({
      where: resourceWhereCondition,
    });

    return allResources;
  }

  /**
   * @param  {number} customerAccountId
   * @param  {any} query
   */
  public async getVMListByCustomerAccountId(customerAccountId: string, query?: any): Promise<IResource[]> {
    const resultCustomerAccount = await this.customerAccountService.getCustomerAccountKeyById(customerAccountId);
    const customerAccountKey = resultCustomerAccount.customerAccountKey;

    const resourceWhereCondition = { deletedAt: null, customerAccountKey, resourceType: "VM",};

    if (query?.resourceGroupId) {
      let resourceGroups = await this.resourceGroupService.getResourceGroupByIds(query.resourceGroupId)
      resourceWhereCondition['resourceGroupKey'] = resourceGroups?.map((resourceGroup: IResourceGroup) => resourceGroup.resourceGroupKey)
    }

    const vms: IResource[] = await this.resource.findAll({
      where: resourceWhereCondition,
      attributes: { exclude: ['resourceKey', 'deletedAt'] },
    });

    const vmsWithDetails = [];
    for (let i = 0; i < vms.length; i ++) {
      // get resourceGroup
      vms[i].resourceSpec.rg = await this.resourceGroupService.resourceGroup.findOne({
        attributes: ['resourceGroupId', 'resourceGroupName'],
        where: {resourceGroupKey: vms[i].resourceGroupKey}
      })

      vmsWithDetails.push(await this.getVMDetails(vms[i]))
    }

    return vmsWithDetails;
  }

  /**
   * @param  {number} customerAccountId
   * @param  {any} query
   */
  public async getPMListByCustomerAccountId(customerAccountId: string, query?: any): Promise<IResource[]> {
    const resultCustomerAccount = await this.customerAccountService.getCustomerAccountKeyById(customerAccountId);
    const customerAccountKey = resultCustomerAccount.customerAccountKey;

    const resourceWhereCondition = { deletedAt: null, customerAccountKey, resourceType: ["PM", "VM"],};

    if (query?.resourceGroupId) {
      let resourceGroups = await this.resourceGroupService.getResourceGroupByIds(query.resourceGroupId)
      resourceWhereCondition['resourceGroupKey'] = resourceGroups?.map((resourceGroup: IResourceGroup) => resourceGroup.resourceGroupKey)
    }

    const resultList: IResource[] = await this.resource.findAll({
      where: resourceWhereCondition,
      attributes: { exclude: ['resourceKey', 'deletedAt'] },
    });

    let pms = resultList.filter(pm => pm.resourceType === "PM")
    let vms = resultList.filter(pm => pm.resourceType === "VM")

    for (let i = 0; i < pms.length; i++) {
      // get resourceGroup
      pms[i].resourceSpec.rg = await this.resourceGroupService.resourceGroup.findOne({
        attributes: ['resourceGroupId', 'resourceGroupName'],
        where: {resourceGroupKey: pms[i].resourceGroupKey}
      })

      let vmsInPM = [];

      for (let j = 0; j < vms.length; j++) {
        if (pms[i].resourceTargetUuid === vms[j].parentResourceId) {
          vmsInPM.push(await this.getVMDetails(vms[j]))
        }
      }

      pms[i].resourceSpec.vms = vmsInPM
    }

    return pms;
  }

  /**
   * @param  {number} customerAccountId
   * @param  {any} query
   */
  public async getPJListByCustomerAccountId(customerAccountId: string, query?: any): Promise<IResource[]> {
    const resultCustomerAccount = await this.customerAccountService.getCustomerAccountKeyById(customerAccountId);
    const customerAccountKey = resultCustomerAccount.customerAccountKey;

    const resourceWhereCondition = { deletedAt: null, customerAccountKey, resourceType: ['PJ', 'PM', 'VM'],};

    if (query?.resourceGroupId) {
      let resourceGroups = await this.resourceGroupService.getResourceGroupByIds(query.resourceGroupId)
      resourceWhereCondition['resourceGroupKey'] = resourceGroups?.map((resourceGroup: IResourceGroup) => resourceGroup.resourceGroupKey)
    }

    const resultList: IResource[] = await this.resource.findAll({
      where: resourceWhereCondition,
      attributes: { exclude: ['resourceKey', 'deletedAt'] },
    });

    const projects = resultList.filter(pj => pj.resourceType === "PJ")
    const allPms = resultList.filter(pm => pm.resourceType === "PM")
    const allVms = resultList.filter(vm => vm.resourceType === "VM")

    for (let i = 0; i < projects.length; i++) {
      // get resourceGroup
      projects[i].resourceSpec.rg = await this.resourceGroupService.resourceGroup.findOne({
        attributes: ['resourceGroupId', 'resourceGroupName'],
        where: {resourceGroupKey: projects[i].resourceGroupKey}
      })

      // get vms in projects
      const vms = allVms.map(vm => {
        if (projects[i].resourceTargetUuid === vm.resourceNamespace) {
          return vm
        }
      }).filter(n => n !== undefined)

      let vmsInProject = [];
      for (let j = 0; j < vms.length; j++) {
        vmsInProject.push(await this.getVMDetails(vms[j]))
      }

      projects[i].resourceSpec.vms = vmsInProject

      // get pms in project (by vms)
      // get pm uuids in vms
      let pmUUIDs = [... new Set(vmsInProject.map(vm => {return vm.parentResourceId}))]
      const pms = allPms.map(pm => {
        if (pmUUIDs.indexOf(pm.resourceTargetUuid) !== -1) {
          return pm
        }
      }).filter(n => n !== undefined)

      let pmsInProject = [];
      for (let j = 0; j < pms.length; j++) {
        pmsInProject.push(await this.getPMDetails(pms[j]))
      }

      projects[i].resourceSpec.pms = pmsInProject
    }

    return projects;
  }

  public async getVMDetails(vm: IResource): Promise<IResource> {
    const resourceGroupKey = vm.resourceGroupKey;

    let PM = await this.resource.findOne({
      attributes: ['resourceName'],
      where: {
        deletedAt: null,
        resourceType: "PM",
        resourceGroupKey: resourceGroupKey,
        resourceTargetUuid: vm.parentResourceId
      },
    });

    if (!PM) {
      vm.resourceSpec.PMName = "unknown"
    } else {
      vm.resourceSpec.PMName = PM.resourceName
    }

    let project = await this.resource.findOne({
      attributes: ['resourceName'],
      where: {
        deletedAt: null,
        resourceType: "PJ",
        resourceGroupKey: resourceGroupKey,
        resourceTargetUuid: vm.resourceNamespace
      },
    });

    if (!project) {
      vm.resourceSpec.projectName = "unknown"
    } else {
      vm.resourceSpec.projectName = project.resourceName
    }

    return vm
  }

  public async getPMDetails(pm: IResource): Promise<IResource> {
    const resourceGroupKey = pm.resourceGroupKey;

    let vms = await this.resource.findAll({
      where: {
        deletedAt: null,
        resourceType: "VM",
        resourceGroupKey: resourceGroupKey,
        parentResourceId: pm.resourceTargetUuid
      },
      attributes: { exclude: ['resourceKey', 'deletedAt'] },
    });

    // pm 별 vm의 정보
    const resultVms = [];
    for (let i = 0; i < vms.length; i++) {
      resultVms.push(await this.getVMDetails(vms[i]))
    }

    pm.resourceSpec.vms = resultVms
    return pm
  }

  /**
   * @param  {string} resourceId
   * @param  {number} customerAccountKey
   */
  public async getResourceByTypeCustomerAccountKeyResourceId(resourceId: string, customerAccountKey: number): Promise<IResource> {
    const resourceWhereCondition = { deletedAt: null, customerAccountKey, resourceId: resourceId,};

    const resource: IResource = await this.resource.findOne({
      where: resourceWhereCondition,
      attributes: { exclude: ['resourceKey', 'deletedAt'] },
    });

    // get resourceGroup
    resource.resourceSpec.rg = await this.resourceGroupService.resourceGroup.findOne({
      attributes: ['resourceGroupId', 'resourceGroupName'],
      where: {resourceGroupKey: resource.resourceGroupKey}
    })

    switch (resource.resourceType) {
      case "VM":
        return await this.getVMDetails(resource)

      case "PM":
        let vms = await this.resource.findAll({
          where: {
            deletedAt: null,
            resourceType: "VM",
            resourceGroupKey: resource.resourceGroupKey,
            parentResourceId: resource.resourceTargetUuid
          },
          attributes: { exclude: ['resourceKey', 'deletedAt'] },
        });

        const vmsInPM = [];
        for (let i = 0; i < vms.length; i ++) {
          vmsInPM.push(await this.getVMDetails(vms[i]))
        }

        resource.resourceSpec.vms = vmsInPM

        break

      case "PJ":
        // get VM info from PJ
        let resultList = await this.resource.findAll({
          where: {
            deletedAt: null,
            resourceType: ['VM', 'PM'],
            resourceGroupKey: resource.resourceGroupKey,
          },
          attributes: { exclude: ['resourceKey', 'deletedAt'] },
        })

        let pList = resultList.filter(pm => pm.resourceType === "PM")
        let vList = resultList.filter(vm => (vm.resourceType === "VM" && vm.resourceNamespace === resource.resourceName))

        let vmsInProject = [];
        for (let i = 0; i < vList.length; i++) {
          vmsInProject.push(await this.getVMDetails(vList[i]))
        }

        resource.resourceSpec.vms = vmsInProject
        // get PM info in project

        // find vms group by pm_id
        // get pms in project (by vms)
        let pmUUIDs = [... new Set(vmsInProject.map(vm => {return vm.parentResourceId}))]
        let pmList = pList.map(pm => {
          if (pmUUIDs.indexOf(pm.resourceTargetUuid) !== -1) {
            return pm
          }
        }).filter(n => n !== undefined)

        // get pm uuids in vms
        let pmsInProject = [];
        for (let i = 0; i < pmList.length; i++) {
          pmsInProject.push(await this.getPMDetails(pmList[i]))
        }

        resource.resourceSpec.pms = pmsInProject
        break

      default:
    }

    return resource;
  }

  /**
   * @param  {string} resourceType
   * @param  {number} customerAccountKey
   */
  public async getResourceCountByResourceType(resourceType: string, customerAccountKey: number, query?: any): Promise<number> {
    const resourceWhereCondition = { deletedAt: null, customerAccountKey, resourceType: resourceType };

    if (query?.resourceGroupId) {
      let resourceGroups = await this.resourceGroupService.getResourceGroupByIds(query.resourceGroupId);
      resourceWhereCondition['resourceGroupKey'] = resourceGroups?.map((resourceGroup: IResourceGroup) => resourceGroup.resourceGroupKey)
      return await this.resource.count({
        where: resourceWhereCondition,
      });
    }

    return await this.resource.count({
      where: resourceWhereCondition,
    });
    ;
  }

  /**
   * @param  {string} resourceType
   * @param  {number} resourceGroupId
   * @param  {any} query
   */
  public async getResourceByTypeResourceGroupIdForMetricOps(resourceType: string[], resourceGroupId: string, query?: any): Promise<IResource[]> {
    const resultResourceGroup = await this.resourceGroupService.getResourceGroupById(resourceGroupId);
    const resourceGroupKey = resultResourceGroup.resourceGroupKey;
    let resourceKeys = [];
    const resourceQuery = this.getResourceQuery(query);
    const allMonitoringTarget: IAnomalyMonitoringTarget[] = await this.anomalyTarget.findAll({
      where: { deletedAt: null },
      attributes: ['resourceKey'],
      raw: true,
    });
    if (allMonitoringTarget) {
      resourceKeys = this.uniqueData(allMonitoringTarget);
    }

    console.log(query, resourceQuery);

    const allResources: IResource[] = await this.resource.findAll({
      where: {
        deletedAt: null,
        resourceType,
        resourceGroupKey: resourceGroupKey,
        [Op.and]: [...resourceQuery],
        resourceKey: { [Op.notIn]: resourceKeys },
      },
      include: [{ model: ResourceGroupModel, attributes: ['resourceGroupName'] }],
    });

    return allResources;
  }

  /**
   * @param  {string} resourceType
   * @param  {number} resourceGroupId
   * @param  {any} query
   */
  public async getResourceByTypeResourceGroupId(resourceType: string[], resourceGroupId: string, query?: any): Promise<IResource[]> {
    const resultResourceGroup = await this.resourceGroupService.getResourceGroupById(resourceGroupId);
    const resourceGroupKey = resultResourceGroup.resourceGroupKey;
    const resourceQuery = this.getResourceQuery(query);

    const allResources: IResource[] = await this.resource.findAll({
      where: {
        deletedAt: null,
        resourceType,
        resourceGroupKey: resourceGroupKey,
        [Op.and]: [...resourceQuery],
      },
      include: [{ model: ResourceGroupModel, attributes: ['resourceGroupName'] }],
    });

    return allResources;
  }

  /**
   * @param  {string} resourceGroupUuid
   * @param {string} allReplicasYN
   */
  public async getWorkloadByResourceGroupUuid(resourceGroupUuid: string, allReplicasYN: string): Promise<IResource[]> {
    const resultResourceGroup = await this.resourceGroupService.getResourceGroupByUuid(resourceGroupUuid);
    const resourceGroupKey = resultResourceGroup.resourceGroupKey;
    let query;
    if (allReplicasYN === 'Y') {
      query = {
        where: {
          deletedAt: null,
          resourceLevel4: 'WL',
          resourceGroupKey: resourceGroupKey,
        },
        //include: [{ model: ResourceGroupModel, attributes: ['resourceGroupName'] }],
        order: [['resourceLevel3', 'DESC']],
      };
    } else {
      query = {
        where: {
          [Op.or]: [
            {
              resourceReplicas: { [Op.is]: null },
            },
            {
              resourceReplicas: { [Op.ne]: 0 },
            },
          ],
          deletedAt: null,
          resourceLevel4: 'WL',
          resourceGroupKey: resourceGroupKey,
        },
        //include: [{ model: ResourceGroupModel, attributes: ['resourceGroupName'] }],
        order: [['resourceLevel3', 'DESC']],
      };
    }

    const allResources: IResource[] = await this.resource.findAll(query);

    return allResources;
  }

  /**
   * @param  {string} resourceType
   * @param  {number} resourceGroupId
   */

  public async getResourceInNamespaceByTypeResourceGroupId(resourceType: string, resourceGroupId: string): Promise<IResource[]> {
    const resultResourceGroup = await this.resourceGroupService.getResourceGroupById(resourceGroupId);
    const resourceGroupKey = resultResourceGroup.resourceGroupKey;
    const returnResources = [];
    const distinctiveNamespace = await this.resource.findAll({
      attributes: ['resourceNamespace'],
      group: ['resourceNamespace'],
      where: { resourceGroupKey: resourceGroupKey, deletedAt: null, resourceType: resourceType },
    });

    if (!distinctiveNamespace) {
      throw new HttpException(404, `No namespace information with the resourceGroup: ${resourceGroupId}`);
    }

    const allResources: IResource[] = await this.resource.findAll({
      where: {
        deletedAt: null,
        resourceType,
        resourceGroupKey: resourceGroupKey,
      },
      attributes: ['resourceName', 'resourceInstance', 'resourceNamespace', 'resourceType', 'resourceId', 'resourceTargetCreatedAt'],
    });

    for (let i = 0; i < distinctiveNamespace.length; i++) {
      returnResources[i] = {
        resourceNamespace: distinctiveNamespace[i].resourceNamespace,
        resources: allResources.filter(res => res.resourceNamespace === distinctiveNamespace[i].resourceNamespace),
      };
      /*
        let allResources: IResource[] = await this.resource.findAll({
          where: {
            deletedAt: null,
            resourceType,
            resourceGroupKey: resourceGroupKey,
            resourceNamespace: distinctiveNamespace[i].resourceNamespace,
          },
        })
        returnResources[i] = {resourceNamespace: distinctiveNamespace[i].resourceNamespace, data: allResources}
*/
    }

    //  return distinctiveNamespace;
    return returnResources;
    //    return allResources;
  }

  public uniqueData = (arrayData: any) => {
    const resourseKeys = [];
    for (let i = 0; i < arrayData.length; i++) {
      resourseKeys.push(arrayData[i].resourceKey);
    }
    return [...new Set(resourseKeys)];
  };

  /**
   * generates sequelize query object to query resource more efficiently
   *
   * @param  {any} query
   */
  private getResourceQuery(query: any) {
    const generatedQuery: any[] = [];

    if (query.searchResourceName && query.searchResourceValue) {
      generatedQuery.push({
        [query.searchResourceName]: query.searchResourceValue,
      });
    }

    if (!query.allReplicasYN || query.allReplicasYN === 'N') {
      generatedQuery.push({
        [Op.or]: [
          {
            resourceReplicas: { [Op.is]: null },
          },
          {
            resourceReplicas: { [Op.ne]: 0 },
          },
        ],
      });
    }

    if (query.excludeFailed === true) {
      generatedQuery.push({
        [Op.or]: [
          {
            resourcePodPhase: {
              [Op.eq]: null,
            },
          },
          {
            resourcePodPhase: {
              [Op.ne]: 'Failed',
            },
          },
          {
            resourcePodPhase: {
              [Op.eq]: 'Running',
            },
          },
          {
            resourcePodPhase: {
              [Op.eq]: 'Active',
            },
          },
          {
            resourceStatus: {
              phase: {
                [Op.eq]: 'Active',
              },
            },
          },
        ],
      });
    }

    return generatedQuery;
  }

  /**
   * @param  {object} resourceTargetUuid
   * @param  {string} resoruceType
   */
  public async retireResourceByUuidNotIn(resourceTargetUuid: object, resourceType: string, resourceGroupUuid: string): Promise<Object> {
    if (isEmpty(resourceTargetUuid)) throw new HttpException(400, 'ResourceTargetUuid must not be empty');
    if (isEmpty(resourceGroupUuid)) throw new HttpException(400, 'ResourceGroupUuid must not be empty');
    if (isEmpty(resourceType)) throw new HttpException(400, 'ResourceType must not be empty');

    const getResourcegroup: IResourceGroup = await this.resourceGroupService.getResourceGroupByUuid(resourceGroupUuid);
    if (!getResourcegroup) {
      throw new HttpException(400, `can't find resourcegroup with resourcegroupuuid ${resourceGroupUuid}`);
    }

    const deleted_At = new Date();
    const notInQuery = {
      where: {
        resourceTargetUuid: { [Op.notIn]: resourceTargetUuid },
        resourceGroupKey: getResourcegroup.resourceGroupKey,
        resourceType: resourceType,
        resourceActive: true,
      },
    };
    const updatedResource = {
      resourceActive: false,
      updatedBy: 'SYSTEM',
      updatedAt: deleted_At,
      deletedAt: deleted_At,
    };
    let returnResult;

    try {
      const updateResult = await this.resource.update(updatedResource, notInQuery);
      returnResult = updateResult;
    } catch (error) {
      throw new HttpException(500, error);
    }

    return returnResult;
  }

  /**
   * @param  {IRquestMassUploaderMongo} updateRequest
   */
  public async updateResourceByMongoUploader(updateRequest: IRquestMassUploaderMongo): Promise<String> {
    if (isEmpty(updateRequest)) throw new HttpException(400, 'ResourceTargetUuid must not be empty');

    const updatedResource = {
      resourceNamespace: updateRequest.resource_Namespace,
      updatedBy: 'SYSTEM',
      updatedAt: new Date(),
      resourceStatusUpdatedAt: updateRequest.resource_Status_Updated_At,
      resourceInstance: updateRequest.resource_Instance,
      resourceLabels: updateRequest.resource_Labels,
      resourceAnnotations: updateRequest.resource_Annotations,
      resourceSpec: updateRequest.resource_Spec,
      resourceStatus: updateRequest.resource_Status,
      resourceEndpoint: updateRequest.resource_Endpoint,
      resourcePodPhase: updateRequest.resource_Pod_Phase,
      resourcePodContainer: updateRequest.resource_Pod_Container,
      resourcePodVolume: updateRequest.resource_Pod_Volume,
      resourceOwnerReferences: updateRequest.resource_Owner_References,
      resourceReplicas: updateRequest.resource_Replicas,
      resourceStsvolumeClaimTemplates: updateRequest.resource_Sts_volume_Claim_Templates,
      resourcePvcStorage: updateRequest.resource_Pvc_Storage,
      resourcePvcVolumneName: updateRequest.resource_Pvc_Volumne_Name,
      resourcePvcStorageClassName: updateRequest.resource_Pvc_Storage_Class_Name,
      resourcePvcVolumeMode: updateRequest.resource_Pvc_Volume_Mode,
      resourceConfigmapData: updateRequest.resource_Configmap_Data,
      resourceIngressClass: updateRequest.resource_Ingress_Class,
      resourceIngressRules: updateRequest.resource_Ingress_Rules,
      resourcePvStorage: updateRequest.resource_Pv_Storage,
      resourcePvClaimRef: updateRequest.resource_Pv_Claim_Ref,
      resorucePvStorageClassName: updateRequest.resoruce_Pv_Storage_Class_Name,
      resourcePvVolumeMode: updateRequest.resource_Pv_Volume_Mode,
      resourceScProvisioner: updateRequest.resource_Sc_Provisioner,
      resourceScReclaimPolicy: updateRequest.resource_Sc_Reclaim_Policy,
      resourceScAllowVolumeExpansion: updateRequest.resource_Sc_Allow_Volume_Expansion,
      resourceScVolumeBindingMode: updateRequest.resource_Sc_Volume_Binding_Mode,
    };

    try {
      const updateResult = await this.resource.update(updatedResource, { where: { resourceTargetUuid: updateRequest.resource_Target_Uuid } });
    } catch (error) {
      throw new HttpException(500, error);
    }

    return 'updated well';
  }

  /**
   * @param  {IRquestMassUploaderMongo} resourceData
   * @param  {string} resourceGroupKey
   */
  public async createResourcefromMongoUploader(resourceData: IRquestMassUploaderMongo, resourceGroupKey: string): Promise<Object> {
    if (isEmpty(resourceData)) throw new HttpException(400, 'Resource  must not be empty');

    const currentResourceGroup: IResourceGroup = await this.resourceGroup.findOne({ where: { resourceGroupKey: resourceGroupKey } });

    if (!currentResourceGroup) {
      throw new HttpException(400, 'resourceGroupId not found');
    }
    const uuid = require('uuid');
    const apiId = uuid.v1();

    const resourceInputData = {
      resourceType: resourceData.resource_Type,
      resourceSpec: resourceData.resource_Spec,
      resourceName: resourceData.resource_Name,
      resourceDescription: resourceData.resource_Name,
      resourceNamespace: resourceData.resource_Namespace,
      resourceGroupKey: resourceData.resource_Group_Key,
      customerAccountKey: resourceData.customer_Account_Key,
      resourceRbac: resourceData.resource_Rbac,
      resourceAnomalyMonitor: resourceData.resource_Anomaly_Monitor,
      resourceGroupUuid: resourceData.resource_Group_Uuid,
      resourceTargetUuid: resourceData.resource_Target_Uuid,
      resourceLevel1: resourceData.resource_Level1,
      resourceActive: resourceData.resource_Active,
      resourceStatusUpdatedAt: resourceData.resource_Status_Updated_At,
      resourceTargetCreatedAt: resourceData.resource_Target_Created_At,
      resourceInstance: resourceData.resource_Instance,
      resourceLabels: resourceData.resource_Labels,
      resourceAnnotations: resourceData.resource_Annotations,
      resourceStatus: resourceData.resource_Status,
      resourceEndpoint: resourceData.resource_Endpoint,
      resourceId: apiId,
      createdAt: new Date(),
      createdBy: 'SYSTEM',
      resourcePodPhase: resourceData.resource_Pod_Phase,
      resourcePodContainer: resourceData.resource_Pod_Container,
      resourcePodVolume: resourceData.resource_Pod_Volume,
      resourceOwnerReferences: resourceData.resource_Owner_References,
      resourceReplicas: resourceData.resource_Replicas,
      resourceStsvolumeClaimTemplates: resourceData.resource_Sts_volume_Claim_Templates,
      resourcePvcStorage: resourceData.resource_Pvc_Storage,
      resourcePvcVolumneName: resourceData.resource_Pvc_Volumne_Name,
      resourcePvcStorageClassName: resourceData.resource_Pvc_Storage_Class_Name,
      resourcePvcVolumeMode: resourceData.resource_Pvc_Volume_Mode,
      resourceConfigmapData: resourceData.resource_Configmap_Data,
      resourceIngressClass: resourceData.resource_Ingress_Class,
      resourceIngressRules: resourceData.resource_Ingress_Rules,
      resourcePvStorage: resourceData.resource_Pv_Storage,
      resourcePvClaimRef: resourceData.resource_Pv_Claim_Ref,
      resorucePvStorageClassName: resourceData.resoruce_Pv_Storage_Class_Name,
      resourcePvVolumeMode: resourceData.resource_Pv_Volume_Mode,
      resourceScProvisioner: resourceData.resource_Sc_Provisioner,
      resourceScReclaimPolicy: resourceData.resource_Sc_Reclaim_Policy,
      resourceScAllowVolumeExpansion: resourceData.resource_Sc_Allow_Volume_Expansion,
      resourceScVolumeBindingMode: resourceData.resource_Sc_Volume_Binding_Mode,
    };

    try {
      const createResource = await this.resource.create(resourceInputData);
      return createResource;
    } catch (error) {
      throw new HttpException(500, error);
    }
  }

  /**
   * @param  {object} resourceGroupUuid

   */
  public async deleteResourceByResourceGroupUuid(resourceGroupUuid: string, resourceGroupKey: number): Promise<Object> {
    if (isEmpty(resourceGroupUuid)) throw new HttpException(400, 'ResourceGroupUuid must not be empty');

    const query = {
      where: {
        resourceGroupKey: resourceGroupKey,
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
      where: {
        resourceKey: { [Op.in]: resourceKey },
      },
    };

    const deleteResultPartyResource = await this.partyResource.update({ deletedAt: new Date() }, queryIn);
    const deleteResultSubscribedProduct = await this.subscribedProduct.update({ deletedAt: new Date() }, queryIn);
    const deleteResultAnomalyTarget = await this.anomalyTarget.update({ deletedAt: new Date() }, queryIn);

    const updatedResource = {
      resourceActive: false,
      deletedAt: new Date(),
    };

    const deleteResultResource = await this.resource.update(updatedResource, query);

    console.log(deleteResultPartyResource);
    console.log(deleteResultSubscribedProduct);
    console.log(deleteResultAnomalyTarget);
    console.log(deleteResultResource);

    return deleteResultResource;
  }
}

export default ResourceService;
