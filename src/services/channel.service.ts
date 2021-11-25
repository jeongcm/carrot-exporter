import DB from '@databases';
import { CreateChannelDto } from '@dtos/channel.dto';
import { HttpException } from '@exceptions/HttpException';
import { Channel } from '@interfaces/channel.interface';
import { isEmpty } from '@utils/util';
import { ChannelType, Platform } from '../enums';

class ChannelService {
  public channels = DB.Channel;

  public async findAllChannel(): Promise<Channel[]> {
    const allUser: Channel[] = await this.channels.findAll({ where: { isDeleted: false } });
    return allUser;
  }

  public async findChannelById(id: string): Promise<Channel> {
    if (isEmpty(id)) throw new HttpException(400, 'Not a valid channel');

    const findChannel: Channel = await this.channels.findByPk(id);
    if (!findChannel) throw new HttpException(409, 'Channel Not found');

    return findChannel;
  }

  public async createChannel(channelData: CreateChannelDto, currentUserId: string): Promise<Channel> {
    if (isEmpty(channelData)) throw new HttpException(400, 'Channel Data cannot be blank');
    let currentDate = new Date();
    let newChannel = {
      name: channelData.name,
      description: channelData.description,
      channelType: <ChannelType>channelData.channelType,
      configJSON: channelData.configJSON,
      updatedAt: currentDate,
      createdAt: currentDate,
      createdBy: currentUserId,
      updatedBy: currentUserId,
      isDeleted: false,
    };
    const createChannelData: Channel = await this.channels.create(newChannel);
    return createChannelData;
  }

  public async updateChannel(channelId: string, channelData: CreateChannelDto, currentUserId: string): Promise<Channel> {
    if (isEmpty(channelData)) throw new HttpException(400, 'Channel Data cannot be blank');
    const findChannel: Channel = await this.channels.findByPk(channelId);
    if (!findChannel) throw new HttpException(409, "Channel doesn't exist");
    let updatedChannelData = {
      ...channelData,
      channelType: <ChannelType>channelData.channelType,
      updatedBy: currentUserId,
      updatedAt: new Date(),
    };
    await this.channels.update(updatedChannelData, { where: { id: channelId } });
    const updateUser: Channel = await this.channels.findByPk(channelId);
    return updateUser;
  }

  public async deleteChannel(channelId: string): Promise<Channel> {
    if (isEmpty(channelId)) throw new HttpException(400, 'Channelid is required');
    const findChannel: Channel = await this.channels.findByPk(channelId);
    if (!findChannel) throw new HttpException(409, "Channel doesn't exist");
    await this.channels.update({ isDeleted: true }, { where: { id: channelId } });
    return findChannel;
  }
}

export default ChannelService;
