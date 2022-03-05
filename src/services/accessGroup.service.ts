import DB from 'databases';
import { CreateAccessGroupDto } from '@dtos/accessGroup.dto';
import { CreateAccessGroupChannelDto } from '@dtos/accessGroupChannel.dto';
import { HttpException } from '@exceptions/HttpException';
import { AccessGroup } from '@interfaces/accessGroup.interface';
import { AccessGroupMember } from '@interfaces/accessGroupMember.interface';
import { AccessGroupCluster } from '@interfaces/accessGroupCluster.interface';
import { AccessGroupChannel } from '@interfaces/accessGroupChannel.interface';
import { isEmpty } from '@utils/util';
import { ChannelModel } from '@/models/channel.model';
import { UserModel } from '@/models/users.model';
import { ClusterModel } from '@/models/cluster.model';

class AccessGroupService {
  public accessGroup = DB.AccessGroup;
  public accessGroupMember = DB.AccessGroupMember;
  public accessGroupCluster = DB.AccessGroupCluster;
  public accessGroupChannel = DB.AccessGroupChannel;
  /**
   * @param  {CreateAccessGroupDto} accessGroupData
   * @param  {string} currentUserId
   * @param  {string} tenancyId
   */
  public async createAccessGroup(accessGroupData: CreateAccessGroupDto, currentUserId: string, tenancyId: string): Promise<AccessGroup> {
    if (!tenancyId) throw new HttpException(400, `tenancyId is required in headers.`);

    if (isEmpty(accessGroupData)) throw new HttpException(400, 'Access Group must not be empty');

    const findAccessGroup: AccessGroup = await this.accessGroup.findOne({ where: { groupName: accessGroupData.groupName } });

    if (findAccessGroup) throw new HttpException(409, `You're group name ${accessGroupData.groupName} already exist.`);

    const createAccessGroupData: AccessGroup = await this.accessGroup.create({
      ...accessGroupData,
      updatedBy: currentUserId,
      createdBy: currentUserId,
      tenancyId,
    });

    return createAccessGroupData;
  }
  /**
   * @param  {string} tenancyId
   */
  public async findAllAccessGroup(tenancyId: string): Promise<AccessGroup[]> {
    if (!tenancyId) throw new HttpException(400, `tenancyId is required in headers.`);

    const allAccessGroup: AccessGroup[] = await this.accessGroup.findAll({ where: { tenancyId } });
    return allAccessGroup;
  }
  /**
   * @param  {string} id
   */
  public async findAccessGroupById(id: string): Promise<AccessGroup> {
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
  /**
   * @param  {string} id
   */
  public async findAccessGroupByIdDetail(id: string): Promise<AccessGroup> {
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
  /**
   * @param  {string} currentUserId
   */
  public async findAllAccessGroupByUserId(currentUserId: string): Promise<AccessGroup[]> {
    const allAccessGroup: AccessGroup[] = await this.accessGroup.findAll({ where: { createdBy: currentUserId } });
    return allAccessGroup;
  }
  /**
   * @param  {string} accessGroupId
   * @param  {CreateAccessGroupDto} accessGroupData
   * @param  {string} currentUserId
   */
  public async updateAccessGroup(accessGroupId: string, accessGroupData: CreateAccessGroupDto, currentUserId: string): Promise<AccessGroup> {
    if (isEmpty(accessGroupData)) throw new HttpException(400, 'Access Group Data cannot be blank');

    const findaccessGroup: AccessGroup = await this.accessGroup.findByPk(accessGroupId);

    if (!findaccessGroup) throw new HttpException(409, "Access Group doesn't exist");

    const updatedAccessGroupData = {
      ...accessGroupData,
      updatedBy: currentUserId,
      updatedAt: new Date(),
    };

    await this.accessGroup.update(updatedAccessGroupData, { where: { id: accessGroupId } });

    const updateData: AccessGroup = await this.accessGroup.findByPk(accessGroupId);

    return updateData;
  }
  /**
   * @param  {string} accessGroupId
   * @param  {AccessGroupMember[]} accessGroupMembers
   * @param  {string} currentUserId
   */
  public async updateAccessGroupMembers(
    accessGroupId: string,
    accessGroupMembers: AccessGroupMember[],
    currentUserId: string,
  ): Promise<AccessGroupMember[]> {
    if (isEmpty(accessGroupMembers)) throw new HttpException(400, 'Members Data cannot be blank');

    accessGroupMembers = Array.from(new Set(accessGroupMembers.map(a => a.userId))).map(id => {
      return accessGroupMembers.find(a => a.userId === id);
    });

    const findAccessGroupMembers: AccessGroupMember[] = await this.accessGroupMember.findAll({ where: { accessGroupId: accessGroupId } });

    const currentTime = new Date();

    let updatedAccessGroupMembers: AccessGroupMember[];

    if (findAccessGroupMembers.length === 0) {
      const updatedMembers = accessGroupMembers.map((accessGroupMembersX: AccessGroupMember) => {
        return {
          userId: accessGroupMembersX.userId,
          accessGroupId: accessGroupId,
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
        { where: { userId: accessGroupId } },
      );

      const updatedMembers = accessGroupMembers.map((accessGroupMembersX: AccessGroupMember) => {
        return {
          userId: accessGroupMembersX.userId,
          accessGroupId: accessGroupId,
          createdBy: currentUserId,
          updatedBy: currentUserId,
          createdAt: currentTime,
          updatedAt: currentTime,
        };
      });

      updatedAccessGroupMembers = await this.accessGroupMember.bulkCreate(updatedMembers, { updateOnDuplicate: ['accessGroupId', 'userId'] });
    }
    return updatedAccessGroupMembers;
  }
  /**
   * @param  {string} accessGroupId
   */
  public async getAccessGroupMembers(accessGroupId: string): Promise<AccessGroupMember[]> {
    const findAccessGroupMembers: AccessGroupMember[] = await this.accessGroupMember.findAll({
      where: { accessGroupId: accessGroupId, isDeleted: false },
    });
    return findAccessGroupMembers;
  }

  public async updateAccessGroupChannels(
    accessGroupId: string,
    accessGroupChannels: AccessGroupChannel[],
    currentUserId: string,
  ): Promise<CreateAccessGroupChannelDto[]> {
    if (isEmpty(accessGroupChannels)) throw new HttpException(400, 'Channels Data cannot be blank');

    accessGroupChannels = Array.from(new Set(accessGroupChannels.map(a => a.channelId))).map(id => {
      return accessGroupChannels.find(a => a.channelId === id);
    });

    const findAccessGroupChannels: AccessGroupChannel[] = await this.accessGroupChannel.findAll({ where: { accessGroupId: accessGroupId } });

    const currentTime = new Date();

    let updatedAccessGroupChannels: CreateAccessGroupChannelDto[];

    if (findAccessGroupChannels.length === 0) {
      const updatedChannels: CreateAccessGroupChannelDto[] = accessGroupChannels.map((accessGroupChannelsX: AccessGroupChannel) => {
        return {
          channelId: accessGroupChannelsX.channelId,
          accessGroupId: accessGroupId,
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
        { where: { accessGroupId: accessGroupId } },
      );

      const updatedChannels: CreateAccessGroupChannelDto[] = accessGroupChannels.map((accessGroupChannelsX: AccessGroupChannel) => {
        return {
          channelId: accessGroupChannelsX.channelId,
          accessGroupId: accessGroupId,
          createdBy: currentUserId,
          updatedBy: currentUserId,
          createdAt: currentTime,
          updatedAt: currentTime,
        };
      });

      updatedAccessGroupChannels = await this.accessGroupChannel.bulkCreate(updatedChannels, { updateOnDuplicate: ['accessGroupId', 'channelId'] });
    }

    return updatedAccessGroupChannels;
  }

  public async getAccessGroupChannels(accessGroupId: string): Promise<AccessGroupChannel[]> {
    const findAccessGroupChannels: AccessGroupChannel[] = await this.accessGroupChannel.findAll({
      where: { accessGroupId: accessGroupId, isDeleted: false },
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
    accessGroupId: string,
    accessGroupClusters: AccessGroupCluster[],
    currentUserId: string,
  ): Promise<AccessGroupCluster[]> {
    if (isEmpty(accessGroupClusters)) throw new HttpException(400, 'Clusters Data cannot be blank');

    accessGroupClusters = Array.from(new Set(accessGroupClusters.map(a => a.clusterId))).map(id => {
      return accessGroupClusters.find(a => a.clusterId === id);
    });

    const findAccessGroupClusters: AccessGroupCluster[] = await this.accessGroupCluster.findAll({ where: { accessGroupId: accessGroupId } });

    const currentTime = new Date();

    let updatedAccessGroupClusters: AccessGroupCluster[];

    if (findAccessGroupClusters.length === 0) {
      const updatedClusters = accessGroupClusters.map((accessGroupClustersX: AccessGroupCluster) => {
        return {
          clusterId: accessGroupClustersX.clusterId,
          accessGroupId: accessGroupId,
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
        { where: { accessGroupId: accessGroupId } },
      );

      const updatedClusters = accessGroupClusters.map((accessGroupClustersX: AccessGroupCluster) => {
        return {
          clusterId: accessGroupClustersX.clusterId,
          accessGroupId: accessGroupId,
          createdBy: currentUserId,
          updatedBy: currentUserId,
          createdAt: currentTime,
          updatedAt: currentTime,
        };
      });

      updatedAccessGroupClusters = await this.accessGroupCluster.bulkCreate(updatedClusters, { updateOnDuplicate: ['accessGroupId', 'clusterId'] });
    }

    return updatedAccessGroupClusters;
  }

  public async getAccessGroupClusters(accessGroupId: string): Promise<AccessGroupCluster[]> {
    const findAccessGroupClusters: AccessGroupCluster[] = await this.accessGroupCluster.findAll({
      where: { accessGroupId: accessGroupId, isDeleted: false },
    });

    return findAccessGroupClusters;
  }
}

export default AccessGroupService;
