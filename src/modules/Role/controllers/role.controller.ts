import { NextFunction, Response } from 'express';
import { IRequestWithUser } from '@/common/interfaces/party.interface';
import { IRole } from '@/common/interfaces/role.interface';
import RoleService from '@/modules/Role/services/role.service';

class RoleController {
  public roleService = new RoleService();

  public getRoles = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;

    try {
      const roleAll: IRole[] = await this.roleService.getRoles(customerAccountKey);
      if (roleAll) {
        return res.status(200).json({ data: roleAll, message: 'success' });
      }
    } catch (error) {
      next(error);
    }
  };
}

export default RoleController;
