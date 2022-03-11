import { NextFunction, Response } from 'express';
import TenancyService from '@/modules/UserTenancy/services/tenancy.service';
import { RequestWithUser } from '@/common/interfaces/auth.interface';
import { TenancyMember } from '@/common/interfaces/tenancyMember.interface';
class TenancyMemberController {
  public tenancyService = new TenancyService();
  public updateUserCurrentTenancy = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const tenancyId = req.params.tenancyId;
      const userPk = req.user.pk;

      const updateUserData = await this.tenancyService.updateUserCurrentTenancy(userPk, tenancyId);

      return res.status(200).json({ data: updateUserData, message: 'updated tenancy id' });
    } catch (error) {
      next(error);
    }
  };

  public getAllTenancyMember = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const id = req.params.tenancyId;
      const findAllTenancyMembers: TenancyMember[] = await this.tenancyService.findAllTenancyMembers(id);
      res.status(200).json({ data: findAllTenancyMembers, message: 'findAllTenancyMembers' });
    } catch (error) {
      next(error);
    }
  };

  public getTenancyMember = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const memberId = req.params.memberId;
      const tenancyId = req.params.tenancyId;
      const findTenancyMembers: TenancyMember = await this.tenancyService.findTenancyMemberById(tenancyId, memberId);
      res.status(200).json({ data: findTenancyMembers, message: 'findATenancyMembers' });
    } catch (error) {
      next(error);
    }
  };

  public deleteTenancyMember = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const memberId = req.params.memberId;
      const tenancyId = req.params.tenancyId;
      const deleted: boolean = await this.tenancyService.deleteTenancyMemberById(req.user.pk, tenancyId, memberId);
      res.status(200).json({ deleted });
    } catch (error) {
      next(error);
    }
  };
}

export default TenancyMemberController;
