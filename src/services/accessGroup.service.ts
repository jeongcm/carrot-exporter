import DB from 'databases';
import { CreateAccessGroupDto } from '@dtos/accessGroup.dto';
import { HttpException } from '@exceptions/HttpException';
import { AccessGroup } from '@interfaces/accessGroup.interface';
import { isEmpty } from '@utils/util';

class AccessGroupService {
  public accessGroup = DB.AccessGroup;

  public async createAccessGroup(accessGroupData: CreateAccessGroupDto, currentUserId: string): Promise<AccessGroup> {
    if (isEmpty(accessGroupData)) throw new HttpException(400, 'Access Group must not be empty');

    const findAccessGroup: AccessGroup = await this.accessGroup.findOne({ where: { groupName: accessGroupData.groupName } });
    if (findAccessGroup) throw new HttpException(409, `You're group name ${accessGroupData.groupName} already exist.`);

    const createAccessGroupData: AccessGroup = await this.accessGroup.create({
      ...accessGroupData,
      updatedBy: currentUserId,
      createdBy: currentUserId,
    });

    return createAccessGroupData;
  }

  public async findAllAccessGroup(): Promise<AccessGroup[]> {
    const allAccessGroup: AccessGroup[] = await this.accessGroup.findAll({});
    return allAccessGroup;
  }

  public async findAccessGroupById(id: string): Promise<AccessGroup> {
    if (isEmpty(id)) throw new HttpException(400, 'Not a valid Access Group');

    const findAccessGroup: AccessGroup = await this.accessGroup.findByPk(id);
    if (!findAccessGroup) throw new HttpException(409, 'Access Group Not found');
    return findAccessGroup;
  }

  public async findAllAccessGroupByUserId(currentUserId: string): Promise<AccessGroup[]> {
    const allAccessGroup: AccessGroup[] = await this.accessGroup.findAll({ where: { createdBy: currentUserId } });
    return allAccessGroup;
  }

  public async updateAccessGroup(accessGroupId: string, accessGroupData: CreateAccessGroupDto, currentUserId: string): Promise<AccessGroup> {
    if (isEmpty(accessGroupData)) throw new HttpException(400, 'Access Group Data cannot be blank');
    const findChannel: AccessGroup = await this.accessGroup.findByPk(accessGroupId);
    if (!findChannel) throw new HttpException(409, "Access Group doesn't exist");
    let updatedAccessGroupData = {
      ...accessGroupData,
      updatedBy: currentUserId,
      updatedAt: new Date(),
    };
    await this.accessGroup.update(updatedAccessGroupData, { where: { id: accessGroupId } });
    const updateData: AccessGroup = await this.accessGroup.findByPk(accessGroupId);
    return updateData;
  }
}

export default AccessGroupService;
