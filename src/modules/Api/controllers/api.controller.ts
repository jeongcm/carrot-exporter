import { NextFunction, Request, Response } from 'express';
import { IApi } from '@/common/interfaces/api.interface';
import ApiService from '../services/api.service';
import { ApiDto } from '../dtos/api.dto';
import { RequestWithUser } from '@/common/interfaces/auth.interface';
import { IRequestWithSystem, IRequestWithUser } from '@/common/interfaces/party.interface';

class ApiController {
    public apiService = new ApiService();
  
    public createApi = async (req: RequestWithUser, res: Response, next: NextFunction) => {
      try {
        const apiData: ApiDto = req.body;
        const currentUserId = req.user.id;
        const createApiData: IApi= await this.apiService.createApi(apiData, currentUserId);
  
        const { apiId, createdBy, createdAt, apiName, apiDescription, apiEndPoint1, apiEndPoint2, apiVisibleTF } = createApiData ||{};
  
        const response = {
          apiId,
          createdBy,
          createdAt,
          apiName,
          apiDescription,
          apiEndPoint1,
          apiEndPoint2,
          apiVisibleTF
        };
        res.status(201).json({ data: response, message: 'created' });
      } catch (error) {
        next(error);
      }
    };
  
    public getAllApi = async (req: RequestWithUser, res: Response, next: NextFunction) => {
      try {
        const findAllApiData: IApi[] = await this.apiService.getAllApi();
        res.status(200).json({ data: findAllApiData, message: 'findAll' });
      } catch (error) {
        next(error);
      }
    };
  
    public getApiById = async (req: RequestWithUser, res: Response, next: NextFunction) => {
      const apiId = req.params.apiId;
  
      try {
        const api: IApi = await this.apiService.getApiById(apiId);
        res.status(200).json({ data: api, message: `find api id(${apiId}) ` });
      } catch (error) {
        next(error);
      }
    };
  
    public updateApiById = async (req: RequestWithUser, res: Response, next: NextFunction) => {
      try {
        const apiId = req.params.apiId;
        const apiData = req.body;
        const currentUserId = req.user.id;
        const updateApiData: IApi = await this.apiService.updateApiById(apiId, apiData, currentUserId);
        res.status(200).json({ data: updateApiData, message: 'updated' });
      } catch (error) {
        next(error);
      }
    };
  }
  
  export default ApiController;