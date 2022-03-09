import DB from '@/database';
import { CreateAccessGroupDto } from '@/modules/UserTenancy/dtos/accessGroup.dto';
import { CreateAccessGroupChannelDto } from '@/modules/UserTenancy/dtos/accessGroupChannel.dto';
import { HttpException } from '@/common/exceptions/HttpException';
import { AccessGroup } from '@/common/interfaces/accessGroup.interface';
import { AccessGroupMember } from '@/common/interfaces/accessGroupMember.interface';
import { AccessGroupCluster } from '@/common/interfaces/accessGroupCluster.interface';
import { AccessGroupChannel } from '@/common/interfaces/accessGroupChannel.interface';
import { isEmpty } from '@/common/utils/util';
import { ChannelModel } from '@/modules/Messaging/models/channel.model';
import { UserModel } from '@/modules/UserTenancy/models/users.model';
import { ClusterModel } from '@/modules/K8s/models/cluster.model';

/**
 * For Access Group
 * @memberof UserTenancy
 */
class AccessGroupService {
  public accessGroup = DB.AccessGroup;
  public accessGroupMember = DB.AccessGroupMember;
  public accessGroupCluster = DB.AccessGroupCluster;
  public accessGroupChannel = DB.AccessGroupChannel;

  /**
   * Create a new Access Group
   *
   * @param  {CreateAccessGroupDto} accessGroupData
   * @param  {number} currentUserId
   * @param  {number} tenancyPk
   * @returns Promise
   */
  public async createAccessGroup(accessGroupData: CreateAccessGroupDto, currentUserPk: number, tenancyPk: number): Promise<AccessGroup> {
    if (!tenancyPk) throw new HttpException(400, `tenancyPk is required in headers.`);

    if (isEmpty(accessGroupData)) throw new HttpException(400, 'Access Group must not be empty');

    const findAccessGroup: AccessGroup = await this.accessGroup.findOne({ where: { groupName: accessGroupData.groupName } });

    if (findAccessGroup) throw new HttpException(409, `You're group name ${accessGroupData.groupName} already exist.`);

    const createAccessGroupData: AccessGroup = await this.accessGroup.create({
      ...accessGroupData,
      updatedBy: currentUserPk,
      createdBy: currentUserPk,
      tenancyPk,
    });

    return createAccessGroupData;
  }

  public async findAllAccessGroup(tenancyPk: number): Promise<AccessGroup[]> {
    if (!tenancyPk) throw new HttpException(400, `tenancyPk is required in headers.`);

    const allAccessGroup: AccessGroup[] = await this.accessGroup.findAll({ where: { tenancyPk } });
    return allAccessGroup;
  }

  public async findAccessGroupById(id: string): Promise<AccessGroup> {
    if (isEmpty(id)) throw new HttpException(400, 'Not a valid Access Group');

    const findAccessGroup: AccessGroup = await this.accessGroup.findOne({
      where: { id },
      include: [
        {
          model: ChannelModel,
          as: 'channels',
          attributes: ['channelType', 'description', 'name', 'createdAt', 'createdBy', 'id', 'updatedAt', 'updatedBy'],
        },
        {
          model: UserModel,
          as: 'members',
          attributes: ['email', 'username', 'photo', 'id'],
        },
      ],
    });

    if (!findAccessGroup) throw new HttpException(409, 'Access Group Not found');

    return findAccessGroup;
  }

  public async findAccessGroupByIdDetail(id: string): Promise<AccessGroup> {
    if (isEmpty(id)) throw new HttpException(400, 'Not a valid Access Group');

    const findAccessGroup: AccessGroup = await this.accessGroup.findOne({
      where: { id },
      include: [
        {
          model: UserModel,
          as: 'members',
          attributes: ['email', 'username', 'photo', 'id'],
        },
        {
          model: ClusterModel,
          as: 'clusters',
        },
      ],
    });

    if (!findAccessGroup) throw new HttpException(409, 'Access Group Not found');

    return findAccessGroup;
  }

  /**
   * @param  {string} currentUserId
   * @returns Promise<AccessGroup[]>
   */
  public async findAllAccessGroupByUserId(currentUserId: string): Promise<AccessGroup[]> {
    const user = await DB.Users.findOne({ where: { id: currentUserId }, raw: true });

    if (!user) {
      return null;
    }

    const allAccessGroup: AccessGroup[] = await this.accessGroup.findAll({
      where: { isDeleted: false },
      include: [
        {
          model: DB.AccessGroupMember,
          where: {
            userPk: user.pk,
          },
        },
      ],
    });
    return allAccessGroup;
  }

