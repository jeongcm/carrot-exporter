import DB from "@/database";
import { IResource, IResourceTargetUuid } from "@/common/interfaces/resource.interface";
import { IRquestMassUploaderMongo } from "@/common/interfaces/massUploader.interface";
import { ResourceDetailQueryDTO, ResourceDto } from "../dtos/resource.dto";
import { HttpException } from "@/common/exceptions/HttpException";
import { isEmpty } from "@/common/utils/util";
import TableIdService from "@/modules/CommonService/services/tableId.service";
import { IResourceGroup, IResourceGroupUi} from "@/common/interfaces/resourceGroup.interface";
//import { ICustomerAccount } from '@/common/interfaces/customerAccount.interface';
import CustomerAccountService from "@/modules/CustomerAccount/services/customerAccount.service";
import ResourceGroupService from "@/modules/Resources/services/resourceGroup.service";
import { Association, Op, QueryTypes } from "sequelize";
import { IAnomalyMonitoringTarget } from "@/common/interfaces/monitoringTarget.interface";
import { ResourceGroupModel } from "../models/resourceGroup.model";
import MetricService, { IMetricQueryBody } from "@modules/Metric/services/metric.service";
import MassUploaderService from "@modules/CommonService/services/massUploader.service";
import { CustomerAccountModel } from "@modules/CustomerAccount/models/customerAccount.model";
import config from '@config/index';
import { PartyUserModel } from "@/modules/Party/models/partyUser.model";

class ResourceService {
  public resource = DB.Resource;
  public resourceGroup = DB.ResourceGroup;
  public customerAccount = DB.CustomerAccount
  public anomalyTarget = DB.AnomalyMonitoringTarget;
  public partyResource = DB.PartyResource;
  public partyUser = DB.PartyUser;
  public subscribedProduct = DB.SubscribedProduct;
  public TableIdService = new TableIdService();
  public customerAccountService = new CustomerAccountService();
  public resourceGroupService = new ResourceGroupService();
  public metricService = new MetricService();
  public massUploaderService = new MassUploaderService();

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

