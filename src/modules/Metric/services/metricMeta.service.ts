import { HttpException } from '@/common/exceptions/HttpException';
import { IMetricMeta } from '@/common/interfaces/metricMeta.interface';
import { IMetricReceived } from '@/common/interfaces/metricReceived.interface';
import { isEmpty } from '@/common/utils/util';
import DB from '@/database';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import ResourceService from '@/modules/Resources/services/resource.service';
import ResourceGroupService from '@/modules/Resources/services/resourceGroup.service';
import { MetricMetaDto } from '../dtos/metricMeta.dto';
const { Op } = require('sequelize');
class MetricMetaService {
  public tableIdService = new TableIdService();
  public metricMeta = DB.MetricMeta;
  public metricReceived = DB.MetricReceived;

  public resourceGroupService = new ResourceGroupService();
  public resourceService = new ResourceService();

  public async getMetricMeta(customerAccountKey: number): Promise<IMetricMeta[]> {
    const allMetricMeta: IMetricMeta[] = await this.metricMeta.findAll({
      where: { customerAccountKey: customerAccountKey, deletedAt: null },
      attributes: { exclude: ['deletedAt', 'updatedBy', 'createdBy'] },
    });
    return allMetricMeta;
  }

  public async getDistinctJobOfMetricMetabyUuid(resource_group_uuid: string): Promise<any> {
    /* 
    // improvement/541 - perform distinct job using nodejs script not from DB
    const distinctJobMetricMeta = await this.metricMeta.findAll(
    //      {attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('metricMetaTargetJob')), 'metricMetaTargetJob']],
      {attributes: ['metricMetaTargetJob'], group:['metricMetaTargetJob'],
       where: { resourceGroupUuid: resource_group_uuid, deletedAt: null },
    });
    */

    const resultMetricMeta = await this.metricMeta.findAll(
      {attributes: ['metricMetaTargetJob'],
      where: { resourceGroupUuid: resource_group_uuid, deletedAt: null },
    });
    const jobMetricMeta = resultMetricMeta.map(x=>x.metricMetaTargetJob);
    //improvement/541 - perform distinct job using nodejs script not from DB
    const distinctJobMetricMeta = Array.from(new Set(jobMetricMeta));

    return distinctJobMetricMeta;
  }

  public async getDistinctJobOfMetricMetabyResourceGroupId(resourceGroupId: string): Promise<IMetricMeta[]> {

    const resourceGroup = await this.resourceGroupService.getResourceGroupById(resourceGroupId);
    const distinctJobMetricMeta: IMetricMeta[] = await this.metricMeta.findAll(
//      {attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('metricMetaTargetJob')), 'metricMetaTargetJob']],
      {attributes: ['metricMetaTargetJob', 'metricMetaTargetInstance'], group:['metricMetaTargetJob'],
       where: { resourceGroupUuid: resourceGroup.resourceGroupUuid, deletedAt: null },
    });
    return distinctJobMetricMeta;
  }


  public async getMetricKeybyCustomerAccountKey(customerAccountKey: number): Promise<number> {
    const allMetricMeta: IMetricMeta = await this.metricMeta.findOne({
      where: { customerAccountKey: customerAccountKey, deletedAt: null },
      attributes: { exclude: ['deletedAt', 'updatedBy', 'createdBy'] },
    });
    return allMetricMeta.metricMetaKey;
  }

  public async deleteMetricMeta(customerAccountKey: number, metricMetaId: string) {
    try {
      const deleteMetricMetaData = {
        deletedAt: new Date(),
      };

      const result = await this.metricMeta.update(deleteMetricMetaData, {
        where: {
          customerAccountKey: customerAccountKey,
          metricMetaId: metricMetaId,
          deletedAt: {
            [Op.eq]: null,
          },
        },
      });
      if (result[0] == 1) {
        return true;
      }else{
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  public async deleteMetricMetaByResourceGroupUuid(resourceGroupUuid: string): Promise<object> {

    if (isEmpty(resourceGroupUuid)) throw new HttpException(400, 'ResourceGroupUuid  must not be empty');
    const deleteData = { deletedAt: new Date() };
    const findMetricMeta: IMetricMeta = await this.metricMeta.findOne({ where: { resourceGroupUuid: resourceGroupUuid } });
    if (!findMetricMeta) throw new HttpException(400, "ResourceGroup  doesn't exist");

    const resultDeleteMetricReceived = await this.metricReceived.update(deleteData, {where: {metricMetaKey: findMetricMeta.metricMetaKey}} );
    const resultDeleteMetricMeta = await this.metricMeta.update(deleteData, {where: {resourceGroupUuid: resourceGroupUuid}});
   
    console.log (resultDeleteMetricReceived);
    console.log (resultDeleteMetricMeta);  
    return;
  }



  public async findMetricMetaById(metricMetaId: string): Promise<IMetricMeta> {
    if (isEmpty(metricMetaId)) throw new HttpException(400, 'Not a valid Metric Meta');

    const findMetricMeta: IMetricMeta = await this.metricMeta.findOne({
      where: { metricMetaId, deletedAt: null },
      attributes: { exclude: ['metricMetaId', 'deletedAt', 'updatedBy', 'createdBy'] },
    });
    if (!findMetricMeta) throw new HttpException(409, 'Metric Meta Not found');

    return findMetricMeta;
  }
  
  public async updateMetricMeta(
    metricMetaId: string,
    metricMetaData: MetricMetaDto,
    customerAccountKey: number,
    partyId: string,
  ): Promise<IMetricMeta> {
    if (isEmpty(metricMetaData)) throw new HttpException(400, 'MetricMeta Data cannot be blank');
    const findMetricMeta: IMetricMeta = await this.metricMeta.findOne({ where: { metricMetaId } });
    if (!findMetricMeta) throw new HttpException(409, "MetricMeta doesn't exist");
    //get ResourceGroupUUId
    const resourceGroupUuid: string = await this.resourceGroupService.getResourceGroupUuidByCustomerAcc(customerAccountKey);
    // get ResourceKey
    const resourceKey: number = await this.resourceService.getResourceKeyById(metricMetaData.resourceId);
    const updatedMetricMetaData = {
      ...metricMetaData,
      customerAccountKey: customerAccountKey,
      updatedBy: partyId,
      updatedAt: new Date(),
      resourceKey,
      resourceGroupUuid
    };
    await this.metricMeta.update(updatedMetricMetaData, { where: { metricMetaId: metricMetaId } });

    return await this.findMetricMetaById(metricMetaId);
  }

  public async createMetricMeta(metricMetaData: MetricMetaDto, customerAccountKey: number, partyId: string): Promise<IMetricMeta> {
    if (isEmpty(metricMetaData)) throw new HttpException(400, 'Create MetricMeta cannot be blank');
    const tableIdName: string = 'MetricMeta';
    const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdName);
    const tempMetricMetaId: string = responseTableIdData.tableIdFinalIssued;

    //get ResourceGroupUUId
    const resourceGroupUuid: string = await this.resourceGroupService.getResourceGroupUuidByCustomerAcc(customerAccountKey);
    // get ResourceKey
    const resourceKey: number = await this.resourceService.getResourceKeyById(metricMetaData.resourceId);
    const currentDate = new Date();
    const newAlertRule = {
      ...metricMetaData,
      customerAccountKey: customerAccountKey,
      metricMetaId: tempMetricMetaId,
      createdAt: currentDate,
      createdBy: partyId,
      resourceKey,
      resourceGroupUuid,
    };
    const newMetricMetaData: IMetricMeta = await this.metricMeta.create(newAlertRule);
    return newMetricMetaData;
  }
}

export default MetricMetaService;
