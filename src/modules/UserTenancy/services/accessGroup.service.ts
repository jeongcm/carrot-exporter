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
  public async createAccessGroup(accessGroupData: CreateAccessGroupDto, currentUserId: string, tenancyPk: string): Promise<AccessGroup> {
    if (!tenancyPk) throw new HttpException(400, `tenancyPk is required in headers.`);

    if (isEmpty(accessGroupData)) throw new HttpException(400, 'Access Group must not be empty');

    const findAccessGroup: AccessGroup = await this.accessGroup.findOne({ where: { groupName: accessGroupData.groupName } });

    if (findAccessGroup) throw new HttpException(409, `You're group name ${accessGroupData.groupName} already exist.`);

    const createAccessGroupData: AccessGroup = await this.accessGroup.create({
      ...accessGroupData,
      updatedBy: currentUserId,
      createdBy: currentUserId,
      tenancyPk,
    });

    return createAccessGroupData;
  }

  public async findAllAccessGroup(tenancyPk: string): Promise<AccessGroup[]> {
    if (!tenancyPk) throw new HttpException(400, `tenancyPk is required in headers.`);

    const allAccessGroup: AccessGroup[] = await this.accessGroup.findAll({ where: { tenancyPk } });
    return allAccessGroup;
  }

  public async findAccessGroupById(id: number): Promise<AccessGroup> {
    if (isEmpty(id)) throw new HttpException(400, 'Not a valid Access Group');

    const findAccessGroup: AccessGroup = await this.accessGroup.findByPk(id, {
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

  public async findAccessGroupByIdDetail(id: number): Promise<AccessGroup> {
    if (isEmpty(id)) throw new HttpException(400, 'Not a valid Access Group');

    const findAccessGroup: AccessGroup = await this.accessGroup.findByPk(id, {
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

  public async findAllAccessGroupByUserId(currentUserId: string): Promise<AccessGroup[]> {
    const allAccessGroup: AccessGroup[] = await this.accessGroup.findAll({ where: { createdBy: currentUserId } });
    return allAccessGroup;
  }

  public async updateAccessGroup(accessGroupPk: string, accessGroupData: CreateAccessGroupDto, currentUserId: string): Promise<AccessGroup> {
    if (isEmpty(accessGroupData)) throw new HttpException(400, 'Access Group Data cannot be blank');

    const findaccessGroup: AccessGroup = await this.accessGroup.findByPk(accessGroupPk);

    if (!findaccessGroup) throw new HttpException(409, "Access Group doesn't exist");

    const updatedAccessGroupData = {
      ...accessGroupData,
      updatedBy: currentUserId,
      updatedAt: new Date(),
    };

    await this.accessGroup.update(updatedAccessGroupData, { where: { id: accessGroupPk } });

    const updateData: AccessGroup = await this.accessGroup.findByPk(accessGroupPk);

    return updateData;
  }

  public async updateAccessGroupMembers(
    accessGroupPk: string,
    accessGroupMembers: AccessGroupMember[],
    currentUserId: string,
  ): Promise<AccessGroupMember[]> {
    if (isEmpty(accessGroupMembers)) throw new HttpException(400, 'Members Data cannot be blank');

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
          createdBy: currentUserId,
          updatedBy: currentUserId,
          createdAt: currentTime,
          updatedAt: currentTime,
        };
      });

      updatedAccessGroupMembers = await this.accessGroupMember.bulkCreate(updatedMembers);
    } else {
      await this.accessGroupMember.update(
        { isDeleted: true, updatedAt: currentTime, updatedBy: currentUserId },
        { where: { userPk: accessGroupPk } },
      );

      const updatedMembers = accessGroupMembers.map((accessGroupMembersX: AccessGroupMember) => {
        return {
          userPk: accessGroupMembersX.userPk,
          accessGroupPk: accessGroupPk,
          createdBy: currentUserId,
          updatedBy: currentUserId,
          createdAt: currentTime,
          updatedAt: currentTime,
        };
      });

      updatedAccessGroupMembers = await this.accessGroupMember.bulkCreate(updatedMembers, { updateOnDuplicate: ['accessGroupPk', 'userPk'] });
    }
    return updatedAccessGroupMembers;
  }

  public async getAccessGroupMembers(accessGroupPk: string): Promise<AccessGroupMember[]> {
    const findAccessGroupMembers: AccessGroupMember[] = await this.accessGroupMember.findAll({
      where: { accessGroupPk: accessGroupPk, isDeleted: false },
    });
    return findAccessGroupMembers;
  }

  public async updateAccessGroupChannels(
    accessGroupPk: string,
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

  public async getAccessGroupChannels(accessGroupPk: string): Promise<AccessGroupChannel[]> {
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
    accessGroupPk: string,
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

  public async getAccessGroupClusters(accessGroupPk: string): Promise<AccessGroupCluster[]> {
    const findAccessGroupClusters: AccessGroupCluster[] = await this.accessGroupCluster.findAll({
      where: { accessGroupPk: accessGroupPk, isDeleted: false },
    });

    return findAccessGroupClusters;
  }
}

export default AccessGroupService;
