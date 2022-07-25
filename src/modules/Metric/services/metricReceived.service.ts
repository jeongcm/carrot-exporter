import { HttpException } from '@/common/exceptions/HttpException';
import { IMetricReceived } from '@/common/interfaces/metricReceived.interface';
import { IResource } from '@/common/interfaces/resource.interface';
import { isEmpty } from '@/common/utils/util';
import DB from '@/database';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import { MetricReceivedDto } from '../dtos/metricReceived.dto';
import MetricMetaService from './metricMeta.service';
import sequelize, { Op } from 'sequelize';

class MetricReceivedService {
  public tableIdService = new TableIdService();
  public metricMeta = DB.MetricMeta;
  public metricReceived = DB.MetricReceived;
  public metricMetaService = new MetricMetaService();

  public async getMetricReceived(customerAccountKey: number): Promise<IMetricReceived[]> {
    const allMetricReceived: IMetricReceived[] = await this.metricReceived.findAll({
      where: { customerAccountKey: customerAccountKey, deletedAt: null },
      attributes: { exclude: ['metricReceivedKey', 'deletedAt', 'updatedBy', 'createdBy'] },
    });
    return allMetricReceived;
  }

  //deleteMetricReceived
  public async deleteMetricReceived(customerAccountKey: number, metricReceivedId: string) {
    try {
      const deleteMetricReceivedData = {
        deletedAt: new Date(),
      };

      const result = await this.metricReceived.update(deleteMetricReceivedData, {
        where: {
          customerAccountKey: customerAccountKey,
          metricReceivedId: metricReceivedId,
          deletedAt: {
            [Op.eq]: null,
          },
        },
      });
      if (result[0] == 1) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  public async findMetricReceivedById(metricReceivedId: string): Promise<IMetricReceived> {
    if (isEmpty(metricReceivedId)) throw new HttpException(400, 'Not a valid Metric Received');

    const findMetricReceivedById: IMetricReceived = await this.metricReceived.findOne({
      where: { metricReceivedId, deletedAt: null },
      attributes: { exclude: ['metricReceivedId', 'deletedAt', 'updatedBy', 'createdBy'] },
    });
    if (!findMetricReceivedById) throw new HttpException(409, 'Metric Received Not found');

    return findMetricReceivedById;
  }

  public async updateMetricReceived(
    metricReceivedId: string,
    metricReceivedData: MetricReceivedDto,
    customerAccountKey: number,
    partyId: string,
  ): Promise<IMetricReceived> {
    if (isEmpty(metricReceivedData)) throw new HttpException(400, 'MetricReceived Data cannot be blank');
    const findMetricReceived: IMetricReceived = await this.metricReceived.findOne({ where: { metricReceivedId } });
    if (!findMetricReceived) throw new HttpException(409, "MetricReceived doesn't exist");
    //get metric_Meta_Key
    const metricMetaKey = await this.metricMetaService.getMetricKeybyCustomerAccountKey(customerAccountKey);
    const updatedMetricReceivedData = {
      ...metricReceivedData,
      customerAccountKey: customerAccountKey,
      updatedBy: partyId,
      updatedAt: new Date(),
      metricMetaKey,
    };
    await this.metricReceived.update(updatedMetricReceivedData, { where: { metricReceivedId: metricReceivedId } });

    return await this.findMetricReceivedById(metricReceivedId);
  }

  public async createMetricReceived(metricReceivedData: MetricReceivedDto, customerAccountKey: number, partyId: string): Promise<IMetricReceived> {
    if (isEmpty(metricReceivedData)) throw new HttpException(400, 'Create MetricReceived cannot be blank');
    const tableIdName = 'MetricReceived';
    const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdName);
    const tempMetricReceivedId: string = responseTableIdData.tableIdFinalIssued;

    //get metric_Meta_Key
    const metricMetaKey = await this.metricMetaService.getMetricKeybyCustomerAccountKey(customerAccountKey);
    const currentDate = new Date();
    const newMetricReceived = {
      ...metricReceivedData,
      customerAccountKey: customerAccountKey,
      metricReceivedId: tempMetricReceivedId,
      createdAt: currentDate,
      createdBy: partyId,
      metricMetaKey: metricMetaKey,
    };
    const newMetricReceivedData: IMetricReceived = await this.metricReceived.create(newMetricReceived);
    return newMetricReceivedData;
  }

  public async getMetricReceivedByResourceId(customerAccountKey, resourceId: string, metricReceivedName: string[]): Promise<IResource> {
    if (isEmpty(resourceId)) throw new HttpException(400, 'resourceId required');
    if (isEmpty(metricReceivedName)) throw new HttpException(400, 'metricReceivedName[] required');

    console.log(metricReceivedName);

    const findMetricReceivedById: IResource = await DB.Resource.findOne({
      where: { customerAccountKey, resourceId, deletedAt: null },
      attributes: ['resourceName', 'resourceGroupKey'],
      include: [
        {
          model: DB.MetricMeta,
          where: {
            metricMetaName: {
              [Op.in]: metricReceivedName,
            },
          },
          attributes: ['metricMetaName'],
          include: [
            {
              model: DB.MetricReceived,
            },
          ],
        },
      ],
    });
    if (!findMetricReceivedById) throw new HttpException(409, 'Metric Received Not found');

    return findMetricReceivedById;
  }
}

export default MetricReceivedService;
