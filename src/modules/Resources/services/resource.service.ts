import DB from '@/database';
import { IResource, IResourceTargetUuid } from '@/common/interfaces/resource.interface';
import { ResourceDto } from '../dtos/resource.dto';
import { HttpException } from '@/common/exceptions/HttpException';
import { isEmpty } from '@/common/utils/util';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import { IResourceGroup } from '@/common/interfaces/resourceGroup.interface';
import { ICustomerAccount } from '@/common/interfaces/customerAccount.interface';
import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';

class ResourceService {
  public resource = DB.Resource;
  public resourceGroup = DB.ResourceGroup;
  public TableIdService = new TableIdService();
  public customerAccountService = new CustomerAccountService();

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
      const tableIdTableName = 'Resource';

      const responseTableIdData: IResponseIssueTableIdDto = await this.TableIdService.issueTableId(tableIdTableName);

      const createResource: IResource = await this.resource.create({
        resourceId: responseTableIdData.tableIdFinalIssued,
        createdBy: currentUserId,
        customerAccountKey,
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

    try{
      await this.resource.update(updatedResource, { where: { resourceId: resourceId } });
    }catch(error){
      throw new HttpException(400, error);
    }

    return this.getResourceById(resourceId);
  }

  /**
   * @param  {string} resourceType
   * @param  {number} customerAccountId
   */

  public async getResourceByTypeCustomerAccountId (resourceType: string, customerAccountId: string): Promise<IResource[]>  {


    const resultCustomerAccount = await this.customerAccountService.getCustomerAccountKeyById(customerAccountId); 
    const customerAccountKey = resultCustomerAccount.customerAccountKey;

    console.log ("*********");
    console.log (resourceType);
    console.log (customerAccountKey); 

    const allResources: IResource[] = await this.resource.findAll({
      where: { deletedAt: null, resourceType: resourceType, customerAccountKey: customerAccountKey }
    });
    console.log(allResources); 
    return allResources;

  }
}

export default ResourceService;
