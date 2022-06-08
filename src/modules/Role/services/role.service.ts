import DB from '@/database';

import ServiceExtension from '@/common/extentions/service.extension';
import { IRole } from '@/common/interfaces/role.interface';
import { Op } from 'sequelize';

/**
 * @memberof Role
 */
class RoleService extends ServiceExtension {
  public role = DB.Role;

  constructor() {
    super({
      tableName: 'Role',
    });
  }

  public async getRoles(customerAccountKey: number): Promise<IRole[]> {
    try {
      const findAll: IRole[] = await this.role.findAll({
        where: { [Op.or]: [{ customerAccountKey: null }, { customerAccountKey }] },
        attributes: { exclude: ['customerAccountKey'] },
      });
      return findAll;
    } catch (e) {
      this.throwError(`EXCEPTION`, e);
    }
  }

  public async getRoleKeyById(roleId: string): Promise<number> {
    const role: IRole = await this.role.findOne({
      where: { roleId },
      attributes: ['roleKey'],
    });

    return role.roleKey;
  }
}

export default RoleService;
