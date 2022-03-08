import { NextFunction, Request, Response } from 'express';
import { CreateTenancyDto } from '@/modules/UserTenancy/dtos/tenancy.dto';
import { CreateTenancyMemberDto } from '@/modules/UserTenancy/dtos/tenancyMember.dto';
import { Tenancy } from '@/common/interfaces/tenancy.interface';
import TenancyService from '@/modules/UserTenancy/services/tenancy.service';
import { currentUser } from '@/common/utils/currentUser';
import { TenancyMember } from '@/common/interfaces/tenancyMember.interface';

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
      const userPk = req.params.id;
      const findOneUserData: Tenancy = await this.tenancyService.findTenancyById(userPk);
      res.status(200).json({ data: findOneUserData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public createTenancy = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenancyData: CreateTenancyDto = req.body;
      const createTenancyData: Tenancy = await this.tenancyService.createTenancy(tenancyData);
      res.status(201).json({ data: createTenancyData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateTenancy = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenancyPk = req.params.id;
      const tenancyData = req.body;
      const updateTenancyData: Tenancy = await this.tenancyService.updateTenancy(tenancyPk, tenancyData);
      res.status(200).json({ data: updateTenancyData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteTenancy = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenancyPk = req.params.id;
      const deleteTenancyData: Tenancy = await this.tenancyService.deleteTenancy(tenancyPk);
      res.status(200).json({ data: deleteTenancyData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  public createTenancyMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenancyMemberData: CreateTenancyMemberDto = req.body;
      const currentUserId = currentUser(req).id;
      const createTenancyData: TenancyMember = await this.tenancyService.createTenancyMember(tenancyMemberData, currentUserId);
      res.status(201).json({ data: createTenancyData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public getAllTenancyMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.tenancyPk;
      const findAllTenancyMembers: TenancyMember[] = await this.tenancyService.findAllTenancyMembers(id);
      res.status(200).json({ data: findAllTenancyMembers, message: 'findAllTenancyMembers' });
    } catch (error) {
      next(error);
    }
  };

  public getTenancyMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.tenancyMemberId;
      const findTenancyMembers: TenancyMember = await this.tenancyService.findTenancyMember(id);
      res.status(200).json({ data: findTenancyMembers, message: 'findATenancyMembers' });
    } catch (error) {
      next(error);
    }
  };

  public deleteTenancyMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenancyPk = req.params.tenancyPk;
      const deleteTenancyData: TenancyMember = await this.tenancyService.deleteTenancyMember(tenancyPk);
      res.status(200).json({ data: deleteTenancyData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  // RYAN: whenever you comment something out please provide a context with a ticket number
  //
  // public updateTenancyMember = async (req: Request, res: Response, next: NextFunction) => {
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
