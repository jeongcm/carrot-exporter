import { NextFunction, Request, Response } from 'express';
import { CreateTenancyDto } from '@dtos/tenancy.dto';
import { CreateTenancyMemberDto } from '@dtos/tenancyMember.dto';
import { Tenancy } from '@interfaces/tenancy.interface';
import TenancyService from '@services/tenancy.service';
import { currentUser } from '@/utils/currentUser';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { User } from '@/interfaces/users.interface';

class TenancyMemberController {
  public tenancyService = new TenancyService();
  public updateTenancyMemberToUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const tenancyId = req.params.tenancyId;
      const userId = req.user.id;
      const updateUserData = await this.tenancyService.updateTenancyMemberToUser(userId, tenancyId);
      return res.status(200).json({ data: updateUserData, message: 'updated tenancy id' });
    } catch (error) {
      next(error);
    }
  };
}

export default TenancyMemberController;
