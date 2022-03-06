import { NextFunction, Response } from 'express';
import TenancyService from '@/modules/UserTenancy/services/tenancy.service';
import { RequestWithUser } from '@/common/interfaces/auth.interface';
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
