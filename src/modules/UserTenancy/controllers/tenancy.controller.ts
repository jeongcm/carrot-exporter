import { NextFunction, Response } from 'express';
import { CreateTenancyDto, CreatedTenancyDto } from '@/modules/UserTenancy/dtos/tenancy.dto';
import { Tenancy } from '@/common/interfaces/tenancy.interface';
import { User } from '@/common/interfaces/users.interface';
import TenancyService from '@/modules/UserTenancy/services/tenancy.service';
import { RequestWithUser } from '@/common/interfaces/auth.interface';

class TenancyController {
  public tenancyService = new TenancyService();

  public getAllTenancies = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const findAllTenanciesData: Tenancy[] = await this.tenancyService.findAllTenancy();
      res.status(200).json({ data: findAllTenanciesData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getUserTenancies = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userPk = req.user.pk;
      const findAllTenanciesData: Tenancy[] = await this.tenancyService.findUserTenanciesByUserPk(userPk);
      res.status(200).json({ data: findAllTenanciesData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getTenancyById = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userPk = req.params.id;
      const findOneUserData: Tenancy = await this.tenancyService.findTenancyById(userPk);
      res.status(200).json({ data: findOneUserData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  // RYAN: we need to use proper DTO
  public createTenancy = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const tenancyData: CreateTenancyDto = req.body;
      const ownerUser: User = {
        ...req.user.toJSON(),
      };
      const createdTenancyData: CreatedTenancyDto = await this.tenancyService.createTenancy(tenancyData, ownerUser);
      res.status(201).json({ data: createdTenancyData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateTenancy = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const tenancyId = req.params.id;
      const tenancyData = req.body;
      const updated: boolean = await this.tenancyService.updateTenancyById(tenancyId, req.user.pk, tenancyData);
      res.status(200).json({ updated });
    } catch (error) {
      next(error);
    }
  };

  public deleteTenancy = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const tenancyId = req.params.id;
      const deleted: boolean = await this.tenancyService.deleteTenancyById(tenancyId, req.user.pk);
      res.status(200).json({ deleted });
    } catch (error) {
      next(error);
    }
  };



  // RYAN: whenever you comment something out please provide a context with a ticket number
  //
  // public updateTenancyMember = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  //   try {
  //     const tenancyPk = req.params.tenancyPk;
  //     const updatedData = req.body;
  //     const deleteTenancyData: TenancyMember = await this.tenancyService.updateTenancyMember(updatedData, tenancyPk);
  //     res.status(200).json({ data: deleteTenancyData, message: 'deleted' });
  //   } catch (error) {
  //     next(error);
  //   }
  // };
}

export default TenancyController;
