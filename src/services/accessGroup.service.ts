import DB from 'databases';
import { CreateAccessGroupDto } from '@dtos/accessGroup.dto';
import { HttpException } from '@exceptions/HttpException';
import { AccessGroup } from '@interfaces/accessGroup.interface';
import { AccessGroupMember } from '@interfaces/accessGroupMember.interface';
import { AccessGroupCluster } from '@interfaces/accessGroupCluster.interface';
import { AccessGroupChannel } from '@interfaces/accessGroupChannel.interface';
import { isEmpty } from '@utils/util';

class AccessGroupService {
  public accessGroup = DB.AccessGroup;
  public accessGroupMember = DB.AccessGroupMember;
  public accessGroupCluster = DB.AccessGroupCluster;
  public accessGroupChannel = DB.AccessGroupChannel;

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
    const findaccessGroup: AccessGroup = await this.accessGroup.findByPk(accessGroupId);
    if (!findaccessGroup) throw new HttpException(409, "Access Group doesn't exist");
    let updatedAccessGroupData = {
      ...accessGroupData,
      updatedBy: currentUserId,
      updatedAt: new Date(),
    };
    await this.accessGroup.update(updatedAccessGroupData, { where: { id: accessGroupId } });
    const updateData: AccessGroup = await this.accessGroup.findByPk(accessGroupId);
    return updateData;
  }

  public async updateAccessGroupMembers(
    accessGroupId: string,
    accessGroupMembers: AccessGroupMember[],
    currentUserId: string,
  ): Promise<AccessGroupMember[]> {
    if (isEmpty(accessGroupMembers)) throw new HttpException(400, 'Members Data cannot be blank');
    accessGroupMembers = Array.from(new Set(accessGroupMembers.map(a => a.memberId))).map(id => {
      return accessGroupMembers.find(a => a.memberId === id);
    });
    const findAccessGroupMembers: AccessGroupMember[] = await this.accessGroupMember.findAll({ where: { groupId: accessGroupId } });
    let currentTime = new Date();
    let updatedAccessGroupMembers: AccessGroupMember[];
    if (findAccessGroupMembers.length === 0) {
      let updatedMembers = accessGroupMembers.map((accessGroupMembersX: AccessGroupMember) => {
        return {
          memberId: accessGroupMembersX.memberId,
          groupId: accessGroupId,
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
        { where: { groupId: accessGroupId } },
      );
      let updatedMembers = accessGroupMembers.map((accessGroupMembersX: AccessGroupMember) => {
        return {
          memberId: accessGroupMembersX.memberId,
          groupId: accessGroupId,
          createdBy: currentUserId,
          updatedBy: currentUserId,
          createdAt: currentTime,
          updatedAt: currentTime,
        };
      });
      updatedAccessGroupMembers = await this.accessGroupMember.bulkCreate(updatedMembers, { updateOnDuplicate: ['groupId', 'memberId'] });
    }
    return updatedAccessGroupMembers;
  }

  public async getAccessGroupMembers(accessGroupId: string): Promise<AccessGroupMember[]> {
    const findAccessGroupMembers: AccessGroupMember[] = await this.accessGroupMember.findAll({ where: { groupId: accessGroupId, isDeleted: false } });
    return findAccessGroupMembers;
  }

  public async updateAccessGroupChannels(
    accessGroupId: string,
    accessGroupChannels: AccessGroupChannel[],
    currentUserId: string,
  ): Promise<AccessGroupChannel[]> {
    if (isEmpty(accessGroupChannels)) throw new HttpException(400, 'Channels Data cannot be blank');
    accessGroupChannels = Array.from(new Set(accessGroupChannels.map(a => a.channelId))).map(id => {
      return accessGroupChannels.find(a => a.channelId === id);
    });
    const findAccessGroupChannels: AccessGroupChannel[] = await this.accessGroupChannel.findAll({ where: { groupId: accessGroupId } });
    let currentTime = new Date();
    let updatedAccessGroupChannels: AccessGroupChannel[];
    if (findAccessGroupChannels.length === 0) {
      let updatedChannels = accessGroupChannels.map((accessGroupChannelsX: AccessGroupChannel) => {
        return {
          channelId: accessGroupChannelsX.channelId,
          groupId: accessGroupId,
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
        { where: { groupId: accessGroupId } },
      );
      let updatedChannels = accessGroupChannels.map((accessGroupChannelsX: AccessGroupChannel) => {
        return {
          channelId: accessGroupChannelsX.channelId,
          groupId: accessGroupId,
          createdBy: currentUserId,
          updatedBy: currentUserId,
          createdAt: currentTime,
          updatedAt: currentTime,
        };
      });
      updatedAccessGroupChannels = await this.accessGroupChannel.bulkCreate(updatedChannels, { updateOnDuplicate: ['groupId', 'channelId'] });
    }
    return updatedAccessGroupChannels;
  }

  public async getAccessGroupChannels(accessGroupId: string): Promise<AccessGroupChannel[]> {
    const findAccessGroupChannels: AccessGroupChannel[] = await this.accessGroupChannel.findAll({ where: { groupId: accessGroupId, isDeleted: false } });
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
    const findAccessGroupClusters: AccessGroupCluster[] = await this.accessGroupCluster.findAll({ where: { groupId: accessGroupId } });
    let currentTime = new Date();
    let updatedAccessGroupClusters: AccessGroupCluster[];
    if (findAccessGroupClusters.length === 0) {
      let updatedClusters = accessGroupClusters.map((accessGroupClustersX: AccessGroupCluster) => {
        return {
          clusterId: accessGroupClustersX.clusterId,
          groupId: accessGroupId,
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
        { where: { groupId: accessGroupId } },
      );
      let updatedClusters = accessGroupClusters.map((accessGroupClustersX: AccessGroupCluster) => {
        return {
          clusterId: accessGroupClustersX.clusterId,
          groupId: accessGroupId,
          createdBy: currentUserId,
          updatedBy: currentUserId,
          createdAt: currentTime,
          updatedAt: currentTime,
        };
      });
      updatedAccessGroupClusters = await this.accessGroupCluster.bulkCreate(updatedClusters, { updateOnDuplicate: ['groupId', 'clusterId'] });
    }
    return updatedAccessGroupClusters;
  }

  public async getAccessGroupClusters(accessGroupId: string): Promise<AccessGroupCluster[]> {
    const findAccessGroupClusters: AccessGroupCluster[] = await this.accessGroupCluster.findAll({ where: { groupId: accessGroupId, isDeleted: false } });
    return findAccessGroupClusters;
  }
}

export default AccessGroupService;
