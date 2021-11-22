import { NextFunction, Request, Response } from 'express';
import { CreateTenancyDto } from '@dtos/tenancy.dto';
import { Tenancy } from '@interfaces/tenancy.interface';
import TenancyService from '@services/tenancy.service';

class TenancyController {
    public tenancyService = new TenancyService();

    public getAllTenancies = async (req: Request, res: Response, next: NextFunction) => {
      try {
        const findAllTenanciesData: Tenancy[] = await this.tenancyService.findAllTenancy();
        res.status(200).json({ data: findAllTenanciesData, message: 'findAll' });
      } catch (error) {
        next(error);
      }
    };
  
    public getTenancyById = async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.params.id;
        const findOneUserData: Tenancy = await this.tenancyService.findTenancyById(userId);
        res.status(200).json({ data: findOneUserData, message: 'findOne' });
      } catch (error) {
        next(error);
      }
    };
  
    public createTenancy = async (req: Request, res: Response, next: NextFunction) => {
      try {
        const tenancyData: CreateTenancyDto = req.body;
        console.log(tenancyData)
        const createTenancyData: Tenancy = await this.tenancyService.createTenancy(tenancyData);
        res.status(201).json({ data: createTenancyData, message: 'created' });
      } catch (error) {
        next(error);
      }
    };
  
    public updateTenancy = async (req: Request, res: Response, next: NextFunction) => {
      try {
        const tenancyId = req.params.id;
        const tenancyData = req.body;
        const updateTenancyData: Tenancy = await this.tenancyService.updateTenancy(tenancyId, tenancyData);
        res.status(200).json({ data: updateTenancyData, message: 'updated' });
      } catch (error) {
        next(error);
      }
    };
  
    public deleteTenancy = async (req: Request, res: Response, next: NextFunction) => {
      try {
        const tenancyId = req.params.id;
        const deleteTenancyData: Tenancy = await this.tenancyService.deleteTenancy(tenancyId);
        res.status(200).json({ data: deleteTenancyData, message: 'deleted' });
      } catch (error) {
        next(error);
      }
    };
}

export default TenancyController
