import DB from '@/database';
import { IResourceGroup } from '@/common/interfaces/resourceGroup.interface';
import { ResourceGroupDto } from '../dtos/resourceGroup.dto';
import { HttpException } from '@/common/exceptions/HttpException';
import { isEmpty } from '@/common/utils/util';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import ResourceService from '@/modules/Resources/services/resource.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';

class ResourceGroupService {
  public resourceGroup = DB.ResourceGroup;
  public tableIdService = new TableIdService();
  public resource = new ResourceService();
  
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
      return createResourceGroup;
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
      attributes: { exclude: ['resourceGroupKey', 'deletedAt'] },
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
      attributes: { exclude: ['resourceGroupKey', 'deletedAt'] },
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
    };

    await this.resourceGroup.update(updatedResourceGroup, { where: { resourceGroupId: resourceGroupId } });

    return this.getResourceGroupById(resourceGroupId);
  }
}

export default ResourceGroupService;
