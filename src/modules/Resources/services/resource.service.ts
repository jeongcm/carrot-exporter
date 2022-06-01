import DB from '@/database';
import { IResource, IResourceTargetUuid } from '@/common/interfaces/resource.interface';
import { IRquestMassUploaderMongo } from '@/common/interfaces/massUploader.interface';
import { ResourceDto } from '../dtos/resource.dto';
import { HttpException } from '@/common/exceptions/HttpException';
import { isEmpty } from '@/common/utils/util';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import { IResourceGroup } from '@/common/interfaces/resourceGroup.interface';
//import { ICustomerAccount } from '@/common/interfaces/customerAccount.interface';
import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';
import ResourceGroupService from '@/modules/Resources/services/resourceGroup.service';
import { Op } from 'sequelize';
class ResourceService {
  public resource = DB.Resource;
  public resourceGroup = DB.ResourceGroup;
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
   * @returns Promise
   */
  public async getAllResources(customerAccountKey: number): Promise<IResource[]> {
    const allResource: IResource[] = await this.resource.findAll({
      where: { deletedAt: null, customerAccountKey },
      attributes: { exclude: ['resourceKey', 'deletedAt'] },
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
   * @param  {string} resourceType
   * @param  {number} customerAccountId
   */
  public async getResourceByTypeCustomerAccountId(resourceType: string[], customerAccountId: string): Promise<IResource[]> {
    const resultCustomerAccount = await this.customerAccountService.getCustomerAccountKeyById(customerAccountId);
    const customerAccountKey = resultCustomerAccount.customerAccountKey;

    const allResources: IResource[] = await this.resource.findAll({
      where: { deletedAt: null, resourceType: resourceType, customerAccountKey: customerAccountKey },
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
    });

    return allResources;
  }

  /**
   * generates sequelize query object to query resource more efficiently
   *
   * @param  {any} query
   */
  private getResourceQuery(query: any) {
    let generatedQuery: any[] = [];

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
      throw new HttpException(500, `can't find resourcegroup with resourcegroupuuid ${resourceGroupUuid}`);
    }

    const deleted_At = new Date();
    const notInQuery = { where:  { resourceTargetUuid: {[Op.notIn]: resourceTargetUuid},
                                  resourceGroupKey: getResourcegroup.resourceGroupKey,
                                  resourceType: resourceType,
                                  resourceActive: true
                                 }
                        }; 
    const updatedResource = {
      resourceActive: false,
      updatedBy: "SYSTEM",
      updatedAt: deleted_At,
      deletedAt: deleted_At,
    };
    var returnResult;

    try {
      const updateResult = await this.resource.update(updatedResource, notInQuery);
      returnResult = updateResult;
      console.log (updateResult);
    } catch (error) {
      throw new HttpException(500, error);
    }

    return returnResult;
  }

/**
   * @param  {string} resourceTargetUuid
   * @param  {string} resourceNamespace
   * @param  {any} updated_At
   */
 public async updateResourceByMongoUploader(resourceTargetUuid: string, resourceNamespace: string, updated_At: any): Promise<String> {
  if (isEmpty(resourceTargetUuid)) throw new HttpException(400, 'ResourceTargetUuid must not be empty');
 

  const updatedResource = {
    resourceNamespace: resourceNamespace,
    updatedBy: "SYSTEM",
    updatedAt: updated_At,
    resourceStatusUpdatedAt: updated_At,
  };

  console.log("updatedResource: ", updatedResource); 

  try {
    const updateResult = await this.resource.update(updatedResource, {where: {resourceTargetUuid: resourceTargetUuid},});
    console.log (updateResult);
  } catch (error) {
    throw new HttpException(500, error);
  }

  return "updated well";
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
    
    const resourceInputData = {
      resourceType: resourceData.resource_Type,
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
    };  

    try {
      const tableIdTableName = 'Resource';
      //const responseTableIdData: IResponseIssueTableIdDto = await this.TableIdService.issueTableId(tableIdTableName);

      const uuid = require('uuid'); 
      const apiId = uuid.v1();

      const createResource: IResource = await this.resource.create({
        //resourceId: responseTableIdData.tableIdFinalIssued,
        resourceId: apiId,
        createdAt: new Date(),
        createdBy: "SYSTEM",
        ...resourceInputData,
      });
      return createResource;
    } catch (error) {
      throw new HttpException(500, error);
    }
  }


}

export default ResourceService;
