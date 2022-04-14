import DB from '@/database';
import { CreateChannelDto } from '@/modules/Messaging/dtos/channel.dto';
import { HttpException } from '@/common/exceptions/HttpException';
import { Channel } from '@/common/interfaces/channel.interface';
import { isEmpty } from '@/common/utils/util';
import { ChannelType, Platform } from '../../../common/types';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';

/**
 * @memberof Messaging
 */
class ChannelService {
  public channels = DB.Channel;
  public accessGroupChannel = DB.AccessGroupChannel;
  public tableIdService = new TableIdService();
  public customerAccountService = new CustomerAccountService();

  /**
   * Find all channels
   *
   * @returns Promise<Channel[]>
   * @author Akshay
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
   * @author Akshay
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
   * @author Akshay
   */
  public async createChannel(channelData: CreateChannelDto, customerAccountKey: number, partyId: string): Promise<Channel> {
    if (isEmpty(channelData)) throw new HttpException(400, 'Channel Data cannot be blank');
    const tableIdName: string = 'Channel';
    const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdName);
    const tempChannelId: string = responseTableIdData.tableIdFinalIssued;

    const currentDate = new Date();
    const newChannel = {
      channelId: tempChannelId,
      channelName: channelData.channelName,
      customerAccountKey: customerAccountKey,
      channelType: <ChannelType>channelData.channelType,
      channelDescription: channelData.channelDescription,
      channelAdaptor: channelData.channelAdaptor,
      createdAt: currentDate,
      createdBy: partyId,
    };
    const createChannelData: Channel = await this.channels.create(newChannel);
    return createChannelData;
  }

  public async updateChannel(Id: string, channelData: CreateChannelDto, customerAccountKey: number, partyId: string): Promise<Channel> {
    if (isEmpty(channelData)) throw new HttpException(400, 'Channel Data cannot be blank');
    const findChannel: Channel = await this.channels.findOne({ where: { channelId: Id } });
    if (!findChannel) throw new HttpException(409, "Channel doesn't exist");
    const updatedChannelData = {
      ...channelData,
      channelType: <ChannelType>channelData.channelType,
      updatedBy: partyId,
      updatedAt: new Date(),
    };
    await this.channels.update(updatedChannelData, { where: { channelId: Id } });

    return this.findChannelById(Id);
  }
}

export default ChannelService;
