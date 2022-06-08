import { NextFunction, Response } from 'express';
import { IRequestWithUser } from '@/common/interfaces/party.interface';
import { IRoleParty } from '@/common/interfaces/role.interface';
import RoleService from '@/modules/Role/services/role.service';
import PartyService from '@/modules/Party/services/party.service';
import RolePartyService from '@/modules/Role/services/roleParty.service';

class RolePartyController {
  public roleService = new RoleService();
  public rolePartyService = new RolePartyService();

  public partyService = new PartyService();

  public assignRole = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const logginedUserId = req.user.partyId;
    const roleId = req.params.roleId;
    const partyId = req.params.partyId;

    try {
      const roleKey: number = await this.roleService.getRoleKeyById(roleId);
      const partyKey: number = await this.partyService.getPartyKeyById(partyId);

      const assignRole: IRoleParty = await this.rolePartyService.assignRole(roleKey, partyKey, logginedUserId);

      if (assignRole) {
        return res.status(200).json({ data: assignRole, message: 'assigned' });
      }
    } catch (error) {
      next(error);
    }
  };

  public unassignRole = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const logginedUserId = req.user.partyId;
    const roleId = req.params.roleId;
    const partyId = req.params.partyId;

    try {
      const roleKey: number = await this.roleService.getRoleKeyById(roleId);
      const partyKey: number = await this.partyService.getPartyKeyById(partyId);

      const unassignRole: [number] = await this.rolePartyService.unassignRole(roleKey, partyKey, logginedUserId);

      if (unassignRole) {
        return res.status(200).json({ message: 'unassigned' });
      }
    } catch (error) {
      next(error);
    }
  };
}

export default RolePartyController;