    if (!resource) {
      throw new HttpException(404, 'Not found Resource');
    }
    return resource;
  }

  /**
   * @param  {string} resourceId
   */
  public async getAllStatusResourceById(resourceId: string): Promise<IResource> {
    const resource: IResource = await this.resource.findOne({
      where: { resourceId },
      include: [
        {
          model: ResourceGroupModel,
          required: true,
        },
      ],
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

    const resourceWhereCondition =  {
      resourceName: resourceDetailData.resourceName,
      resourceType: resourceDetailData.resourceType,
      resourceGroupKey: findResourceGroup.resourceGroupKey,
      deletedAt: null,
    };

    if (resourceDetailData.resourceNamespace) {
      resourceWhereCondition["resourceNamespace"] = resourceDetailData.resourceNamespace
    }

    let findResource: any
    if (resourceDetailData.nodeName) {
      const resources = await this.resource.findAll({
        where: resourceWhereCondition,
        attributes: { exclude: ['deletedAt', 'resourceKey', 'resource_group_key'] },
        include: [{ model: ResourceGroupModel, attributes: ['resourceGroupId'] }],
      });

      findResource = resources.find(resource => resource.resourceSpec?.nodeName === resourceDetailData.nodeName)
      if (!findResource) {
        throw new HttpException(404, "Resource doesn't exist");
      }

      return findResource
    }

    findResource = await this.resource.findOne({
      where: resourceWhereCondition,
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
    const customerAccountKey = await this.customerAccountService.getCustomerAccountKeyById(customerAccountId);

    const allResources: IResource[] = await this.resource.findAll({
      where: { deletedAt: null, resourceType: resourceType, customerAccountKey: customerAccountKey },
    });

    return allResources;
  }

  /**
   * @param  {number} customerAccountId
   * @param  {any} query
   */
  public async getVMListByCustomerAccountId(customerAccountId: string, query?: any): Promise<any[]> {
    const customerAccountKey = await this.customerAccountService.getCustomerAccountKeyById(customerAccountId);

    const resourceWhereCondition = { deletedAt: null, customerAccountKey, resourceType: ['PJ','PM', 'VM'],};

    let resourceGroupIds: string[] = [];
    if (query?.resourceGroupId) {
      switch (Array.isArray(query.resourceGroupId)) {
        case true:
          resourceGroupIds = query.resourceGroupId.map(id => id)
          break
        case false:
          resourceGroupIds.push(query.resourceGroupId)
          break
      }
    }

    let resourceGroupWhereCondition = {customerAccountKey, deletedAt: null }

    if (resourceGroupIds.length > 0) {
      resourceGroupWhereCondition['resourceGroupId'] = resourceGroupIds
    }

    const resourceGroups: IResourceGroup[] = await this.resourceGroup.findAll({
      where: resourceGroupWhereCondition,
      attributes: { exclude: ['deletedAt'] },
    });

    resourceWhereCondition['resourceGroupKey'] = resourceGroups.map(rg => rg.resourceGroupKey)
    const resources: IResource[] = await this.resource.findAll({
      where: resourceWhereCondition,
      attributes: { exclude: ['resourceKey', 'deletedAt'] },
      order: [
        ["resourceGroupKey", "ASC"],
        ["resourceName", "ASC"]
      ],
    });

    const status = await this.getResourcesStatus(customerAccountKey, resourceGroups)
    let vms: any = [];
    let projects: object = {};
    let pms: object = {};
    for (const resource of resources) {
      switch (resource.resourceType) {
        case "PJ":
          projects[resource.resourceId] = {
            resourceName: resource.resourceName,
            description: resource.resourceDescription,
            resourceTargetUuid: resource.resourceTargetUuid,
            resourceGroupKey: resource.resourceGroupKey,
            resourceGroupName: '',
            resourceStatus: resource.resourceStatus,
          }

          break;
        case "VM":
          var vmStatus = await this.getVMStatus(resource, status)

          vms.push({
            resourceId: resource.resourceId,
            resourceName: resource.resourceName,
            resourceNamespace: resource.resourceNamespace,
            parentResourceId: resource.parentResourceId,
            resourceTargetUuid: resource.resourceTargetUuid,
            resourceGroupKey: resource.resourceGroupKey,
            createdAt: resource.resourceTargetCreatedAt,
            pmName: resource.resourceSpec['OS-EXT-SRV-ATTR:host'],
            hostname: resource.resourceSpec['OS-EXT-SRV-ATTR:hostname'],
            resourceInstance: resource.resourceSpec['addresses'],
            resourceStatus: vmStatus,
            projectName: '',
          })
          break;
        case "PM":
          pms[resource.resourceTargetUuid] = {
            resourceName: resource.resourceName
          }
      }
    }

    // get status
    vms.forEach((vm: any) => {
      for (const value of Object.values(projects)) {
        if (value.resourceTargetUuid === vm.resourceNamespace) {
          vm.projectName = value.resourceName
          break;
        }
      }

      for (const value of Object.values(pms)) {
        if (value.resourceTargetUuid === vm.parentResourceId) {
          vm.pmName = value.resourceName
          break;
        }
      }

      const rg = resourceGroups.find(rg => {
        if (vm.resourceGroupKey === rg.resourceGroupKey) {
          return rg.resourceGroupName
        }
      })

      vm.resourceGroupName = rg.resourceGroupName
    })

    return vms;
  }

  /**
   * @param  {number} customerAccountId
   * @param  {any} query
   */
  public async getPMListByCustomerAccountId(customerAccountId: string, query?: any): Promise<any[]> {
    const customerAccountKey = await this.customerAccountService.getCustomerAccountKeyById(customerAccountId);

    const resourceWhereCondition = { deletedAt: null, customerAccountKey, resourceType: ['PM', 'VM'],};

    let resourceGroupIds: string[] = [];
    if (query?.resourceGroupId) {
      switch (Array.isArray(query.resourceGroupId)) {
        case true:
          resourceGroupIds = query.resourceGroupId.map(id => id)
          break
        case false:
          resourceGroupIds.push(query.resourceGroupId)
          break
      }
    }

    let resourceGroupWhereCondition = {customerAccountKey, deletedAt: null }

    if (resourceGroupIds.length > 0) {
      resourceGroupWhereCondition['resourceGroupId'] = resourceGroupIds
    }

    const resourceGroups: IResourceGroup[] = await this.resourceGroup.findAll({
      where: resourceGroupWhereCondition,
      attributes: { exclude: ['deletedAt'] },
    });

    resourceWhereCondition['resourceGroupKey'] = resourceGroups.map(rg => rg.resourceGroupKey)
    const resources: IResource[] = await this.resource.findAll({
      where: resourceWhereCondition,
      attributes: { exclude: ['resourceKey', 'deletedAt'] },
      order: [
        ["resourceGroupKey", "ASC"],
        ["resourceName", "ASC"]
      ],
    });

    const status = await this.getResourcesStatus(customerAccountKey, resourceGroups)
    let vms: any = [];
    let pms: any = [];
    for (const resource of resources) {
      switch (resource.resourceType) {
        case "VM":
          var vmStatus = await this.getVMStatus(resource, status)

          vms.push({
            resourceId: resource.resourceId,
            resourceName: resource.resourceName,
            resourceNamespace: resource.resourceNamespace,
            parentResourceId: resource.parentResourceId,
            hostname: resource.resourceSpec['OS-EXT-SRV-ATTR:hostname'],
            resourceTargetUuid: resource.resourceTargetUuid,
            resourceInstance: resource.resourceSpec['addresses'],
            resourceStatus: vmStatus
          })

          break;
        case "PM":
          var pmStatus = await this.getPMStatus(resource, status)
          pms.push({
              resourceId: resource.resourceId,
              resourceName: resource.resourceName,
              createdAt: resource.createdAt,
              resourceGroupKey: resource.resourceGroupKey,
              resourceTargetUuid: resource.resourceTargetUuid,
              resourceInstance: resource.resourceInstance,
              resourceStatus: pmStatus,
              resourceGroupName: '',
              vms: []
            }
          )
      }
    }

    pms.forEach((pm: any) => {
      for (const vm of vms) {
        if (vm.parentResourceId === pm.resourceTargetUuid) {
          pm.vms.push(vm)
        }
      }

      const rg = resourceGroups.find(rg => {
        if (pm.resourceGroupKey === rg.resourceGroupKey) {
          return rg.resourceGroupName
        }
      })

      pm.resourceGroupName = rg.resourceGroupName
    })

    return pms;
  }

  /**
   * @param  {number} customerAccountId
   * @param  {any} query
   */
  public async getPJListByCustomerAccountId(customerAccountId: string, query?: any): Promise<any[]> {
    const customerAccountKey = await this.customerAccountService.getCustomerAccountKeyById(customerAccountId);

    const resourceWhereCondition = { deletedAt: null, customerAccountKey, resourceType: ['PJ', 'PM', 'VM'],};

    let resourceGroupIds: string[] = [];
    if (query?.resourceGroupId) {
      switch (Array.isArray(query.resourceGroupId)) {
        case true:
          resourceGroupIds = query.resourceGroupId.map(id => id)
          break
        case false:
          resourceGroupIds.push(query.resourceGroupId)
          break
      }
    }

    let resourceGroupWhereCondition = {customerAccountKey, deletedAt: null }

    if (resourceGroupIds.length > 0) {
      resourceGroupWhereCondition['resourceGroupId'] = resourceGroupIds
    }

    const resourceGroups: IResourceGroup[] = await this.resourceGroup.findAll({
      where: resourceGroupWhereCondition,
      attributes: { exclude: ['deletedAt'] },
    });

    resourceWhereCondition['resourceGroupKey'] = resourceGroups.map(rg => rg.resourceGroupKey)
    const resources: IResource[] = await this.resource.findAll({
      where: resourceWhereCondition,
      attributes: { exclude: ['resourceKey', 'deletedAt'] },
      order: [
        ["resourceGroupKey", "ASC"],
        ["resourceName", "ASC"]
      ],
    });

    const status = await this.getResourcesStatus(customerAccountKey, resourceGroups)
    let projects: any = [];
    let vms: any = [];
    let pms: any = [];
    for (const resource of resources) {
      switch (resource.resourceType) {
      case "PJ":
        projects.push({
          resourceId: resource.resourceId,
          resourceName: resource.resourceName,
          description: resource.resourceDescription,
          createdAt: resource.createdAt,
          resourceTargetUuid: resource.resourceTargetUuid,
          resourceGroupKey: resource.resourceGroupKey,
          resourceGroupName: '',
          resourceStatus: resource.resourceStatus,
          vms: [],
          pms: [],
        })
        break;
      case "VM":
        var vmStatus = await this.getVMStatus(resource, status)
        vms.push({
          resourceId: resource.resourceId,
          resourceName: resource.resourceName,
          resourceNamespace: resource.resourceNamespace,
          parentResourceId: resource.parentResourceId,
          hostname: resource.resourceSpec['OS-EXT-SRV-ATTR:hostname'],
          resourceTargetUuid: resource.resourceTargetUuid,
          resourceInstance: resource.resourceSpec['addresses'],
          resourceStatus: vmStatus
        })

        break;
      case "PM":
        pms.push({
          resourceName: resource.resourceName,
          resourceTargetUuid: resource.resourceTargetUuid
        })
      }
    }

    // get status
    projects.forEach((project: any) => {
      for (const vm of vms) {
        if (vm.resourceNamespace === project.resourceTargetUuid) {
          project.vms.push(vm)
        }
      }

      for (const vm of project.vms) {
        for (const pm of pms) {
          if (pm.resourceTargetUuid === vm.parentResourceId) {
            if (!project.pms.includes(pm)) {
              project.pms.push(pm)
            }
          }
        }
      }

      const rg = resourceGroups.find(rg => {
        if (project.resourceGroupKey === rg.resourceGroupKey) {
          return rg.resourceGroupName
        }
      })

      project.resourceGroupName = rg.resourceGroupName
    })

    return projects;
  }

  public async getVMDetails(vm: IResource): Promise<IResource> {
    // get resourceGroup
    let rg = await this.resourceGroup.findOne({
      attributes: ['resourceGroupId', 'resourceGroupName'],
      where: {resourceGroupKey: vm.resourceGroupKey}
    })

    vm.resourceSpec.resourceGroupName = rg.resourceGroupName

    // get vm's status
    const status = await this.getResourcesStatus(vm.customerAccountKey, [rg])
    vm.resourceStatus = await this.getVMStatus(vm, status)
    // get pm's name
    let PM = await this.resource.findOne({
      attributes: ['resourceName'],
      where: {
        deletedAt: null,
        resourceType: "PM",
        resourceGroupKey: vm.resourceGroupKey,
        resourceTargetUuid: vm.parentResourceId
      },
    });

    if (!PM) {
      vm.resourceSpec.PMName = vm.resourceSpec["OS-EXT-SRV-ATTR:host"]
    } else {
      vm.resourceSpec.PMName = PM.resourceName
    }

    // get project's name
    let project = await this.resource.findOne({
      attributes: ['resourceName'],
      where: {
        deletedAt: null,
        resourceType: "PJ",
        resourceGroupKey: vm.resourceGroupKey,
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
    let rg = await this.resourceGroup.findOne({
      attributes: ['resourceGroupId', 'resourceGroupName'],
      where: {resourceGroupKey: pm.resourceGroupKey}
    })

    pm.resourceSpec.resourceGroupName = rg.resourceGroupName

    const status = await this.getResourcesStatus(pm.customerAccountKey, [rg])
    pm.resourceStatus = await this.getPMStatus(pm, status)

    let resultList = await this.resource.findAll({
      where: {
        deletedAt: null,
        resourceType: ["VM", "PJ"],
        resourceGroupKey: pm.resourceGroupKey,
      },
      attributes: { exclude: ['resourceKey', 'deletedAt'] },
    });

    let pjs = resultList.filter(pj => pj.resourceType === "PJ")
    let vms = resultList.filter(vm => (vm.resourceType === "VM" && vm.parentResourceId === pm.resourceTargetUuid))

    var vmInPm = [];
    // pm 별 vm의 정보
    for (let vm of vms) {
      var vmStatus = await this.getVMStatus(vm, status)
      var pj = pjs.find(pj => vm.resourceNamespace === pj.resourceTargetUuid)

      vmInPm.push({
        resourceId: vm.resourceId,
        resourceName: vm.resourceName,
        resourceNamespace: vm.resourceNamespace,
        parentResourceId: vm.parentResourceId,
        resourceTargetUuid: vm.resourceTargetUuid,
        resourceGroupKey: vm.resourceGroupKey,
        createdAt: vm.resourceTargetCreatedAt,
        pmName: vm.resourceSpec['OS-EXT-SRV-ATTR:host'],
        hostname: vm.resourceSpec['OS-EXT-SRV-ATTR:hostname'],
        resourceInstance: vm.resourceSpec['addresses'],
        resourceStatus: vmStatus,
        projectName: pj.resourceName,
      })
    }

    pm.resourceSpec.vms = vmInPm
    return pm
  }

  public async getPJDetails(project: IResource): Promise<IResource> {
    let rg = await this.resourceGroup.findOne({
      attributes: ['resourceGroupId', 'resourceGroupName'],
      where: {resourceGroupKey: project.resourceGroupKey}
    })

    project.resourceSpec.resourceGroupName = rg.resourceGroupName

    // get VM info from PJ
    let resultList = await this.resource.findAll({
      where: {
        deletedAt: null,
        resourceType: ['VM', 'PM'],
        resourceGroupKey: project.resourceGroupKey,
      },
      attributes: { exclude: ['resourceKey', 'deletedAt'] },
    })

    let pms = resultList.filter(pm => pm.resourceType === "PM")
    let vms = resultList.filter(vm => (vm.resourceType === "VM" && vm.resourceNamespace === project.resourceTargetUuid))

    var vmInProject = [];
    const status = await this.getResourcesStatus(project.customerAccountKey, [rg])

    for (let vm of vms) {
      let vmStatus = await this.getVMStatus(vm, status)

      console.log(vmStatus)

      vmInProject.push({
        resourceId: vm.resourceId,
        resourceName: vm.resourceName,
        resourceNamespace: vm.resourceNamespace,
        parentResourceId: vm.parentResourceId,
        pmName: vm.resourceSpec['OS-EXT-SRV-ATTR:host'],
        hostname: vm.resourceSpec['OS-EXT-SRV-ATTR:hostname'],
        createdAt: vm.resourceTargetCreatedAt,
        resourceTargetUuid: vm.resourceTargetUuid,
        resourceInstance: vm.resourceSpec['addresses'],
        resourceStatus: vmStatus
      })
    }

    project.resourceSpec.vms = vmInProject
    // get PM info in project

    // find vms group by pm_id
    // get pms in project (by vms)
    let pmUUIDs = [... new Set(vms.map(vm => {return vm.parentResourceId}))]
    let pmByVms = pms.map(pm => {
      if (pmUUIDs.indexOf(pm.resourceTargetUuid) !== -1) {
        return pm
      }
    }).filter(n => n !== undefined)

    var pmInProject = [];
    // get pm uuids in vms
    for (let pm of pmByVms) {
      let pmStatus = await this.getPMStatus(pm, status)

      pmInProject.push({
          resourceId: pm.resourceId,
          resourceName: pm.resourceName,
          createdAt: pm.createdAt,
          resourceGroupKey: pm.resourceGroupKey,
          resourceTargetUuid: pm.resourceTargetUuid,
          resourceInstance: pm.resourceInstance,
          resourceStatus: pmStatus,
        }
      )

    }

    project.resourceSpec.pms = pmInProject

    return project
  }

  /**
   * @param  {string} resourceId
   * @param  {number} customerAccountKey
   */
  public async getResourceByTypeCustomerAccountKeyResourceId(resourceId: string, customerAccountKey: number): Promise<IResource> {
    const resourceWhereCondition = { deletedAt: null, customerAccountKey, resourceId: resourceId,};

    let resource: IResource = await this.resource.findOne({
      where: resourceWhereCondition,
      attributes: { exclude: ['resourceKey', 'deletedAt'] },
    });

    switch (resource.resourceType) {
      case "VM":
        return await this.getVMDetails(resource)

      case "PM":
        return await this.getPMDetails(resource)

      case "PJ":
        return await this.getPJDetails(resource)
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
    let result: any = {};
    let resourceGroupIds: string[] = [];
    if (query?.resourceGroupId) {
      switch (Array.isArray(query.resourceGroupId)) {
        case true:
          resourceGroupIds = query.resourceGroupId.map(id => id)
          break
        case false:
          resourceGroupIds.push(query.resourceGroupId)
          break
      }
    }

    let resourceGroupWhereCondition = {customerAccountKey, deletedAt: null }

    if (resourceGroupIds.length > 0) {
      resourceGroupWhereCondition['resourceGroupId'] = resourceGroupIds

      const resourceGroups: IResourceGroup[] = await this.resourceGroup.findAll({
        where: resourceGroupWhereCondition,
        attributes: ['resourceGroupKey'],
      });

      resourceWhereCondition['resourceGroupKey'] = resourceGroups?.map((resourceGroup: IResourceGroup) => resourceGroup.resourceGroupKey)
    }

    result = await this.resource.count({
      where: resourceWhereCondition,
    });

    return result;
  }

  /**
   * @param  {string} resourceType
   * @param  {number} customerAccountKey
   */
  public async getResourceCountForK8sOverView(customerAccountKey: number, query?: any): Promise<any> {
    const resourceWhereCondition = { deletedAt: null, customerAccountKey, };
    const replicaSetCondition = { deletedAt: null, customerAccountKey, resourceOwnerReferences: null, resourceType: 'RS', [Op.and]: [{resourceReplicas: { [Op.ne]: null }}, {resourceReplicas: { [Op.ne]: 0 }}]};
    let result: any = {};
    let resourceGroupIds: string[] = [];
    if (query?.resourceGroupId) {
      switch (Array.isArray(query.resourceGroupId)) {
        case true:
          resourceGroupIds = query.resourceGroupId.map(id => id)
          break
        case false:
          resourceGroupIds.push(query.resourceGroupId)
          break
      }
    }

    let resourceGroupWhereCondition = {customerAccountKey, deletedAt: null }

    if (resourceGroupIds.length > 0) {
      resourceGroupWhereCondition['resourceGroupId'] = resourceGroupIds

      const resourceGroups: IResourceGroup[] = await this.resourceGroup.findAll({
        where: resourceGroupWhereCondition,
        attributes: ['resourceGroupKey'],
      });

      resourceWhereCondition['resourceGroupKey'] = resourceGroups?.map((resourceGroup: IResourceGroup) => resourceGroup.resourceGroupKey)
      replicaSetCondition['resourceGroupKey'] = resourceGroups?.map((resourceGroup: IResourceGroup) => resourceGroup.resourceGroupKey)
    }

    // get Nodes Count
    resourceWhereCondition['resourceType'] = 'ND'
    result['nodeCount'] = await this.resource.findAndCountAll({
      where: resourceWhereCondition,
      attributes: ['resourceName', 'resourceType', 'resourceActive', 'resourceStatus'],
    });
    // get Namespace Count
    resourceWhereCondition['resourceType'] = 'NS'
    result['namespaceCount'] = await this.resource.findAndCountAll({
      where: resourceWhereCondition,
      attributes: ['resourceName', 'resourceType', 'resourceActive', 'resourceStatus'],
    });
    // get Services Count
    resourceWhereCondition['resourceType'] = 'SV'
    result['serviceCount'] = await this.resource.findAndCountAll({
      where: resourceWhereCondition,
      attributes: ['resourceName', 'resourceType', 'resourceActive', 'resourceStatus'],
    });
    // get PVC Count
    resourceWhereCondition['resourceType'] = 'PV'
    result['pvCount'] = await this.resource.findAndCountAll({
      where: resourceWhereCondition,
      attributes: ['resourceName', 'resourceType', 'resourceActive', 'resourceStatus'],
    });
    // get Pods Count
    resourceWhereCondition['resourceType'] = 'PD'
    result['podCount'] = await this.resource.findAndCountAll({
      where: resourceWhereCondition,
      attributes: ['resourceName', 'resourceType', 'resourcePodPhase'],
    });
    // get Pods by Namespace Count
    result['podCountByNamespace'] = await this.resource.count({
      where: resourceWhereCondition,
      group: ['resourceNamespace']
    })

    // get Workload(replicaset) which not include ownerReference
    let replicaSet: any = await this.resource.findAndCountAll({
      where: replicaSetCondition,
      attributes: ['resourceName', 'resourceType', 'resourceActive', 'resourceStatus'],
    });

    // get Workloads Count
    resourceWhereCondition['resourceType'] = ['DS', 'DP', 'SS', 'CJ', 'JO']
    result['workloadCount'] = await this.resource.findAndCountAll({
      where: resourceWhereCondition,
      attributes: ['resourceName', 'resourceType', 'resourceActive', 'resourceStatus'],
    });

    result['workloadCount'].count = result['workloadCount'].count + replicaSet.count
    result['workloadCount'].rows.push.apply(result['workloadCount'].rows, replicaSet.rows)

    // get Workloads by Namespace Count
    result['workloadCountByNamespace'] = await this.resource.count({
      where: resourceWhereCondition,
      group: ['resourceNamespace']
    })

    return result;
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
  public async getResourceByResourceIds(resourceIds: any): Promise<IResource[]> {
    if (resourceIds.length === 0) {
      throw new HttpException(204, 'no contents')
    }
    const ids = [];

    if (!Array.isArray(resourceIds)) {
      ids.push(resourceIds)
    } else {
    resourceIds.map((resourceId: any) => ids.push(resourceId))
    }
    const allResources: IResource[] = await this.resource.findAll({
      where: {
        resourceId: { [Op.in]: ids}
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
    console.log('resourceType', resourceType);
    const allResources: IResource[] = await this.resource.findAll({
      where: {
        deletedAt: null,
        //resourceType: { [Op.ne]: 'RS' },
        //resourceLevel4: resourceType,
        resourceType,
        resourceGroupKey: resourceGroupKey,
        [Op.and]: [...resourceQuery],
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
  public async getResourceByTypeResourceGroupIdMetricOps(resourceType: string[], resourceGroupId: string, query?: any): Promise<IResource[]> {
    const resultResourceGroup = await this.resourceGroupService.getResourceGroupById(resourceGroupId);
    const resourceGroupKey = resultResourceGroup.resourceGroupKey;
    const resourceQuery = this.getResourceQuery(query);
    console.log('resourceType', resourceType);
    const allResources: IResource[] = await this.resource.findAll({
      where: {
        deletedAt: null,
        resourceType: { [Op.ne]: 'RS' },
        resourceLevel4: resourceType,
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
  public async getWorkloadByResourceGroupUuidBackUp(resourceGroupUuid: string, allReplicasYN: string): Promise<IResource[]> {
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
          resourceType: { [Op.in]: ['SS', 'RS', 'DS', 'JO', 'CJ'] },
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
   * @param  {string} resourceGroupUuid
   * @param {string} allReplicasYN
   */
  public async getWorkloadByResourceGroupUuid(resourceGroupUuid: string): Promise<IResource[]> {
    const resultResourceGroup = await this.resourceGroup.findOne({where: { resourceGroupUuid }});
    const resourceGroupKey = resultResourceGroup.resourceGroupKey;
    const resultResources = [];

    // 1. get Deployment, Statefulset Resource
    let query: any = {
      attributes: ['resourceName', 'resourceId', 'resourceType', 'resourceNamespace', 'resourceStatus'],
      where: {
        resourceType: { [Op.in]: ['SS', 'DP', 'JO', 'CJ', 'DS'] },
        deletedAt: null,
        resourceGroupKey: resourceGroupKey,
      },
      //include: [{ model: ResourceGroupModel, attributes: ['resourceGroupName'] }],
      order: [['resource_type', 'DESC']]
    }

    const resources: IResource[] = await this.resource.findAll(query);
    resources.forEach((resource: IResource)=> resultResources.push(resource))

    // 2. get ReplicaSet which not include ownerRefernce
    let rsQuery: any = {
      attributes: ['resourceName', 'resourceId', 'resourceType', 'resourceNamespace', 'resourceStatus'],
      where: {
        [Op.and]: [
          {
            resourceReplicas: { [Op.ne]: null },
          },
          {
            resourceReplicas: { [Op.ne]: 0 },
          },
        ],
        resourceType: 'RS',
        deletedAt: null,
        resourceOwnerReferences: null,
        resourceGroupKey: resourceGroupKey,
      },
      //include: [{ model: ResourceGroupModel, attributes: ['resourceGroupName'] }],
      order: [['resource_type', 'DESC']]
    }

    const replicaSetResources: IResource[] = await this.resource.findAll(rsQuery);
    replicaSetResources.forEach((replicaSetResource: IResource) => resultResources.push(replicaSetResource))

    return resultResources;
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

    const getResourcegroup: IResourceGroupUi = await this.resourceGroupService.getResourceGroupByUuid(resourceGroupUuid);
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

  public async uploadResourcePM(customerAccountKey: number, queryBody: IMetricQueryBody) {
    if (isEmpty(queryBody?.query)) {
      throw new HttpException(400, 'query[] is missing')
    }

    const metricName = queryBody.query[0].name;
    const clusterUuid = queryBody.query[0].resourceGroupUuid;
    var uploadQuery = {};
    var mergedQuery: any = {};
    var tempQuery: any = {};

    const result = await this.metricService.getMetric(customerAccountKey, queryBody);
    let length = result[metricName].data.result.length

    if (length === 0) {
      console.log("no update in upload PM")
      return result[metricName].query
    }

    const resourceGroup = await this.resourceGroup.findOne({
      attributes: ['resourceGroupKey'],
      where: {resourceGroupUuid: clusterUuid}
    })

    // pm이 조회되지 않았을때 삭제하지 않고 resource status 를 SHUTOFF로 Update
    const pms = await this.resource.findAll({
      where: { resourceGroupKey: resourceGroup.resourceGroupKey, deletedAt: null, customerAccountKey: customerAccountKey, resourceType: "PM"},
    })

    const status = await this.getResourcesStatus(customerAccountKey, [resourceGroup])
    console.log(`status: ${JSON.stringify(status)}`)
    // insert pm
    if (pms.length === 0) {
      for (let i = 0; i < length; i++) {
        tmp = result[metricName].data.result[i].metric
        // get pm status
        let obj = {resourceGroupKey: resourceGroup.resourceGroupKey, resourceInstance: tmp.instance}
        let pmStatus = await this.getPMStatus(obj, status)

        uploadQuery['resource_Name'] = tmp.nodename;
        uploadQuery['resource_Type'] = "PM";
        uploadQuery['resource_Instance'] = tmp.instance;
        uploadQuery['resource_Spec'] = tmp;
        uploadQuery['resource_Group_Uuid'] = tmp.clusterUuid;
        uploadQuery['resource_Target_Uuid'] = tmp.nodename;
        uploadQuery['resource_Description'] = tmp.version;
        uploadQuery['resource_Status'] = pmStatus
        uploadQuery['resource_Target_Created_At'] = null
        uploadQuery['resource_Level1'] = "OS"; //Openstack
        uploadQuery['resource_Level2'] = "PM";
        uploadQuery['resource_Level_Type'] = "OX";  //Openstack-Cluster
        uploadQuery['resource_Rbac'] = true;
        uploadQuery['resource_Anomaly_Monitor'] = false;
        uploadQuery['resource_Active'] = true;

        tempQuery = this.formatter_resource(i, length, "PM", clusterUuid, uploadQuery, mergedQuery);
        mergedQuery = tempQuery;
      }

      return await this.massUploaderService.massUploadResource(JSON.parse(mergedQuery))
    }

    // update pm
    for (const pm of pms) {
      const pmIndex = pms.indexOf(pm);
      let is_exist = false;
      var tmp: any

      for (var index = 0; index < length; index++) {
        if (pm.resourceTargetUuid === result[metricName].data.result[index].metric.nodename) {
          is_exist = true;
          tmp = result[metricName].data.result[index].metric
          break;
        }
      }

      if (is_exist === false) {
        uploadQuery['resource_Name'] = pm.resourceName;
        uploadQuery['resource_Type'] = "PM";
        uploadQuery['resource_Instance'] = pm.resourceInstance;
        uploadQuery['resource_Spec'] = pm.resourceSpec;
        uploadQuery['resource_Group_Uuid'] = clusterUuid;
        uploadQuery['resource_Target_Uuid'] = pm.resourceTargetUuid;
        uploadQuery['resource_Description'] = pm.resourceDescription;
        uploadQuery['resource_Status'] = "INACTIVE"
        uploadQuery['resource_Target_Created_At'] = null
        uploadQuery['resource_Level1'] = "OS"; //Openstack
        uploadQuery['resource_Level2'] = "PM";
        uploadQuery['resource_Level_Type'] = "OX";  //Openstack-Cluster
        uploadQuery['resource_Rbac'] = true;
        uploadQuery['resource_Anomaly_Monitor'] = false;
        uploadQuery['resource_Active'] = true;
      } else {
        // get pm status
        let pmStatus = await this.getPMStatus(pm, status)

        uploadQuery['resource_Name'] = tmp.nodename;
        uploadQuery['resource_Type'] = "PM";
        uploadQuery['resource_Instance'] = tmp.instance;
        uploadQuery['resource_Spec'] = tmp;
        uploadQuery['resource_Group_Uuid'] = tmp.clusterUuid;
        uploadQuery['resource_Target_Uuid'] = tmp.nodename;
        uploadQuery['resource_Description'] = tmp.version;
        uploadQuery['resource_Status'] = pmStatus
        uploadQuery['resource_Target_Created_At'] = null
        uploadQuery['resource_Level1'] = "OS"; //Openstack
        uploadQuery['resource_Level2'] = "PM";
        uploadQuery['resource_Level_Type'] = "OX";  //Openstack-Cluster
        uploadQuery['resource_Rbac'] = true;
        uploadQuery['resource_Anomaly_Monitor'] = false;
        uploadQuery['resource_Active'] = true;
      }

      tempQuery = this.formatter_resource(pmIndex, pms.length, "PM", clusterUuid, uploadQuery, mergedQuery);
      mergedQuery = tempQuery;
    }

    return await this.massUploaderService.massUploadResource(JSON.parse(mergedQuery))
  }

  private formatter_resource(i, itemLength, resourceType, cluster_uuid, query, mergedQuery) {
    let interimQuery = {};
    try {
      if (itemLength==1) {
        interimQuery = '{"resource_Type": "' + resourceType + '", "resource_Group_Uuid": "' + cluster_uuid + '", ' + '"resource":[' + JSON.stringify(query) + "]}";
      }
      else {
        if (i==0) {
          interimQuery = '{"resource_Type": "' + resourceType + '", "resource_Group_Uuid": "' + cluster_uuid + '", ' + '"resource":[' + JSON.stringify(query);
        }
        else if (i==(itemLength-1)) {
          interimQuery = mergedQuery + "," + JSON.stringify(query) + "]}";
        }
        else {
          interimQuery = mergedQuery +  "," + JSON.stringify(query);
        }
      }
    } catch (error) {
      console.log("error due to unexpoected error: ", error.response);
    }
    return interimQuery;
  }

  public async getResourcesStatus(customerAccountKey: number, resourceGroups: IResourceGroup[]) {
    const resourceGroupIds = resourceGroups.map((rg: any) => {
      return rg.resourceGroupId;
    });

    const metrics: any = await this.metricService.getMetric(customerAccountKey, {
      query: [
        {
          name: 'nodeStatus',
          type: 'OS_CLUSTER_NODE_STATUS',
          resourceGroupId: resourceGroupIds,
        },
      ],
    });

    const vmStatusPerName = {};
    const pmStatusPerName = {};

    if (!metrics?.nodeStatus?.data?.result) {
      return {};
    }

    metrics?.nodeStatus?.data?.result.forEach((item: any) => {
      const metric = item.metric || {};
      let value: string;
      switch (parseInt(item.value[1])) {
        case 1:
          value = 'ACTIVE'
          break;
        case 0:
          value = 'INACTIVE'
          break;
        default:
          value = 'UNKNOWN'
      }

      const key = metric.clusterUuid + "-" + metric.instance
      if (metric.is_ops_vm === 'Y') {
        vmStatusPerName[key] = value;
      }

      if (metric.is_ops_pm === 'Y') {
        pmStatusPerName[key] = value;
      }
    });

    return {
      vmStatusPerName,
      pmStatusPerName,
    };
  }

  public async getVMStatus(vm: any, status: any) {
    let result: string = "UNKNOWN"
    let rg = await this.resourceGroup.findOne({
      attributes: ['resourceGroupId', 'resourceGroupUuid'],
      where: {resourceGroupKey: vm.resourceGroupKey}
    })

    Object.values(vm.resourceSpec['addresses']).forEach((values: any) => {
      values.forEach(value => {
        let key = rg.resourceGroupUuid+"-"+value.addr
        if (typeof status.vmStatusPerName[key] !== 'undefined') {
          result = status.vmStatusPerName[key]
        }
      })
    })

    return result
  }

  public async getPMStatus(pm: any, status: any) {
    let result: string = "UNKNOWN"

    let rg = await this.resourceGroup.findOne({
      attributes: ['resourceGroupId', 'resourceGroupUuid'],
      where: {resourceGroupKey: pm.resourceGroupKey}
    })

    let key = rg.resourceGroupUuid+"-"+pm.resourceInstance
    if (typeof status.pmStatusPerName[key] !== 'undefined') {
      result = status.pmStatusPerName[key]
    }

    return result
  }

  /**
   * @param  {string} resourceType
   * @param  {number} parentCustomerAccountId
   */
  public async getResourceByTypeParentCustomerAccountId(resourceType: string[], parentCustomerAccountId: string): Promise<IResource[]> {
    var customerAccountKeys = await this.customerAccountService.getCustomerAccountKeysByParentCustomerAccountId(parentCustomerAccountId)

    const resourceTypes = resourceType.map(rt => {
        return `"${rt}"`
    })

    const sql = `SELECT
                A.resource_id as resourceId,
                A.resource_type as resourceType,
                A.resource_name as resourceName,
                A.resource_group_key as resourceGroupKey,
                B.resource_group_id as resourceGroupId,
                B.resource_group_uuid as resourceGroupUuid,
                B.resource_group_name as resourceGroupName,
                B.resource_group_last_server_updated_at as resourceGroupLastServerUpdatedAt,
                C.customer_account_key as customerAccountKey,
                C.customer_account_id as customerAccountId,
                C.customer_account_name as customerAccountName,
                D.user_id as userId
              FROM Resource A, ResourceGroup B, CustomerAccount C, PartyUser D
              WHERE A.customer_account_key in (${customerAccountKeys})
                and A.resource_type in (${resourceTypes})
                and B.resource_group_key = A.resource_group_key
                and A.deleted_at is null
                and B.deleted_at is null
                and C.deleted_at is null
                and D.deleted_at is null
                and C.customer_account_key = A.customer_account_key
                and D.user_id = C.customer_account_id
                and D.first_name = "API-User"
                order by A.created_at desc`;

    let results: any
    results = await DB.sequelize.query(sql, { type: QueryTypes.SELECT });

    let resultResources = [];
    for (let result of results) {
      let resourceGroupServerInterfaceStatus: boolean = true;
      resourceGroupServerInterfaceStatus = this.resourceGroupService.checkResourceServerInterfaceStatus(result.ResourceGroup.resourceGroupLastServerUpdatedAt)

      resultResources.push({
        "resourceId": result.resourceId,
        "resourceType": result.resourceType,
        "resourceName": result.resourceName,
        "resourceGroupId": result.resourceGroupId,
        "resourceGroupUuid": result.resourceGroupUuid,
        "resourceGroupName": result.resourceGroupName,
        "resourceGroupServerInterfaceStatus": resourceGroupServerInterfaceStatus,
        "customerAccountId": result.customerAccountId,
        "customerAccountName": result.customerAccountName,
        "userId": result.userId
      })
    }

    return resultResources;
  }
}

export default ResourceService;
