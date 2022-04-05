import DB from '@/database';
import { CreateChannelDto } from '@/modules/Messaging/dtos/channel.dto';
import { HttpException } from '@/common/exceptions/HttpException';
import { Channel } from '@/common/interfaces/channel.interface';
import { isEmpty } from '@/common/utils/util';
import { ChannelType, Platform } from '../../../common/types';
import { AccessGroupChannel } from '@/common/interfaces/accessGroupChannel.interface';
import { AccessGroupModel } from '@/modules/UserTenancy/models/accessGroup.model';

/**
 * @memberof Messaging
 */
class ChannelService {
  public channels = DB.Channel;
  public accessGroupChannel = DB.AccessGroupChannel;

  /**
   * Find all channels
   *
   * @returns Promise<Channel[]>
   * @author Jaswant
   */
  public async findAllChannel(): Promise<Channel[]> {
    const allUser: Channel[] = await this.channels.findAll({
      where: { isDeleted: false },
      attributes: { exclude: ['pk', 'isDeleted', 'updatedBy', 'createdBy'] },
    });
    return allUser;
  }

  /**
   * find channel by Id
   *
   * @param  {string} id
   * @returns Promise<Channel>
   * @author Jaswant
   */
  public async findChannelById(id: string): Promise<Channel> {
    if (isEmpty(id)) throw new HttpException(400, 'Not a valid channel');

    const findChannel: Channel = await this.channels.findOne({
      where: { id, isDeleted: false },
      attributes: { exclude: ['pk', 'isDeleted', 'updatedBy', 'createdBy'] },
    });
    if (!findChannel) throw new HttpException(409, 'Channel Not found');

    return findChannel;
  }

  /**
   * Create a new channel
   *
   * @param  {CreateChannelDto} channelData
   * @param  {number} currentUserId
   * @returns Promise<Channel>
   * @author Jaswant
   */
  public async createChannel(channelData: CreateChannelDto, currentUserPk: number): Promise<Channel> {
    if (isEmpty(channelData)) throw new HttpException(400, 'Channel Data cannot be blank');
    const currentDate = new Date();
    const newChannel = {
      name: channelData.name,
      description: channelData.description,
      channelType: <ChannelType>channelData.channelType,
      configJSON: channelData.configJSON,
      updatedAt: currentDate,
      createdAt: currentDate,
      createdBy: currentUserPk,
      updatedBy: currentUserPk,
      isDeleted: false,
    };
    const createChannelData: Channel = await this.channels.create(newChannel);
    return createChannelData;
  }

  public async updateChannel(channelId: string, channelData: CreateChannelDto, currentUserPk: number): Promise<Channel> {
    if (isEmpty(channelData)) throw new HttpException(400, 'Channel Data cannot be blank');
    const findChannel: Channel = await this.channels.findOne({ where: { id: channelId } });
    if (!findChannel) throw new HttpException(409, "Channel doesn't exist");
    const updatedChannelData = {
      ...channelData,
      channelType: <ChannelType>channelData.channelType,
      updatedBy: currentUserPk,
      updatedAt: new Date(),
    };
    await this.channels.update(updatedChannelData, { where: { id: channelId } });

    return this.findChannelById(channelId);
  }

  public async deleteChannel(channelId: string): Promise<Channel> {
    if (isEmpty(channelId)) throw new HttpException(400, 'Channelid is required');
    const findChannel: Channel = await this.channels.findOne({ where: { id: channelId } });
    if (!findChannel) throw new HttpException(409, "Channel doesn't exist");
    await this.channels.update({ isDeleted: true }, { where: { pk: findChannel.pk } });
    return findChannel;
  }

  public async getAccessGroupByChannels(channelPk: number): Promise<AccessGroupChannel[]> {
    const findAccessGroupChannels: AccessGroupChannel[] = await this.accessGroupChannel.findAll({
      where: { channelPk: channelPk, isDeleted: false },
      attributes: ['id'],
      include: [
        {
          model: AccessGroupModel,
          attributes: ['groupName', 'icon', 'description', 'id'],
        },
      ],
    });

    return findAccessGroupChannels;
  }
}

export default ChannelService;