  /**
   * @param  {string} accessGroupId
   * @param  {CreateAccessGroupDto} accessGroupData
   * @param  {number} currentUserPk
   * @returns Promise<AccessGroup>
   */
  public async updateAccessGroup(accessGroupId: string, accessGroupData: CreateAccessGroupDto, currentUserPk: number): Promise<AccessGroup> {
    if (isEmpty(accessGroupData)) throw new HttpException(400, 'Access Group Data cannot be blank');

    const findaccessGroup: AccessGroup = await this.accessGroup.findOne({ where: { id: accessGroupId } });

    if (!findaccessGroup) throw new HttpException(409, "Access Group doesn't exist");

    const updatedAccessGroupData = {
      ...accessGroupData,
      updatedBy: currentUserPk,
      updatedAt: new Date(),
    };

    await this.accessGroup.update(updatedAccessGroupData, { where: { id: accessGroupId } });

    const updateData: AccessGroup = await this.accessGroup.findByPk(findaccessGroup.pk);

    return updateData;
  }

  public async updateAccessGroupMembers(
    accessGroupId: string,
    accessGroupMembers: AccessGroupMember[],
    currentUserPk: number,
  ): Promise<AccessGroupMember[]> {
    if (isEmpty(accessGroupMembers)) throw new HttpException(400, 'Members Data cannot be blank');

    const accessGroup: AccessGroup = await this.accessGroup.findOne({ where: { id: accessGroupId } });

    if (!accessGroup) {
      return [];
    }

    const accessGroupPk = accessGroup.pk;

    accessGroupMembers = Array.from(new Set(accessGroupMembers.map(a => a.userPk))).map(id => {
      return accessGroupMembers.find(a => a.userPk === id);
    });

    const findAccessGroupMembers: AccessGroupMember[] = await this.accessGroupMember.findAll({ where: { accessGroupPk: accessGroupPk } });

    const currentTime = new Date();

    let updatedAccessGroupMembers: AccessGroupMember[];

    if (findAccessGroupMembers.length === 0) {
      const updatedMembers = accessGroupMembers.map((accessGroupMembersX: AccessGroupMember) => {
        return {
          userPk: accessGroupMembersX.userPk,
          accessGroupPk: accessGroupPk,
          createdBy: currentUserPk,
          updatedBy: currentUserPk,
          createdAt: currentTime,
          updatedAt: currentTime,
        };
      });

      updatedAccessGroupMembers = await this.accessGroupMember.bulkCreate(updatedMembers);
    } else {
      await this.accessGroupMember.update(
        { isDeleted: true, updatedAt: currentTime, updatedBy: currentUserPk },
        { where: { userPk: accessGroupPk } },
      );

      const updatedMembers = accessGroupMembers.map((accessGroupMembersX: AccessGroupMember) => {
        return {
          userPk: accessGroupMembersX.userPk,
          accessGroupPk: accessGroupPk,
          createdBy: currentUserPk,
          updatedBy: currentUserPk,
          createdAt: currentTime,
          updatedAt: currentTime,
        };
      });

      updatedAccessGroupMembers = await this.accessGroupMember.bulkCreate(updatedMembers, { updateOnDuplicate: ['accessGroupPk', 'userPk'] });
    }
    return updatedAccessGroupMembers;
  }

  public async getAccessGroupMembers(accessGroupId: string): Promise<AccessGroupMember[]> {
    const accessGroup: AccessGroup = await this.accessGroup.findOne({ where: { id: accessGroupId } });

    if (!accessGroup) {
      return [];
    }

    const accessGroupPk = accessGroup.pk;

    const findAccessGroupMembers: AccessGroupMember[] = await this.accessGroupMember.findAll({
      where: { accessGroupPk: accessGroupPk, isDeleted: false },
    });
    return findAccessGroupMembers;
  }

