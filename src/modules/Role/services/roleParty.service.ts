import DB from '@/database';

import ServiceExtension from '@/common/extentions/service.extension';
import { IRole, IRoleParty } from '@/common/interfaces/role.interface';
import { Op } from 'sequelize';

/**
 * @memberof Role
 */
class RolePartyService extends ServiceExtension {
  public roleParty = DB.RoleParty;

  constructor() {
    super({
      tableName: 'RoleParty',
    });
  }

  public async assignRole(roleKey: number, partyKey: number, logginedUserId: string): Promise<IRoleParty> {
    try {
      const newRolePartyId: string = await this.createTableId();

      const assign = await this.roleParty.create({
        rolePartyId: newRolePartyId,
        roleKey,
        partyKey,
        createdBy: logginedUserId,
      });

      return assign;
    } catch (e) {
      this.throwError(`EXCEPTION`, e);
    }
  }

  public async unassignRole(roleKey: number, partyKey: number, logginedUserId: string): Promise<[number]> {
    try {
      const currentDate = new Date();

      const unassign = await this.roleParty.update(
        { deletedAt: currentDate, updatedBy: logginedUserId },
        {
          where: {
            partyKey,
            roleKey,
            deletedAt: null,
          },
        },
      );

      return unassign;
    } catch (e) {
      this.throwError(`EXCEPTION`, e);
    }
  }
}

export default RolePartyService;
