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
      where: { deletedAt: null },
      attributes: { exclude: ['channelKey', 'deletedAt', 'updatedBy', 'createdBy'] },
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
  public async findChannelById(channelId: string): Promise<Channel> {
    if (isEmpty(channelId)) throw new HttpException(400, 'Not a valid channel');

    const findChannel: Channel = await this.channels.findOne({
      where: { channelId, deletedAt: null },
      attributes: { exclude: ['channelId', 'deletedAt', 'updatedBy', 'createdBy'] },
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
  public async createChannel(channelData: CreateChannelDto, customerAccountKey: number, tempChannelId: string): Promise<Channel> {
    console.log("abc:",tempChannelId);
    if (isEmpty(channelData)) throw new HttpException(400, 'Channel Data cannot be blank');
    const currentDate = new Date();
    const newChannel = {
      channelId: tempChannelId,
      channelName: channelData.channelName,
      customerAccountKey: customerAccountKey,
      channelType: <ChannelType>channelData.channelType,
      channelDescription:channelData.channelDescription,
      channelAdaptor: channelData.channelAdaptor,
      updatedAt: currentDate,
      createdAt: currentDate,
      createdBy: customerAccountKey.toLocaleString(),
      updatedBy: customerAccountKey.toLocaleString(),
    };
    const createChannelData: Channel = await this.channels.create(newChannel);
    return createChannelData;
  }

  public async updateChannel(Id: string, channelData: CreateChannelDto, currentUserPk: number): Promise<Channel> {
    if (isEmpty(channelData)) throw new HttpException(400, 'Channel Data cannot be blank');
    const findChannel: Channel = await this.channels.findOne({ where: { channelId: Id } });
    if (!findChannel) throw new HttpException(409, "Channel doesn't exist");
    const updatedChannelData = {
      ...channelData,
      channelType: <ChannelType>channelData.channelType,
      updatedBy: currentUserPk.toLocaleString(),
      updatedAt: new Date(),
      createdBy: currentUserPk.toLocaleString()
    };
    await this.channels.update(updatedChannelData, { where: { channelId: Id } });

    return this.findChannelById(Id);
  }

}

export default ChannelService;