  // TODO:
  public async updateAccessGroupChannels(
    accessGroupPk: number,
    accessGroupChannels: AccessGroupChannel[],
    currentUserId: string,
  ): Promise<CreateAccessGroupChannelDto[]> {
    if (isEmpty(accessGroupChannels)) throw new HttpException(400, 'Channels Data cannot be blank');

    accessGroupChannels = Array.from(new Set(accessGroupChannels.map(a => a.channelPk))).map(id => {
      return accessGroupChannels.find(a => a.channelPk === id);
    });

    const findAccessGroupChannels: AccessGroupChannel[] = await this.accessGroupChannel.findAll({ where: { accessGroupPk: accessGroupPk } });

    const currentTime = new Date();

    let updatedAccessGroupChannels: CreateAccessGroupChannelDto[];

    if (findAccessGroupChannels.length === 0) {
      const updatedChannels: CreateAccessGroupChannelDto[] = accessGroupChannels.map((accessGroupChannelsX: AccessGroupChannel) => {
        return {
          channelPk: accessGroupChannelsX.channelPk,
          accessGroupPk: accessGroupPk,
          createdBy: currentUserId,
          updatedBy: currentUserId,
          createdAt: currentTime,
          updatedAt: currentTime,
        };
      });

      updatedAccessGroupChannels = await this.accessGroupChannel.bulkCreate(updatedChannels);
    } else {
      await this.accessGroupChannel.update(
        { isDeleted: true, updatedAt: currentTime, updatedBy: currentUserId },
        { where: { accessGroupPk: accessGroupPk } },
      );

      const updatedChannels: CreateAccessGroupChannelDto[] = accessGroupChannels.map((accessGroupChannelsX: AccessGroupChannel) => {
        return {
          channelPk: accessGroupChannelsX.channelPk,
          accessGroupPk: accessGroupPk,
          createdBy: currentUserId,
          updatedBy: currentUserId,
          createdAt: currentTime,
          updatedAt: currentTime,
        };
      });

      updatedAccessGroupChannels = await this.accessGroupChannel.bulkCreate(updatedChannels, { updateOnDuplicate: ['accessGroupPk', 'channelPk'] });
    }

    return updatedAccessGroupChannels;
  }

  public async getAccessGroupChannels(accessGroupPk: number): Promise<AccessGroupChannel[]> {
    const findAccessGroupChannels: AccessGroupChannel[] = await this.accessGroupChannel.findAll({
      where: { accessGroupPk: accessGroupPk, isDeleted: false },
      attributes: ['id'],
      include: [
        {
          model: ChannelModel,
          attributes: ['name', 'channelType', 'description', 'configJSON', 'id'],
        },
      ],
    });

    return findAccessGroupChannels;
  }

  public async updateAccessGroupClusters(
    accessGroupPk: number,
    accessGroupClusters: AccessGroupCluster[],
    currentUserId: string,
  ): Promise<AccessGroupCluster[]> {
    if (isEmpty(accessGroupClusters)) throw new HttpException(400, 'Clusters Data cannot be blank');

    accessGroupClusters = Array.from(new Set(accessGroupClusters.map(a => a.clusterPk))).map(id => {
      return accessGroupClusters.find(a => a.clusterPk === id);
    });

    const findAccessGroupClusters: AccessGroupCluster[] = await this.accessGroupCluster.findAll({ where: { accessGroupPk: accessGroupPk } });

    const currentTime = new Date();

    let updatedAccessGroupClusters: AccessGroupCluster[];

    if (findAccessGroupClusters.length === 0) {
      const updatedClusters = accessGroupClusters.map((accessGroupClustersX: AccessGroupCluster) => {
        return {
          clusterPk: accessGroupClustersX.clusterPk,
          accessGroupPk: accessGroupPk,
          createdBy: currentUserId,
          updatedBy: currentUserId,
          createdAt: currentTime,
          updatedAt: currentTime,
        };
      });

      updatedAccessGroupClusters = await this.accessGroupCluster.bulkCreate(updatedClusters);
    } else {
      await this.accessGroupCluster.update(
        { isDeleted: true, updatedAt: currentTime, updatedBy: currentUserId },
        { where: { accessGroupPk: accessGroupPk } },
      );

      const updatedClusters = accessGroupClusters.map((accessGroupClustersX: AccessGroupCluster) => {
        return {
          clusterPk: accessGroupClustersX.clusterPk,
          accessGroupPk: accessGroupPk,
          createdBy: currentUserId,
          updatedBy: currentUserId,
          createdAt: currentTime,
          updatedAt: currentTime,
        };
      });

      updatedAccessGroupClusters = await this.accessGroupCluster.bulkCreate(updatedClusters, { updateOnDuplicate: ['accessGroupPk', 'clusterPk'] });
    }

    return updatedAccessGroupClusters;
  }

  public async getAccessGroupClusters(accessGroupPk: number): Promise<AccessGroupCluster[]> {
    const findAccessGroupClusters: AccessGroupCluster[] = await this.accessGroupCluster.findAll({
      where: { accessGroupPk: accessGroupPk, isDeleted: false },
    });

    return findAccessGroupClusters;
  }
}

export default AccessGroupService;
