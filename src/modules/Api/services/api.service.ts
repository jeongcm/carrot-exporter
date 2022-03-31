import DB from '@/database';
import { IApi } from '@/common/interfaces/api.interface';
import { ApiDto } from '../dtos/api.dto';
import { HttpException } from '@/common/exceptions/HttpException';
import { isEmpty } from '@/common/utils/util';
import tableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto'

class ApiService {
    public api = DB.Api;
    public tableIdService = new tableIdService();
  
    /**
     * @param  {ApiDto} apiData
     * @param  {string} currentUserId
     * @returns IApi[]
     */
    public async createApi(apiData: ApiDto, currentUserId: string): Promise<IApi> {
      if (isEmpty(apiData)) throw new HttpException(400, 'Api  must not be empty');
  
      try {
        const tableIdTableName = 'api';
        const tableId = await this.tableIdService.getTableIdByTableName(tableIdTableName);
  
        if (!tableId) {
          return;
        }
  
        const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdTableName);
  
        const createApi: IApi = await this.api.create({
          apiId: responseTableIdData.tableIdFinalIssued,
          createdBy: 'system',
          ...apiData,
        });
  
        return createApi;
      } catch (error) {}
    }
  
    /**
     * @returns IApi[]
     */
    public async getAllApi(): Promise<IApi[]> {
      const allApi: IApi[] = await this.api.findAll({
        where: { isDeleted: false },
        attributes: { exclude: ['apiKey', 'isDeleted'] },
      });
      return allApi;
    }
  
    /**
     * @param  {string} apiId
     * @returns Promise
     */
    public async getApiById(apiId: string): Promise<IApi> {
      const api: IApi = await this.api.findOne({
        where: { apiId },
        attributes: { exclude: ['apiKey', 'isDeleted'] },
      });
      return api;
    }
  
    /**
     * @param  {string} apiId
     * @param  {CommonCodeDto} apiData
     * @param  {string} currentUserId
     * @returns Promise
     */
    public async updateApiById(apiId: string, apiData: ApiDto, currentUserId: string): Promise<IApi> {
      if (isEmpty(apiData)) throw new HttpException(400, 'Api  must not be empty');
      const findApi: IApi= await this.api.findOne({ where: { apiId: apiId } });
      if (!findApi) throw new HttpException(400, "Api  doesn't exist");
      const updatedApi = {
        ...apiData,
        updatedBy: 'system',
        updatedAt: new Date(),
      };
      await this.api.update(updatedApi, { where: { apiId: apiId } });
  
      return this.getApiById(apiId);
    }
  }
  
  export default ApiService;