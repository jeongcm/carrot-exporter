import DB from 'databases';
import { CreateAccessGroupDto } from '@dtos/accessGroup.dto';
import { HttpException } from '@exceptions/HttpException';
import { AccessGroup } from '@interfaces/accessGroup.interface';
import { isEmpty } from '@utils/util';

class AccessGroupService {
  public accessGroup = DB.AccessGroup;

  public async createAccessGroup(accessGroupData: CreateAccessGroupDto): Promise<AccessGroup> {
    if (isEmpty(accessGroupData)) throw new HttpException(400, 'Access Group must not be empty');

    const findAccessGroup: AccessGroup = await this.accessGroup.findOne({ where: { groupName: accessGroupData.groupName } });
    if (findAccessGroup) throw new HttpException(409, `You're group name ${accessGroupData.groupName} already exist.`);

    const createAccessGroupData: AccessGroup = await this.accessGroup.create(accessGroupData);
    return createAccessGroupData;
  }

  public async findAllAccessGroup(): Promise<AccessGroup[]> {
    const allAccessGroup: AccessGroup[] = await this.accessGroup.findAll({});
    return allAccessGroup;
  }
}

export default AccessGroupService;
